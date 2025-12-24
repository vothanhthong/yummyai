import React, { useState, useRef, useEffect, useCallback } from "react";
import { Message, Recipe } from "../types";
import { Icons, COLORS } from "../constants";
import { getChatResponse } from "../services/openRouterService";
import { saveMessage, getChatHistory, getOlderMessages } from "../services/supabaseChatService";
import { RecipeCard } from "./RecipeCard";
import { DEFAULT_SUGGESTIONS } from "../services/supabaseQuickSuggestionsService";

interface QuickSuggestionItem {
  label: string;
  prompt: string;
}

interface ChatViewProps {
  onSaveRecipe: (recipe: Recipe) => void;
  onViewRecipe: (recipe: Recipe) => void;
  savedIdentifiers: Set<string>;
  quickSuggestions?: QuickSuggestionItem[];
}

export const ChatView: React.FC<ChatViewProps> = ({
  onSaveRecipe,
  onViewRecipe,
  savedIdentifiers,
  quickSuggestions,
}) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [hasMoreMessages, setHasMoreMessages] = useState(false);
  const [oldestTimestamp, setOldestTimestamp] = useState<number | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const loadMoreTriggerRef = useRef<HTMLDivElement>(null);
  const shouldScrollToBottom = useRef(true); // Track if we should scroll to bottom

  // Load initial messages (latest 25)
  useEffect(() => {
    const loadHistory = async () => {
      try {
        const result = await getChatHistory();
        if (result.messages.length === 0) {
          setMessages([
            {
              id: "1",
              role: "assistant",
              content:
                'Chào bạn! Hôm nay bạn muốn nấu gì nào? Hoặc cứ hỏi "Hôm nay ăn gì" để mình gợi ý nhé! 🍲',
              timestamp: Date.now(),
            },
          ]);
          setHasMoreMessages(false);
        } else {
          setMessages(result.messages);
          setHasMoreMessages(result.hasMore);
          setOldestTimestamp(result.oldestTimestamp);
        }
      } catch (error) {
        console.error("Error loading chat history:", error);
        setMessages([
          {
            id: "1",
            role: "assistant",
            content:
              'Chào bạn! Hôm nay bạn muốn nấu gì nào? Hoặc cứ hỏi "Hôm nay ăn gì" để mình gợi ý nhé! 🍲',
            timestamp: Date.now(),
          },
        ]);
      } finally {
        setIsInitialized(true);
      }
    };

    loadHistory();
  }, []);

  // Load more messages when scrolling to top
  const loadMoreMessages = useCallback(async () => {
    if (isLoadingMore || !hasMoreMessages || !oldestTimestamp) return;
    
    shouldScrollToBottom.current = false; // Don't scroll to bottom when loading older messages
    setIsLoadingMore(true);
    
    // Lưu lại scroll position trước khi load
    const container = messagesContainerRef.current;
    const previousScrollHeight = container?.scrollHeight || 0;
    
    try {
      const result = await getOlderMessages(oldestTimestamp);
      
      if (result.messages.length > 0) {
        setMessages(prev => [...result.messages, ...prev]);
        setHasMoreMessages(result.hasMore);
        setOldestTimestamp(result.oldestTimestamp);
        
        // Restore scroll position sau khi thêm messages
        requestAnimationFrame(() => {
          if (container) {
            const newScrollHeight = container.scrollHeight;
            container.scrollTop = newScrollHeight - previousScrollHeight;
          }
        });
      } else {
        setHasMoreMessages(false);
      }
    } catch (error) {
      console.error("Error loading more messages:", error);
    } finally {
      setIsLoadingMore(false);
    }
  }, [isLoadingMore, hasMoreMessages, oldestTimestamp]);

  // Intersection Observer for infinite scroll
  useEffect(() => {
    if (!isInitialized || !hasMoreMessages) return;
    
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && !isLoadingMore) {
          loadMoreMessages();
        }
      },
      { threshold: 0.1 }
    );
    
    const trigger = loadMoreTriggerRef.current;
    if (trigger) {
      observer.observe(trigger);
    }
    
    return () => {
      if (trigger) {
        observer.unobserve(trigger);
      }
    };
  }, [isInitialized, hasMoreMessages, isLoadingMore, loadMoreMessages]);

  // Scroll to bottom only when sending/receiving new messages, not when loading older
  useEffect(() => {
    if (!isInitialized) return;
    if (shouldScrollToBottom.current) {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages.length, isInitialized]);

  // Save new messages to Supabase
  useEffect(() => {
    if (!isInitialized) return;

    const saveToSupabase = async () => {
      const lastMessage = messages[messages.length - 1];
      // Chỉ lưu tin nhắn mới (id là timestamp string, không phải UUID từ DB)
      if (lastMessage && !lastMessage.id.includes("-")) {
        try {
          await saveMessage(lastMessage);
        } catch (error) {
          console.error("Error saving message:", error);
        }
      }
    };

    saveToSupabase();
  }, [messages, isInitialized]);

  const handleSend = async (customText?: string) => {
    const textToSend = customText || input;
    if (!textToSend.trim() || isLoading) return;

    shouldScrollToBottom.current = true; // Scroll to bottom for new messages

    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: textToSend,
      timestamp: Date.now(),
    };

    const newMessages = [...messages, userMessage];
    setMessages(newMessages);
    setInput("");
    setIsLoading(true);

    const history = messages.slice(-6).map((m) => ({
      role: m.role,
      content: m.content,
    }));

    const recentlySuggested = messages
      .filter((m) => m.recipe)
      .map((m) => m.recipe?.name || "");

    const response = await getChatResponse(
      textToSend,
      history,
      recentlySuggested
    );

    const assistantMessage: Message = {
      id: (Date.now() + 1).toString(),
      role: "assistant",
      content: response.text,
      recipe: response.recipe,
      timestamp: Date.now(),
    };

    setMessages((prev) => [...prev, assistantMessage]);
    setIsLoading(false);
  };

  const isRecipeSaved = (recipe?: Recipe) => {
    if (!recipe) return false;
    return (
      (recipe.id && savedIdentifiers.has(recipe.id)) ||
      (recipe.name && savedIdentifiers.has(recipe.name))
    );
  };

  return (
    <div className="flex flex-col h-full w-full max-w-4xl mx-auto bg-white md:shadow-2xl md:rounded-3xl overflow-hidden md:border border-gray-100 flex-1">
      <div 
        ref={messagesContainerRef}
        className="flex-1 overflow-y-auto p-4 md:p-6 space-y-6"
      >
        {/* Load more trigger */}
        {hasMoreMessages && (
          <div ref={loadMoreTriggerRef} className="flex justify-center py-4">
            {isLoadingMore ? (
              <div className="flex items-center gap-2 text-gray-400 text-sm">
                <div className="w-4 h-4 border-2 border-gray-300 border-t-lime-600 rounded-full animate-spin"></div>
                <span>Đang tải tin nhắn cũ...</span>
              </div>
            ) : (
              <button
                onClick={loadMoreMessages}
                className="text-lime-600 text-sm font-medium hover:underline"
              >
                Tải thêm tin nhắn cũ
              </button>
            )}
          </div>
        )}

        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex flex-col ${
              msg.role === "user" ? "items-end" : "items-start"
            }`}
          >
            <div
              className={`max-w-[85%] md:max-w-[80%] p-3.5 md:p-5 rounded-2xl shadow-sm ${
                msg.role === "user"
                  ? "bg-lime-600 text-white rounded-tr-none"
                  : "bg-gray-100 text-gray-800 rounded-tl-none"
              }`}
            >
              <p className="text-sm md:text-base whitespace-pre-wrap leading-relaxed">
                {msg.content}
              </p>
            </div>

            {msg.recipe && (
              <div className="mt-4 w-full max-w-[95%] md:max-w-[85%] animate-in fade-in slide-in-from-bottom-2 duration-500">
                <RecipeCard
                  recipe={msg.recipe}
                  onSave={onSaveRecipe}
                  onView={onViewRecipe}
                  isSaved={isRecipeSaved(msg.recipe)}
                />
              </div>
            )}
          </div>
        ))}
        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-gray-100 p-4 rounded-2xl rounded-tl-none flex gap-1.5 shadow-sm">
              <div
                className="w-1.5 h-1.5 bg-lime-500 rounded-full animate-bounce"
                style={{ animationDelay: "0ms" }}
              />
              <div
                className="w-1.5 h-1.5 bg-lime-500 rounded-full animate-bounce"
                style={{ animationDelay: "150ms" }}
              />
              <div
                className="w-1.5 h-1.5 bg-lime-500 rounded-full animate-bounce"
                style={{ animationDelay: "300ms" }}
              />
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <div className="p-4 md:p-6 border-t border-gray-100 bg-white shrink-0">
        <div className="flex gap-2 overflow-x-auto pb-3 mb-3 no-scrollbar scroll-smooth">
          {(quickSuggestions && quickSuggestions.length > 0 ? quickSuggestions : DEFAULT_SUGGESTIONS).map((suggestion, index) => (
            <button
              key={index}
              onClick={() => handleSend(suggestion.prompt)}
              disabled={isLoading}
              className="whitespace-nowrap px-4 py-2 bg-lime-50 hover:bg-lime-100 text-lime-700 border border-lime-100 rounded-full text-[11px] md:text-xs font-bold transition-all disabled:opacity-50 shrink-0 shadow-sm"
            >
              {suggestion.label}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-3">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSend()}
            placeholder="Bạn muốn nấu gì hôm nay?..."
            className="flex-1 min-w-0 px-5 py-4 bg-gray-50 text-gray-900 border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-lime-500 focus:bg-white transition-all text-sm md:text-base shadow-inner"
          />
          <button
            onClick={() => handleSend()}
            disabled={!input.trim() || isLoading}
            className="flex-shrink-0 p-4 bg-lime-600 text-white rounded-2xl hover:bg-lime-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-all shadow-lg shadow-lime-100 active:scale-95"
            aria-label="Send"
          >
            <Icons.Send />
          </button>
        </div>
      </div>

      <style>{`
        .no-scrollbar::-webkit-scrollbar {
          display: none;
        }
        .no-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>
    </div>
  );
};
