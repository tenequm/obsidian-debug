"use client";

import { useChat } from "@ai-sdk/react";
import type { ToolUIPart } from "ai";
import type { FormEvent } from "react";
import { useState } from "react";
import {
  Conversation,
  ConversationContent,
  ConversationScrollButton,
} from "@/components/ai-elements/conversation";
import { Loader } from "@/components/ai-elements/loader";
import {
  Message,
  MessageAvatar,
  MessageContent,
} from "@/components/ai-elements/message";
import {
  PromptInput,
  PromptInputFooter,
  type PromptInputMessage,
  PromptInputSubmit,
  PromptInputTextarea,
  PromptInputTools,
} from "@/components/ai-elements/prompt-input";
import {
  Reasoning,
  ReasoningContent,
  ReasoningTrigger,
} from "@/components/ai-elements/reasoning";
import { Response } from "@/components/ai-elements/response";
import { Suggestion, Suggestions } from "@/components/ai-elements/suggestion";
import {
  Tool,
  ToolContent,
  ToolHeader,
  ToolInput,
  ToolOutput,
} from "@/components/ai-elements/tool";
import { PageHeader } from "@/components/page-header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { isValidSignature } from "@/lib/solana/utils";

const EXAMPLE_TRANSACTION =
  "21TQdryJZpurVh2gFKpUMi6n1ypvvUUzaiUwynPBEbdMULwU5j5d7HiQwvReovoPZdW18bkKbnyKKWY4jUmj9WbT";

export default function DebugPage() {
  const { messages, status, sendMessage } = useChat();
  const [signature, setSignature] = useState("");
  const [signatureError, setSignatureError] = useState("");

  const handleSubmit = (
    message: PromptInputMessage,
    e: FormEvent<HTMLFormElement>
  ) => {
    e.preventDefault();
    if (message.text?.trim()) {
      sendMessage({ text: message.text });
    }
  };

  const handleSignatureChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSignature(value);

    // Validate if user has typed something
    if (value.trim()) {
      if (isValidSignature(value.trim())) {
        setSignatureError("");
      } else {
        setSignatureError(
          "Invalid transaction signature. Must be 87-88 base58 characters."
        );
      }
    } else {
      setSignatureError("");
    }
  };

  const handleSignatureSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const trimmedSignature = signature.trim();

    if (!trimmedSignature) {
      setSignatureError("Please enter a transaction signature.");
      return;
    }

    if (!isValidSignature(trimmedSignature)) {
      setSignatureError(
        "Invalid transaction signature. Must be 87-88 base58 characters."
      );
      return;
    }

    // Send the signature as a message
    sendMessage({ text: trimmedSignature });
    setSignature("");
    setSignatureError("");
  };

  const handleSuggestionClick = (suggestion: string) => {
    setSignature(suggestion);
    setSignatureError("");
  };

  const isLoading = status === "streaming" || status === "submitted";
  const isSignatureValid = signature.trim() && !signatureError;

  return (
    <>
      <PageHeader />

      <div className="relative flex size-full flex-col divide-y overflow-hidden">
        <Conversation>
          <ConversationContent className="mx-auto w-full max-w-4xl p-4">
            {messages.length === 0 ? (
              <div className="flex min-h-[60vh] items-center justify-center">
                <div className="w-full max-w-lg space-y-8 px-4">
                  <div className="space-y-3 text-center">
                    <h1 className="font-bold text-4xl tracking-tight">
                      Obsidian Debug
                    </h1>
                    <p className="text-lg text-muted-foreground">
                      AI-Powered Debugger for failed Solana transactions
                    </p>
                  </div>

                  <form className="space-y-4" onSubmit={handleSignatureSubmit}>
                    <div className="space-y-2">
                      <Label htmlFor="signature">Transaction Signature</Label>
                      <Input
                        aria-invalid={!!signatureError}
                        id="signature"
                        onChange={handleSignatureChange}
                        placeholder="Paste your failed transaction signature..."
                        type="text"
                        value={signature}
                      />
                      {signatureError && (
                        <p className="text-destructive text-sm">
                          {signatureError}
                        </p>
                      )}
                    </div>

                    <Button
                      className="w-full"
                      disabled={!isSignatureValid || isLoading}
                      type="submit"
                    >
                      {isLoading ? "Analyzing..." : "Debug Transaction"}
                    </Button>
                  </form>

                  <div className="space-y-3 text-center">
                    <p className="text-muted-foreground text-sm">
                      Or try an example:
                    </p>
                    <Suggestions className="justify-center">
                      <Suggestion
                        onClick={handleSuggestionClick}
                        suggestion={EXAMPLE_TRANSACTION}
                      >
                        Try failed swap transaction
                      </Suggestion>
                    </Suggestions>
                  </div>
                </div>
              </div>
            ) : (
              messages.map((message) => (
                <Message from={message.role} key={message.id}>
                  <MessageAvatar
                    name={message.role === "user" ? "You" : "Claude"}
                    src=""
                  />
                  <MessageContent>
                    {message.parts.map((part, partIndex) => {
                      if (part.type === "text") {
                        return (
                          <Response key={`${message.id}-text-${partIndex}`}>
                            {part.text}
                          </Response>
                        );
                      }

                      if (part.type === "reasoning") {
                        return (
                          <Reasoning
                            isStreaming={isLoading}
                            key={`${message.id}-reasoning-${partIndex}`}
                          >
                            <ReasoningTrigger />
                            <ReasoningContent>{part.text}</ReasoningContent>
                          </Reasoning>
                        );
                      }

                      if (part.type.startsWith("tool-")) {
                        const toolPart = part as ToolUIPart;
                        return (
                          <Tool
                            defaultOpen={false}
                            key={`${message.id}-tool-${partIndex}`}
                          >
                            <ToolHeader
                              state={toolPart.state}
                              type={toolPart.type}
                            />
                            <ToolContent>
                              {toolPart.input != null && (
                                <ToolInput input={toolPart.input} />
                              )}
                              {(toolPart.state === "output-available" ||
                                toolPart.state === "output-error") && (
                                <ToolOutput
                                  errorText={
                                    toolPart.errorText as string | undefined
                                  }
                                  output={toolPart.output}
                                />
                              )}
                            </ToolContent>
                          </Tool>
                        );
                      }

                      return null;
                    })}
                  </MessageContent>
                </Message>
              ))
            )}
            {isLoading && (
              <Message from="assistant">
                <MessageAvatar name="Claude" src="" />
                <MessageContent>
                  <Loader />
                </MessageContent>
              </Message>
            )}
          </ConversationContent>
          <ConversationScrollButton />
        </Conversation>

        {messages.length > 0 && (
          <div className="shrink-0">
            <div className="mx-auto w-full max-w-4xl p-4">
              <PromptInput onSubmit={handleSubmit}>
                <PromptInputTextarea />
                <PromptInputFooter>
                  <PromptInputTools>
                    {/* Future: Add action buttons here */}
                  </PromptInputTools>
                  <PromptInputSubmit status={status} />
                </PromptInputFooter>
              </PromptInput>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
