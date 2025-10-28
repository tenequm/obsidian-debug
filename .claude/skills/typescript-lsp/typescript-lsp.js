#!/usr/bin/env node

/**
 * TypeScript LSP Skill for Claude Code
 *
 * Provides full Language Server Protocol capabilities for TypeScript projects,
 * including resolving imported symbols from node_modules.
 *
 * Usage:
 *   node typescript-lsp.js <command> <file> <line> <character> [options]
 *
 * Commands:
 *   typeDefinition <file> <line> <char>  - Jump to type definition (resolves node_modules)
 *   definition <file> <line> <char>      - Jump to definition
 *   references <file> <line> <char>      - Find all references
 *   hover <file> <line> <char>           - Get type info and documentation
 *   rename <file> <line> <char> <name>   - Rename symbol (dry-run)
 *   diagnostics <file>                   - Get errors/warnings
 */

const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

// Configuration
const TIMEOUT_MS = 10000;
const PROJECT_ROOT = process.cwd();

// Parse command line arguments
const [,, command, filePath, line, character, ...extra] = process.argv;

if (!command) {
  console.error('Usage: typescript-lsp.js <command> <file> <line> <character> [options]');
  console.error('Commands: typeDefinition, definition, references, hover, rename, diagnostics');
  process.exit(1);
}

// LSP Client
class LSPClient {
  constructor() {
    this.lsp = null;
    this.buffer = '';
    this.messageId = 0;
    this.pendingRequests = new Map();
    this.initializeResult = null;
    this.diagnostics = new Map(); // uri -> Diagnostic[]
  }

  start() {
    return new Promise((resolve, reject) => {
      this.lsp = spawn('typescript-language-server', ['--stdio']);

      this.lsp.stdout.on('data', (data) => {
        this.buffer += data.toString();
        this.parseMessages();
      });

      this.lsp.stderr.on('data', (data) => {
        console.error('LSP stderr:', data.toString());
      });

      this.lsp.on('error', (error) => {
        reject(new Error(`Failed to start LSP: ${error.message}`));
      });

      setTimeout(() => resolve(), 100);
    });
  }

  parseMessages() {
    while (true) {
      const match = this.buffer.match(/Content-Length: (\d+)\r\n\r\n/);
      if (!match) break;

      const length = parseInt(match[1]);
      const headerEnd = this.buffer.indexOf('\r\n\r\n') + 4;

      if (this.buffer.length < headerEnd + length) break;

      const messageText = this.buffer.slice(headerEnd, headerEnd + length);
      this.buffer = this.buffer.slice(headerEnd + length);

      try {
        const message = JSON.parse(messageText);
        this.handleMessage(message);
      } catch (e) {
        console.error('Failed to parse LSP message:', e.message);
      }
    }
  }

  handleMessage(message) {
    // Handle push diagnostics
    if (message.method === 'textDocument/publishDiagnostics') {
      const { uri, diagnostics } = message.params;
      this.diagnostics.set(uri, diagnostics);
      return;
    }

    if (message.id !== undefined && this.pendingRequests.has(message.id)) {
      const { resolve, reject } = this.pendingRequests.get(message.id);
      this.pendingRequests.delete(message.id);

      if (message.error) {
        reject(new Error(`LSP error ${message.error.code}: ${message.error.message}`));
      } else {
        resolve(message.result);
      }
    }
  }

  sendMessage(message) {
    const json = JSON.stringify(message);
    const content = `Content-Length: ${Buffer.byteLength(json)}\r\n\r\n${json}`;
    this.lsp.stdin.write(content);
  }

  async request(method, params) {
    return new Promise((resolve, reject) => {
      const id = ++this.messageId;
      this.pendingRequests.set(id, { resolve, reject });

      const timeout = setTimeout(() => {
        this.pendingRequests.delete(id);
        reject(new Error(`Request ${method} timed out after ${TIMEOUT_MS}ms`));
      }, TIMEOUT_MS);

      this.pendingRequests.get(id).timeout = timeout;
      this.sendMessage({ jsonrpc: '2.0', id, method, params });
    });
  }

  async initialize() {
    const result = await this.request('initialize', {
      processId: process.pid,
      rootUri: `file://${PROJECT_ROOT}`,
      capabilities: {
        textDocument: {
          definition: { linkSupport: true },
          typeDefinition: { linkSupport: true },
          references: { dynamicRegistration: true },
          hover: { contentFormat: ['markdown', 'plaintext'] },
          rename: { prepareSupport: true },
          publishDiagnostics: { relatedInformation: true }
        }
      }
    });

    this.initializeResult = result;
    this.sendMessage({ jsonrpc: '2.0', method: 'initialized', params: {} });

    // Wait a bit for the server to settle
    await new Promise(resolve => setTimeout(resolve, 500));
  }

  async openDocument(uri, text) {
    this.sendMessage({
      jsonrpc: '2.0',
      method: 'textDocument/didOpen',
      params: {
        textDocument: {
          uri,
          languageId: 'typescript',
          version: 1,
          text
        }
      }
    });

    // Wait for document processing
    await new Promise(resolve => setTimeout(resolve, 300));
  }

  async shutdown() {
    if (this.lsp) {
      try {
        await this.request('shutdown', null);
        this.sendMessage({ jsonrpc: '2.0', method: 'exit', params: {} });
      } catch (e) {
        // Ignore shutdown errors
      }
      this.lsp.kill();
    }
  }
}

// Formatting utilities
function formatLocation(location) {
  if (!location) return null;

  const uri = location.uri || location.targetUri;
  const range = location.range || location.targetRange || location.targetSelectionRange;

  if (!uri || !range) return null;

  // Convert file:// URI to local path
  const filePath = uri.replace(/^file:\/\//, '');
  const line = range.start.line + 1; // Convert to 1-indexed
  const char = range.start.character + 1;

  return { filePath, line, char, range };
}

function formatLocations(locations) {
  if (!locations) return [];
  const arr = Array.isArray(locations) ? locations : [locations];
  return arr.map(formatLocation).filter(Boolean);
}

function readFileSnippet(filePath, line, contextLines = 2) {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    const lines = content.split('\n');
    const startLine = Math.max(0, line - contextLines - 1);
    const endLine = Math.min(lines.length, line + contextLines);

    return lines.slice(startLine, endLine).map((text, idx) => {
      const lineNum = startLine + idx + 1;
      const prefix = lineNum === line ? '>' : ' ';
      return `${prefix} ${lineNum.toString().padStart(4)} │ ${text}`;
    }).join('\n');
  } catch (e) {
    return null;
  }
}

// Command implementations
async function executeCommand(client, command, filePath, line, character, extra) {
  const absolutePath = path.resolve(PROJECT_ROOT, filePath);

  if (!fs.existsSync(absolutePath)) {
    throw new Error(`File not found: ${absolutePath}`);
  }

  const fileContent = fs.readFileSync(absolutePath, 'utf8');
  const uri = `file://${absolutePath}`;

  await client.openDocument(uri, fileContent);

  const position = {
    line: parseInt(line),
    character: parseInt(character)
  };

  switch (command) {
    case 'typeDefinition': {
      const result = await client.request('textDocument/typeDefinition', {
        textDocument: { uri },
        position
      });

      const locations = formatLocations(result);

      if (locations.length === 0) {
        console.log('❌ No type definition found');
        return;
      }

      console.log(`📍 Type Definition${locations.length > 1 ? 's' : ''}:\n`);

      for (const loc of locations) {
        console.log(`${loc.filePath}:${loc.line}:${loc.char}`);

        const snippet = readFileSnippet(loc.filePath, loc.line);
        if (snippet) {
          console.log('```typescript');
          console.log(snippet);
          console.log('```\n');
        }
      }
      break;
    }

    case 'definition': {
      const result = await client.request('textDocument/definition', {
        textDocument: { uri },
        position
      });

      const locations = formatLocations(result);

      if (locations.length === 0) {
        console.log('❌ No definition found');
        return;
      }

      console.log(`📍 Definition${locations.length > 1 ? 's' : ''}:\n`);

      for (const loc of locations) {
        console.log(`${loc.filePath}:${loc.line}:${loc.char}`);

        const snippet = readFileSnippet(loc.filePath, loc.line);
        if (snippet) {
          console.log('```typescript');
          console.log(snippet);
          console.log('```\n');
        }
      }
      break;
    }

    case 'references': {
      const result = await client.request('textDocument/references', {
        textDocument: { uri },
        position,
        context: { includeDeclaration: true }
      });

      const locations = formatLocations(result);

      if (locations.length === 0) {
        console.log('❌ No references found');
        return;
      }

      console.log(`🔍 Found ${locations.length} reference${locations.length > 1 ? 's' : ''}:\n`);

      // Group by file
      const byFile = {};
      for (const loc of locations) {
        if (!byFile[loc.filePath]) byFile[loc.filePath] = [];
        byFile[loc.filePath].push(loc);
      }

      for (const [file, locs] of Object.entries(byFile)) {
        console.log(`${file}:`);
        for (const loc of locs) {
          console.log(`  ${loc.line}:${loc.char}`);
        }
        console.log('');
      }
      break;
    }

    case 'hover': {
      const result = await client.request('textDocument/hover', {
        textDocument: { uri },
        position
      });

      if (!result || !result.contents) {
        console.log('❌ No hover information available');
        return;
      }

      console.log('ℹ️  Hover Information:\n');

      const contents = typeof result.contents === 'string'
        ? result.contents
        : result.contents.value || result.contents;

      console.log(contents);
      break;
    }

    case 'rename': {
      const newName = extra[0];
      if (!newName) {
        throw new Error('New name required for rename command');
      }

      const result = await client.request('textDocument/rename', {
        textDocument: { uri },
        position,
        newName
      });

      if (!result || !result.changes) {
        console.log('❌ No rename edits available');
        return;
      }

      console.log(`✏️  Rename Preview (dry-run for "${newName}"):\n`);

      let totalEdits = 0;
      for (const [fileUri, edits] of Object.entries(result.changes)) {
        const filePath = fileUri.replace(/^file:\/\//, '');
        console.log(`${filePath}:`);

        for (const edit of edits) {
          const line = edit.range.start.line + 1;
          const char = edit.range.start.character + 1;
          console.log(`  ${line}:${char} - "${edit.newText}"`);
          totalEdits++;
        }
        console.log('');
      }

      console.log(`Would modify ${totalEdits} location${totalEdits > 1 ? 's' : ''} across ${Object.keys(result.changes).length} file${Object.keys(result.changes).length > 1 ? 's' : ''}`);
      break;
    }

    case 'diagnostics': {
      // Wait for diagnostics to be published
      await new Promise(resolve => setTimeout(resolve, 1000));

      const diagnostics = client.diagnostics.get(uri) || [];

      if (diagnostics.length === 0) {
        console.log('✅ No diagnostics - file is clean!');
        return;
      }

      console.log(`⚠️  Found ${diagnostics.length} diagnostic${diagnostics.length > 1 ? 's' : ''}:\n`);

      for (const diag of diagnostics) {
        const severity = ['', 'Error', 'Warning', 'Info', 'Hint'][diag.severity || 1];
        const line = diag.range.start.line + 1;
        const char = diag.range.start.character + 1;

        console.log(`${severity} at ${line}:${char}`);
        console.log(`  ${diag.message}`);
        if (diag.source) console.log(`  (${diag.source})`);
        console.log('');
      }
      break;
    }

    default:
      throw new Error(`Unknown command: ${command}`);
  }
}

// Main execution
async function main() {
  const client = new LSPClient();

  try {
    await client.start();
    await client.initialize();
    await executeCommand(client, command, filePath, line, character, extra);
  } catch (error) {
    console.error(`\n❌ Error: ${error.message}\n`);
    process.exit(1);
  } finally {
    await client.shutdown();
  }
}

main();
