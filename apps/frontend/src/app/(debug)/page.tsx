"use client";

import { useChat } from "@ai-sdk/react";
import type { ToolUIPart } from "ai";
import type { FormEvent } from "react";
import { useEffect, useState } from "react";
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
import { Timeline } from "@/components/timeline";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { isValidSignature } from "@/lib/solana/validators";
import type { TransactionTimeline } from "@/lib/timeline/types";

const EXAMPLE_TRANSACTION =
  "21TQdryJZpurVh2gFKpUMi6n1ypvvUUzaiUwynPBEbdMULwU5j5d7HiQwvReovoPZdW18bkKbnyKKWY4jUmj9WbT";

export default function DebugPage() {
  const { messages, status, sendMessage, setMessages } = useChat();
  const [signature, setSignature] = useState("");
  const [signatureError, setSignatureError] = useState("");
  const [showTimelineSuggestion, setShowTimelineSuggestion] = useState(false);

  // Handle new debug session event from sidebar
  useEffect(() => {
    const handleNewDebugSession = () => {
      setMessages([]);
      setSignature("");
      setSignatureError("");
      setShowTimelineSuggestion(false);
    };

    window.addEventListener("new-debug-session", handleNewDebugSession);
    return () => {
      window.removeEventListener("new-debug-session", handleNewDebugSession);
    };
  }, [setMessages]);

  // Show timeline suggestion after assistant completes response
  useEffect(() => {
    const lastMessage = messages.at(-1);
    const isAssistantMessage = lastMessage?.role === "assistant";
    const isNotStreaming = status !== "streaming" && status !== "submitted";
    const hasTextContent = lastMessage?.parts?.some((p) => p.type === "text");

    if (isAssistantMessage && isNotStreaming && hasTextContent) {
      setShowTimelineSuggestion(true);
    }
  }, [messages, status]);

  const handleSubmit = (
    message: PromptInputMessage,
    e: FormEvent<HTMLFormElement>
  ) => {
    e.preventDefault();
    if (message.text?.trim()) {
      sendMessage({ text: message.text });
      setShowTimelineSuggestion(false); // Hide suggestion when user sends message
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
              messages.map((message, messageIndex) => (
                <Message from={message.role} key={message.id}>
                  <MessageAvatar
                    name={message.role === "user" ? "You" : "Claude"}
                    src=""
                  />
                  <MessageContent>
                    {message.parts.map((part, partIndex) => {
                      if (part.type === "text") {
                        // First user message: make the transaction signature clickable
                        if (messageIndex === 0 && message.role === "user") {
                          const txSignature = part.text?.trim() || "";
                          return (
                            <div key={`${message.id}-text-${partIndex}`}>
                              <a
                                className="font-mono underline hover:opacity-80"
                                href={`https://solscan.io/tx/${txSignature}`}
                                rel="noopener noreferrer"
                                target="_blank"
                              >
                                {txSignature}
                              </a>
                            </div>
                          );
                        }

                        return (
                          <Response key={`${message.id}-text-${partIndex}`}>
                            {part.text}
                          </Response>
                        );
                      }

                      if (part.type === "reasoning") {
                        return (
                          <Reasoning
                            defaultOpen={false}
                            isStreaming={isLoading}
                            key={`${message.id}-reasoning-${partIndex}`}
                          >
                            <ReasoningTrigger />
                            <ReasoningContent>{part.text}</ReasoningContent>
                          </Reasoning>
                        );
                      }

                      // Timeline tool rendering (before generic tool handler)
                      if (part.type === "tool-generateTimeline") {
                        const toolPart = part as ToolUIPart;
                        switch (toolPart.state) {
                          case "input-available":
                            return (
                              <div
                                className="mb-4"
                                key={`${message.id}-timeline-${partIndex}`}
                              >
                                <Card className="p-6">
                                  <div className="mb-6">
                                    <Skeleton className="mb-2 h-6 w-full max-w-xs" />
                                    <div className="mt-2 flex flex-wrap items-center gap-4">
                                      <Skeleton className="h-4 w-20" />
                                      <Skeleton className="h-4 w-1 rounded-full" />
                                      <Skeleton className="h-4 w-28" />
                                    </div>
                                  </div>
                                  <div className="space-y-0">
                                    {[1, 2, 3].map((i) => (
                                      <div
                                        className="relative mb-4 flex gap-4"
                                        key={i}
                                      >
                                        <Skeleton className="h-8 w-8 shrink-0 rounded-full" />
                                        <Card className="flex-1 p-4">
                                          <Skeleton className="mb-2 h-4 w-28" />
                                          <Skeleton className="mb-2 h-5 w-44" />
                                          <Skeleton className="h-4 w-full" />
                                        </Card>
                                      </div>
                                    ))}
                                  </div>
                                </Card>
                              </div>
                            );
                          case "output-available":
                            return (
                              <div
                                className="mb-4"
                                key={`${message.id}-timeline-${partIndex}`}
                              >
                                <Timeline
                                  timeline={
                                    toolPart.output as TransactionTimeline
                                  }
                                />
                              </div>
                            );
                          case "output-error":
                            return (
                              <div
                                className="mb-4"
                                key={`${message.id}-timeline-${partIndex}`}
                              >
                                <Card className="border-destructive p-4">
                                  <p className="text-destructive text-sm">
                                    Failed to generate timeline:{" "}
                                    {toolPart.errorText}
                                  </p>
                                </Card>
                              </div>
                            );
                          default:
                            return null;
                        }
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

        {showTimelineSuggestion && messages.length > 0 && (
          <div className="border-t bg-muted/30 px-4 py-3">
            <div className="mx-auto w-full max-w-4xl">
              <p className="mb-2 text-muted-foreground text-xs">
                Suggested action:
              </p>
              <Suggestions>
                <Suggestion
                  onClick={() => {
                    sendMessage({ text: "Show me a visual timeline" });
                    setShowTimelineSuggestion(false);
                  }}
                  suggestion="Show timeline"
                >
                  Show timeline
                </Suggestion>
              </Suggestions>
            </div>
          </div>
        )}

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
