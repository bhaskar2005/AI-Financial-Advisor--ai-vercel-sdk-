"use client";

import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport } from "ai";
import { useState, useRef, useEffect, useMemo, memo, useCallback } from "react";

// Icons as components for cleaner code
const SendIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="currentColor"
    className="w-5 h-5"
  >
    <path d="M3.478 2.405a.75.75 0 00-.926.94l2.432 7.905H13.5a.75.75 0 010 1.5H4.984l-2.432 7.905a.75.75 0 00.926.94 60.519 60.519 0 0018.445-8.986.75.75 0 000-1.218A60.517 60.517 0 003.478 2.405z" />
  </svg>
);

const StopIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="currentColor"
    className="w-5 h-5"
  >
    <path
      fillRule="evenodd"
      d="M4.5 7.5a3 3 0 013-3h9a3 3 0 013 3v9a3 3 0 01-3 3h-9a3 3 0 01-3-3v-9z"
      clipRule="evenodd"
    />
  </svg>
);

const BotIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="currentColor"
    className="w-5 h-5"
  >
    <path d="M12 2a2 2 0 012 2c0 .74-.4 1.39-1 1.73V7h1a7 7 0 017 7h1a1 1 0 011 1v3a1 1 0 01-1 1h-1v1a2 2 0 01-2 2H5a2 2 0 01-2-2v-1H2a1 1 0 01-1-1v-3a1 1 0 011-1h1a7 7 0 017-7h1V5.73c-.6-.34-1-.99-1-1.73a2 2 0 012-2zM7.5 13a1.5 1.5 0 100 3 1.5 1.5 0 000-3zm9 0a1.5 1.5 0 100 3 1.5 1.5 0 000-3z" />
  </svg>
);

const UserIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="currentColor"
    className="w-5 h-5"
  >
    <path
      fillRule="evenodd"
      d="M7.5 6a4.5 4.5 0 119 0 4.5 4.5 0 01-9 0zM3.751 20.105a8.25 8.25 0 0116.498 0 .75.75 0 01-.437.695A18.683 18.683 0 0112 22.5c-2.786 0-5.433-.608-7.812-1.7a.75.75 0 01-.437-.695z"
      clipRule="evenodd"
    />
  </svg>
);

const CopyIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="currentColor"
    className="w-4 h-4"
  >
    <path
      fillRule="evenodd"
      d="M7.502 6h7.128A3.375 3.375 0 0118 9.375v9.375a3 3 0 003-3V6.108c0-1.505-1.125-2.811-2.664-2.94a48.972 48.972 0 00-.673-.05A3 3 0 0015 1.5h-1.5a3 3 0 00-2.663 1.618c-.225.015-.45.032-.673.05C8.662 3.295 7.554 4.542 7.502 6zM13.5 3A1.5 1.5 0 0012 4.5h4.5A1.5 1.5 0 0015 3h-1.5z"
      clipRule="evenodd"
    />
    <path
      fillRule="evenodd"
      d="M3 9.375C3 8.339 3.84 7.5 4.875 7.5h9.75c1.036 0 1.875.84 1.875 1.875v11.25c0 1.035-.84 1.875-1.875 1.875h-9.75A1.875 1.875 0 013 20.625V9.375zm9.586 4.594a.75.75 0 00-1.172-.938l-2.476 3.096-.908-.907a.75.75 0 00-1.06 1.06l1.5 1.5a.75.75 0 001.116-.062l3-3.75z"
      clipRule="evenodd"
    />
  </svg>
);

const CheckIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="currentColor"
    className="w-4 h-4"
  >
    <path
      fillRule="evenodd"
      d="M19.916 4.626a.75.75 0 01.208 1.04l-9 13.5a.75.75 0 01-1.154.114l-6-6a.75.75 0 011.06-1.06l5.353 5.353 8.493-12.739a.75.75 0 011.04-.208z"
      clipRule="evenodd"
    />
  </svg>
);

const SunIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="currentColor"
    className="w-5 h-5"
  >
    <path d="M12 2.25a.75.75 0 01.75.75v2.25a.75.75 0 01-1.5 0V3a.75.75 0 01.75-.75zM7.5 12a4.5 4.5 0 119 0 4.5 4.5 0 01-9 0zM18.894 6.166a.75.75 0 00-1.06-1.06l-1.591 1.59a.75.75 0 101.06 1.061l1.591-1.59zM21.75 12a.75.75 0 01-.75.75h-2.25a.75.75 0 010-1.5H21a.75.75 0 01.75.75zM17.834 18.894a.75.75 0 001.06-1.06l-1.59-1.591a.75.75 0 10-1.061 1.06l1.59 1.591zM12 18a.75.75 0 01.75.75V21a.75.75 0 01-1.5 0v-2.25A.75.75 0 0112 18zM7.758 17.303a.75.75 0 00-1.061-1.06l-1.591 1.59a.75.75 0 001.06 1.061l1.591-1.59zM6 12a.75.75 0 01-.75.75H3a.75.75 0 010-1.5h2.25A.75.75 0 016 12zM6.697 7.757a.75.75 0 001.06-1.06l-1.59-1.591a.75.75 0 00-1.061 1.06l1.59 1.591z" />
  </svg>
);

const MoonIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="currentColor"
    className="w-5 h-5"
  >
    <path
      fillRule="evenodd"
      d="M9.528 1.718a.75.75 0 01.162.819A8.97 8.97 0 009 6a9 9 0 009 9 8.97 8.97 0 003.463-.69.75.75 0 01.981.98 10.503 10.503 0 01-9.694 6.46c-5.799 0-10.5-4.701-10.5-10.5 0-4.368 2.667-8.112 6.46-9.694a.75.75 0 01.818.162z"
      clipRule="evenodd"
    />
  </svg>
);

// Theme toggle component
const ThemeToggle = memo(
  ({
    theme,
    toggleTheme,
  }: {
    theme: "light" | "dark";
    toggleTheme: () => void;
  }) => {
    return (
      <button
        onClick={toggleTheme}
        className="relative w-10 h-10 rounded-xl bg-[var(--background)] border border-[var(--border)] hover:border-[var(--border-hover)] flex items-center justify-center text-[var(--foreground-muted)] hover:text-[var(--foreground)] transition-all duration-300 hover:shadow-sm"
        aria-label={`Switch to ${theme === "light" ? "dark" : "light"} mode`}
      >
        <span
          className={`absolute transition-all duration-300 ${
            theme === "light"
              ? "opacity-100 rotate-0 scale-100"
              : "opacity-0 rotate-90 scale-0"
          }`}
        >
          <MoonIcon />
        </span>
        <span
          className={`absolute transition-all duration-300 ${
            theme === "dark"
              ? "opacity-100 rotate-0 scale-100"
              : "opacity-0 -rotate-90 scale-0"
          }`}
        >
          <SunIcon />
        </span>
      </button>
    );
  }
);
ThemeToggle.displayName = "ThemeToggle";

// Streaming cursor component
const StreamingCursor = memo(() => (
  <span className="streaming-cursor" aria-hidden="true" />
));
StreamingCursor.displayName = "StreamingCursor";

// Typing indicator with animated dots
const TypingIndicator = memo(() => (
  <div className="flex items-center gap-1.5 px-4 py-3">
    <div className="w-2 h-2 rounded-full bg-[var(--mocha-400)] typing-dot" />
    <div className="w-2 h-2 rounded-full bg-[var(--mocha-400)] typing-dot" />
    <div className="w-2 h-2 rounded-full bg-[var(--mocha-400)] typing-dot" />
  </div>
));
TypingIndicator.displayName = "TypingIndicator";

// Message content renderer with markdown-like formatting
const MessageContent = memo(
  ({
    text,
    isStreaming,
    isUser,
  }: {
    text: string;
    isStreaming: boolean;
    isUser: boolean;
  }) => {
    // Simple text formatting: handle code blocks, inline code, bold, italic
    const formattedContent = useMemo(() => {
      if (!text) return null;

      // Split by code blocks first
      const parts = text.split(/(```[\s\S]*?```)/g);

      return parts.map((part, index) => {
        // Handle code blocks
        if (part.startsWith("```") && part.endsWith("```")) {
          const codeContent = part.slice(3, -3);
          const firstNewline = codeContent.indexOf("\n");
          const language =
            firstNewline > 0 ? codeContent.slice(0, firstNewline).trim() : "";
          const code =
            firstNewline > 0
              ? codeContent.slice(firstNewline + 1)
              : codeContent;

          return (
            <pre key={index} className="relative group">
              {language && (
                <span className="absolute top-2 right-2 text-xs text-[var(--mocha-400)] opacity-70">
                  {language}
                </span>
              )}
              <code>{code}</code>
            </pre>
          );
        }

        // Handle inline formatting
        return (
          <span key={index} className="streaming-text">
            {part.split(/(`[^`]+`)/g).map((segment, segIndex) => {
              if (segment.startsWith("`") && segment.endsWith("`")) {
                return <code key={segIndex}>{segment.slice(1, -1)}</code>;
              }
              // Handle bold and italic
              return segment
                .split(/(\*\*[^*]+\*\*)/g)
                .map((boldPart, boldIndex) => {
                  if (boldPart.startsWith("**") && boldPart.endsWith("**")) {
                    return (
                      <strong key={`${segIndex}-${boldIndex}`}>
                        {boldPart.slice(2, -2)}
                      </strong>
                    );
                  }
                  return boldPart
                    .split(/(\*[^*]+\*)/g)
                    .map((italicPart, italicIndex) => {
                      if (
                        italicPart.startsWith("*") &&
                        italicPart.endsWith("*")
                      ) {
                        return (
                          <em key={`${segIndex}-${boldIndex}-${italicIndex}`}>
                            {italicPart.slice(1, -1)}
                          </em>
                        );
                      }
                      return italicPart;
                    });
                });
            })}
          </span>
        );
      });
    }, [text]);

    return (
      <div
        className={`message-content text-[15px] leading-relaxed whitespace-pre-wrap break-words ${
          isStreaming ? "streaming-message" : ""
        }`}
      >
        {formattedContent}
        {isStreaming && !isUser && <StreamingCursor />}
      </div>
    );
  }
);
MessageContent.displayName = "MessageContent";

// Copy button component
const CopyButton = memo(({ text }: { text: string }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy:", err);
    }
  };

  return (
    <button
      onClick={handleCopy}
      className="opacity-0 group-hover:opacity-100 absolute top-2 right-2 p-1.5 rounded-lg bg-[var(--background-secondary)] hover:bg-[var(--border)] text-[var(--foreground-muted)] transition-all duration-200"
      aria-label={copied ? "Copied!" : "Copy message"}
    >
      {copied ? <CheckIcon /> : <CopyIcon />}
    </button>
  );
});
CopyButton.displayName = "CopyButton";

// Message bubble component
const MessageBubble = memo(
  ({
    message,
    isStreaming,
    isLast,
  }: {
    message: {
      id: string;
      role: string;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      parts: Array<any>;
    };
    isStreaming: boolean;
    isLast: boolean;
  }) => {
    const isUser = message.role === "user";

    // Check if there's a tool being called (state is "call" or "partial-call")
    const pendingTool = message.parts.find(
      (part) =>
        part.type?.startsWith("tool-") &&
        (part.state === "call" || part.state === "partial-call")
    );

    // Extract text from all part types including tool results
    const messageText = message.parts
      .map((part) => {
        // Handle regular text
        if (part.type === "text" && part.text) {
          return part.text;
        }
        // Handle tool results - type starts with "tool-" and has output
        if (
          part.type?.startsWith("tool-") &&
          part.state === "output-available" &&
          part.output
        ) {
          return part.output.message || JSON.stringify(part.output);
        }
        return "";
      })
      .filter(Boolean)
      .join("\n\n");

    // If there's no text but there's a pending tool, show loading
    const showToolLoading = !messageText && pendingTool;

    const timestamp = useMemo(
      () =>
        new Date().toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        }),
      []
    );

    // Get friendly tool name from type like "tool-getStockQuote"
    const getToolDisplayName = (toolType: string) => {
      const toolName = toolType.replace("tool-", "");
      const names: Record<string, string> = {
        getStockQuote: "📈 Fetching stock data",
        getCryptoPrice: "🪙 Getting crypto price",
        getTopCryptos: "📊 Loading top cryptos",
        getForexRate: "💱 Getting exchange rate",
        getMarketNews: "📰 Fetching market news",
        getFearGreedIndex: "😱 Checking market sentiment",
        getMarketOverview: "🌍 Loading market overview",
      };
      return names[toolName] || "🔍 Processing...";
    };

    return (
      <div
        className={`flex gap-3 message-animate group ${
          isUser ? "flex-row-reverse" : "flex-row"
        }`}
      >
        {/* Avatar */}
        <div
          className={`flex-shrink-0 w-9 h-9 rounded-xl flex items-center justify-center shadow-sm transition-transform duration-200 ${
            isUser
              ? "bg-[var(--accent)] text-white"
              : "bg-[var(--background-secondary)] text-[var(--foreground-muted)] border border-[var(--border)]"
          } ${
            (isStreaming || showToolLoading) && !isUser ? "animate-pulse" : ""
          }`}
        >
          {isUser ? <UserIcon /> : <BotIcon />}
        </div>

        {/* Message Bubble */}
        <div
          className={`relative max-w-[75%] px-4 py-3 rounded-2xl shadow-sm theme-transition ${
            isLast && !isUser ? "bubble-animate" : ""
          } ${
            isUser
              ? "bg-[var(--accent)] text-white rounded-tr-md"
              : "bg-[var(--ai-bubble)] text-[var(--ai-bubble-text)] border border-[var(--border)] rounded-tl-md"
          }`}
        >
          {/* Copy button for AI messages */}
          {!isUser && messageText && <CopyButton text={messageText} />}

          {/* Tool loading indicator */}
          {showToolLoading && pendingTool && (
            <div className="flex items-center gap-2 text-[var(--foreground-muted)]">
              <div className="flex gap-1">
                <div className="w-2 h-2 rounded-full bg-[var(--accent)] typing-dot" />
                <div className="w-2 h-2 rounded-full bg-[var(--accent)] typing-dot" />
                <div className="w-2 h-2 rounded-full bg-[var(--accent)] typing-dot" />
              </div>
              <span className="text-sm">
                {getToolDisplayName(pendingTool.type)}
              </span>
            </div>
          )}

          {/* Regular message content */}
          {messageText && (
            <MessageContent
              text={messageText}
              isStreaming={isStreaming && isLast && !isUser}
              isUser={isUser}
            />
          )}

          <span
            className={`text-[10px] mt-1.5 block ${
              isUser
                ? "text-white/70 text-right"
                : "text-[var(--foreground-muted)]"
            }`}
          >
            {timestamp}
          </span>
        </div>
      </div>
    );
  }
);
MessageBubble.displayName = "MessageBubble";

export default function Page() {
  const [input, setInput] = useState("");
  const [theme, setTheme] = useState<"light" | "dark">("light");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const { messages, sendMessage, status, stop } = useChat({
    transport: new DefaultChatTransport({ api: "/api/chat" }),
  });

  const isLoading = status === "streaming" || status === "submitted";
  const isStreaming = status === "streaming";

  // Initialize theme from localStorage or system preference
  useEffect(() => {
    const savedTheme = localStorage.getItem("theme") as "light" | "dark" | null;
    if (savedTheme) {
      setTheme(savedTheme);
      document.documentElement.setAttribute("data-theme", savedTheme);
    } else if (window.matchMedia("(prefers-color-scheme: dark)").matches) {
      setTheme("dark");
      document.documentElement.setAttribute("data-theme", "dark");
    }
  }, []);

  // Toggle theme function
  const toggleTheme = useCallback(() => {
    const newTheme = theme === "light" ? "dark" : "light";
    setTheme(newTheme);
    document.documentElement.setAttribute("data-theme", newTheme);
    localStorage.setItem("theme", newTheme);
  }, [theme]);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, status]);

  // Focus input on mount
  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || status !== "ready") return;
    sendMessage({ text: input });
    setInput("");
  };

  const handleStop = () => {
    stop();
  };

  // Keyboard shortcut for sending (Enter) and new line (Shift+Enter)
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  return (
    <div className="flex flex-col h-screen bg-[var(--background)] theme-transition">
      {/* Header */}
      <header className="sticky top-0 z-10 bg-[var(--background-secondary)] border-b border-[var(--border)] px-4 py-3 backdrop-blur-sm theme-transition">
        <div className="max-w-3xl mx-auto flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[var(--accent)] flex items-center justify-center text-white shadow-sm">
            <BotIcon />
          </div>
          <div>
            <h1 className="text-lg font-semibold text-[var(--foreground)]">
              Financial Advisor
            </h1>
            <p className="text-sm text-[var(--foreground-muted)]">
              Investment & Portfolio Expert
            </p>
          </div>
          <div className="ml-auto flex items-center gap-3">
            <span
              className={`inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full transition-all duration-300 ${
                status === "ready"
                  ? "bg-[var(--status-online-bg)] text-[var(--status-online-text)]"
                  : status === "streaming"
                  ? "bg-[var(--background)] text-[var(--foreground-muted)] border border-[var(--border)]"
                  : "bg-[var(--status-thinking-bg)] text-[var(--status-thinking-text)]"
              }`}
            >
              <span
                className={`w-1.5 h-1.5 rounded-full transition-all duration-300 ${
                  status === "ready"
                    ? "bg-[var(--status-online-dot)]"
                    : status === "streaming"
                    ? "bg-[var(--accent)] animate-pulse"
                    : "bg-[var(--status-thinking-dot)] animate-pulse"
                }`}
              />
              {status === "ready"
                ? "Online"
                : status === "streaming"
                ? "Responding..."
                : "Thinking..."}
            </span>
            <ThemeToggle theme={theme} toggleTheme={toggleTheme} />
          </div>
        </div>
      </header>

      {/* Messages Container */}
      <main className="flex-1 overflow-y-auto">
        <div className="max-w-3xl mx-auto px-4 py-6">
          {/* Empty state */}
          {messages.length === 0 && (
            <div className="flex flex-col items-center justify-center h-[60vh] text-center">
              <div className="w-20 h-20 rounded-2xl bg-[var(--background-secondary)] border border-[var(--border)] flex items-center justify-center mb-6 theme-transition">
                <div className="w-12 h-12 rounded-xl bg-[var(--accent)] flex items-center justify-center text-white">
                  <BotIcon />
                </div>
              </div>
              <h2 className="text-2xl font-semibold text-[var(--foreground)] mb-2">
                How can I help you today?
              </h2>
              <p className="text-[var(--foreground-muted)] max-w-md mb-8">
                I&apos;m your personal financial advisor. Ask me about
                investments, market trends, portfolio strategies, or
                personalized financial planning.
              </p>
              <div className="flex flex-wrap gap-2 justify-center max-w-lg">
                {[
                  "What's the current price of Bitcoin?",
                  "Show me Apple stock (AAPL)",
                  "What's the USD to EUR exchange rate?",
                  "Show me top 5 cryptocurrencies",
                ].map((suggestion) => (
                  <button
                    key={suggestion}
                    onClick={() => {
                      setInput(suggestion);
                      inputRef.current?.focus();
                    }}
                    className="px-4 py-2 text-sm bg-[var(--background-secondary)] text-[var(--foreground-muted)] rounded-xl border border-[var(--border)] hover:border-[var(--border-hover)] hover:text-[var(--foreground)] transition-all duration-200 theme-transition"
                  >
                    {suggestion}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Messages */}
          <div className="flex flex-col gap-6">
            {messages.map((message, index) => (
              <MessageBubble
                key={message.id}
                message={message}
                isStreaming={isStreaming}
                isLast={index === messages.length - 1}
              />
            ))}

            {/* Typing indicator - only show when submitted but not yet streaming */}
            {status === "submitted" && (
              <div className="flex gap-3 message-animate">
                <div className="flex-shrink-0 w-9 h-9 rounded-xl bg-[var(--background-secondary)] border border-[var(--border)] text-[var(--foreground-muted)] flex items-center justify-center shadow-sm animate-pulse">
                  <BotIcon />
                </div>
                <div className="bg-[var(--ai-bubble)] border border-[var(--border)] rounded-2xl rounded-tl-md shadow-sm">
                  <TypingIndicator />
                </div>
              </div>
            )}
          </div>
          <div ref={messagesEndRef} />
        </div>
      </main>

      {/* Input Area */}
      <footer className="sticky bottom-0 bg-[var(--background)] border-t border-[var(--border)] px-4 py-4 theme-transition">
        <div className="max-w-3xl mx-auto">
          <form
            onSubmit={handleSubmit}
            className="relative flex items-center gap-3"
          >
            <div className="flex-1 relative">
              <input
                ref={inputRef}
                value={input}
                placeholder={
                  isLoading ? "Waiting for response..." : "Type your message..."
                }
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                disabled={status !== "ready"}
                className="w-full py-3.5 px-5 pr-12 bg-[var(--input-bg)] text-[var(--foreground)] placeholder:text-[var(--foreground-muted)] rounded-2xl border border-[var(--border)] focus:outline-none focus:border-[var(--accent)] focus:ring-2 focus:ring-[var(--accent)]/20 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed text-[15px] theme-transition"
              />
            </div>
            {isLoading ? (
              <button
                type="button"
                onClick={handleStop}
                className="flex-shrink-0 w-12 h-12 rounded-xl bg-red-500 text-white flex items-center justify-center hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-300 focus:ring-offset-2 transition-all duration-200 shadow-sm hover:shadow-md active:scale-95"
                aria-label="Stop generation"
              >
                <StopIcon />
              </button>
            ) : (
              <button
                type="submit"
                disabled={!input.trim() || status !== "ready"}
                className="flex-shrink-0 w-12 h-12 rounded-xl bg-[var(--accent)] text-white flex items-center justify-center hover:bg-[var(--accent-hover)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)]/50 focus:ring-offset-2 disabled:opacity-40 disabled:cursor-not-allowed transition-all duration-200 shadow-sm hover:shadow-md active:scale-95"
                aria-label="Send message"
              >
                <SendIcon />
              </button>
            )}
          </form>
          <p className="text-center text-xs text-[var(--foreground-muted)] mt-3">
            Not financial advice. Consult a licensed professional before making
            investment decisions.
          </p>
        </div>
      </footer>
    </div>
  );
}
