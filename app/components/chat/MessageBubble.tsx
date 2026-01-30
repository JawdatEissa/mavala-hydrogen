/**
 * MessageBubble - Individual message display
 *
 * Renders user and assistant messages with appropriate styling,
 * and shows product suggestions when available.
 */

import { Link } from "@remix-run/react";
import type { ChatMessage } from "~/lib/chat.types";
import ProductCard from "./ProductCard";

interface MessageBubbleProps {
  message: ChatMessage;
}

export default function MessageBubble({ message }: MessageBubbleProps) {
  const isUser = message.role === "user";
  const isError = message.meta?.error;
  const products = message.meta?.products || [];

  return (
    <div className={`flex ${isUser ? "justify-end" : "justify-start"}`}>
      <div
        className={`max-w-[85%] ${
          isUser
            ? "bg-[#E31837] text-white rounded-2xl rounded-br-md"
            : isError
            ? "bg-red-50 text-red-700 border border-red-200 rounded-2xl rounded-bl-md"
            : "bg-white text-gray-800 border border-gray-200 rounded-2xl rounded-bl-md shadow-sm"
        } px-4 py-2.5`}
      >
        {/* Message content */}
        <div
          className={`text-sm leading-relaxed whitespace-pre-wrap ${
            isUser ? "" : "prose prose-sm max-w-none"
          }`}
        >
          {formatMessage(message.content)}
        </div>

        {/* Cached badge (for debugging/info) */}
        {message.meta?.cached && (
          <div className="mt-1">
            <span className="inline-flex items-center px-1.5 py-0.5 text-[10px] font-medium bg-green-100 text-green-700 rounded">
              cached
            </span>
          </div>
        )}

        {/* Product suggestions */}
        {!isUser && products.length > 0 && (
          <div className="mt-3 pt-3 border-t border-gray-100">
            <p className="text-xs text-gray-500 mb-2 font-medium">
              Recommended products:
            </p>
            <div className="space-y-2">
              {products.map((product) => (
                <ProductCard key={product.handle} product={product} />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

/**
 * Format message content - handle markdown-style links
 */
function formatMessage(content: string): React.ReactNode {
  // Simple markdown link parsing: [text](url)
  const linkRegex = /\[([^\]]+)\]\(([^)]+)\)/g;
  const parts: React.ReactNode[] = [];
  let lastIndex = 0;
  let match: RegExpExecArray | null;

  while ((match = linkRegex.exec(content)) !== null) {
    // Add text before the link
    if (match.index > lastIndex) {
      parts.push(content.slice(lastIndex, match.index));
    }

    // Add the link
    const [, text, url] = match;
    const isExternal = url.startsWith("http");

    if (isExternal) {
      parts.push(
        <a
          key={match.index}
          href={url}
          target="_blank"
          rel="noopener noreferrer"
          className="text-[#E31837] underline hover:no-underline"
        >
          {text}
        </a>,
      );
    } else {
      parts.push(
        <Link
          key={match.index}
          to={url}
          className="text-[#E31837] underline hover:no-underline"
        >
          {text}
        </Link>,
      );
    }

    lastIndex = match.index + match[0].length;
  }

  // Add remaining text
  if (lastIndex < content.length) {
    parts.push(content.slice(lastIndex));
  }

  return parts.length > 0 ? parts : content;
}
