"use client";

import { useChat } from "@ai-sdk/react";
import type { ToolUIPart } from "ai";
import { Bot } from "lucide-react";
import type { FormEvent } from "react";
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
  PromptInputBody,
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
import {
  Tool,
  ToolContent,
  ToolHeader,
  ToolInput,
  ToolOutput,
} from "@/components/ai-elements/tool";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbList,
  BreadcrumbPage,
} from "@/components/ui/breadcrumb";
import { Separator } from "@/components/ui/separator";
import { SidebarTrigger } from "@/components/ui/sidebar";

export default function DebugPage() {
  const { messages, status, sendMessage } = useChat();

  const handleSubmit = (
    message: PromptInputMessage,
    e: FormEvent<HTMLFormElement>
  ) => {
    e.preventDefault();
    if (message.text?.trim()) {
      sendMessage({ text: message.text });
    }
  };

  const isLoading = status === "streaming" || status === "submitted";

  return (
    <>
      <header className="flex h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-12">
        <div className="flex items-center gap-2 px-4">
          <SidebarTrigger className="-ml-1" />
          <Separator
            className="mr-2 data-[orientation=vertical]:h-4"
            orientation="vertical"
          />
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbPage>Chat with Claude</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </div>
      </header>

      <div className="relative flex flex-1 flex-col divide-y">
        <Conversation>
          <ConversationContent className="mx-auto w-full max-w-3xl p-4">
            {messages.length === 0 ? (
              <div className="flex min-h-[60vh] items-center justify-center">
                <div className="space-y-4 px-4 text-center">
                  <Bot className="mx-auto h-12 w-12 text-muted-foreground" />
                  <div className="space-y-2">
                    <h2 className="font-semibold text-xl">
                      Chat with Claude Haiku 4.5
                    </h2>
                    <p className="text-muted-foreground">
                      Start a conversation by typing a message below
                    </p>
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
                <MessageAvatar src="" name="Claude" />
                <MessageContent>
                  <Loader />
                </MessageContent>
              </Message>
            )}
          </ConversationContent>
          <ConversationScrollButton />
        </Conversation>

        <div className="shrink-0">
          <div className="mx-auto w-full max-w-3xl p-4">
            <PromptInput onSubmit={handleSubmit}>
              <PromptInputBody>
                <PromptInputTextarea placeholder="Ask Claude anything..." />
              </PromptInputBody>
              <PromptInputTools>
                <PromptInputSubmit status={status} />
              </PromptInputTools>
            </PromptInput>
          </div>
        </div>
      </div>
    </>
  );
}
