"use client";

import {
  FormEvent,
  KeyboardEvent,
  PointerEvent as ReactPointerEvent,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import styles from "./page.module.css";

type MessageRole = "user" | "assistant";

type ChatMessage = {
  id: string;
  role: MessageRole;
  content: string;
  status?: "pending" | "done" | "error";
};

const introMessage: ChatMessage = {
  id: "intro",
  role: "assistant",
  content:
    "안녕! 나는 1년 후의 너야. 새해 목표와 고민에 대해 이야기해보자. 무엇이든 물어봐!",
  status: "done",
};

const SUGGESTIONS = [
  "그곳의 나는 어떤 모습이야?",
  "지금의 나에게 충고해줘",
  "내가 지금 뭘 해야할까?",
  "내가 세운 목표를 달성하려면 어떻게 해야 할까?",
  "올해 내가 주의해야 할 점이 있을까?",
];

const createId = () => {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }
  return Math.random().toString(36).slice(2);
};

export default function SelfChatPage() {
  const [messages, setMessages] = useState<ChatMessage[]>([introMessage]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const textareaRef = useRef<HTMLTextAreaElement | null>(null);
  const endRef = useRef<HTMLDivElement | null>(null);
  const messagesRef = useRef<HTMLDivElement | null>(null);

  const conversationHistory = useMemo(
    () =>
      messages
        .filter((message) => message.status !== "pending")
        .map((message) => ({
          role: message.role,
          content: message.content,
        })),
    [messages]
  );

  const hasUserMessage = useMemo(
    () => messages.some((m) => m.role === "user"),
    [messages]
  );

  const suggestRef = useRef<HTMLDivElement | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const dragState = useRef<{
    pointerDown: boolean;
    startX: number;
    scrollLeft: number;
    moved: boolean;
  }>({ pointerDown: false, startX: 0, scrollLeft: 0, moved: false });

  const onSuggestPointerDown = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (!suggestRef.current) return;
    dragState.current = {
      pointerDown: true,
      startX: event.clientX,
      scrollLeft: suggestRef.current.scrollLeft,
      moved: false,
    };
  };

  const onSuggestPointerMove = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (!dragState.current.pointerDown || !suggestRef.current) return;
    const dx = event.clientX - dragState.current.startX;

    if (!dragState.current.moved && Math.abs(dx) > 6) {
      dragState.current.moved = true;
      setIsDragging(true);
    }

    if (dragState.current.moved) {
      event.preventDefault();
      suggestRef.current.scrollLeft = dragState.current.scrollLeft - dx;
    }
  };

  const endSuggestionDrag = () => {
    dragState.current.pointerDown = false;
    setIsDragging(false);
    if (dragState.current.moved) {
      setTimeout(() => {
        dragState.current.moved = false;
      }, 0);
    }
  };

  const cancelSuggestionDrag = () => {
    dragState.current.pointerDown = false;
    dragState.current.moved = false;
    setIsDragging(false);
  };

  useEffect(() => {
    if (!textareaRef.current) return;
    const textarea = textareaRef.current;
    textarea.style.height = "auto";
    textarea.style.height = `${textarea.scrollHeight}px`;
  }, [input]);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const resetChat = () => {
    setMessages([introMessage]);
    setError(null);
    setIsLoading(false);
  };

  const submitMessage = async (rawText: string) => {
    const trimmed = rawText.trim();
    if (!trimmed || isLoading) return;

    const userMessage: ChatMessage = {
      id: createId(),
      role: "user",
      content: trimmed,
      status: "done",
    };

    const pendingMessage: ChatMessage = {
      id: createId(),
      role: "assistant",
      content: "생각을 정리하고 있어요...",
      status: "pending",
    };

    setInput("");
    setMessages((prev) => [...prev, userMessage, pendingMessage]);
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/self/chat/send", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          tone: localStorage.getItem("self_chat_tone") || "mild",
          query: trimmed,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to fetch AI response.");
      }

      const data = (await response.json()) as {
        reply?: string;
        error?: string;
        context?: any;
      };
      const reply = data.reply ?? "";

      if (!reply) {
        throw new Error(data.error || "응답이 비어 있습니다.");
      }

      setMessages((prev) =>
        prev.map((m) =>
          m.id === pendingMessage.id
            ? { ...m, content: reply, status: "done" }
            : m
        )
      );
    } catch (err) {
      console.error(err);
      setError("응답을 가져오지 못했습니다. 잠시 후 다시 시도해주세요.");
      setMessages((prev) =>
        prev.map((message) =>
          message.id === pendingMessage.id
            ? {
                ...message,
                content:
                  "죄송해요. 지금은 답변을 드릴 수 없어요. 잠시 후 다시 시도해주세요.",
                status: "error",
              }
            : message
        )
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (event?: FormEvent<HTMLFormElement>) => {
    event?.preventDefault();
    await submitMessage(input);
  };

  const sendSuggestion = (text: string) => {
    if (isLoading) return;
    if (dragState.current.moved) {
      dragState.current.moved = false;
      return;
    }
    void submitMessage(text);
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      void submitMessage(input);
    }
  };

  return (
    <main className={styles.chat_page} aria-label="AI와 나누는 새해 대화">
      <header className={styles.header_section}>
        <span className={styles.header_badge}>나와의 대화</span>
        <h1 className={styles.header_title}>
          미래의 나와 함께 이야기를 나누세요
        </h1>
        <p className={styles.header_subtitle}>
          새해 목표와 고민을 미리 학습된 AI와 함께 정리해보세요.
        </p>
      </header>

      <section className={styles.chat_container} aria-live="polite">
        <div className={styles.messages_area} ref={messagesRef}>
          {messages.map((message) => (
            <article
              key={message.id}
              className={`${styles.chat_bubble} ${
                message.role === "user"
                  ? styles.user_bubble
                  : styles.assistant_bubble
              } ${message.status === "error" ? styles.error_bubble : ""}`}
            >
              <div className={styles.bubble_meta}>
                <span className={styles.bubble_role}>
                  {message.role === "user" ? "나" : "1년 후의 나"}
                </span>
              </div>
              <p className={styles.bubble_text}>{message.content}</p>
            </article>
          ))}
          <div ref={endRef} />
        </div>

        {/* ▼ 아래로 스크롤 버튼 */}
        {/* <button
          type="button"
          className={styles.scroll_down_button}
          onClick={() =>
            endRef.current?.scrollIntoView({ behavior: "smooth", block: "end" })
          }
          aria-label="마지막 대화로 이동"
        >
          ↓
        </button> */}

        {/* 입력 영역 */}
        {error && (
          <div className={styles.error_banner} role="status">
            {error}
          </div>
        )}
        <form className={styles.composer_form} onSubmit={handleSubmit}>
          {!hasUserMessage && (
            <div className={styles.suggest_scroller}>
              <div
                ref={suggestRef}
                className={`${styles.suggest_track} ${
                  isDragging ? styles.dragging : ""
                }`}
                onPointerDownCapture={onSuggestPointerDown}
                onPointerMove={onSuggestPointerMove}
                onPointerUp={endSuggestionDrag}
                onPointerCancel={cancelSuggestionDrag}
                onPointerLeave={endSuggestionDrag}
                role="listbox"
                aria-label="추천 질문"
              >
                {SUGGESTIONS.map((q) => (
                  <button
                    key={q}
                    type="button"
                    className={styles.suggest_chip}
                    onClick={() => sendSuggestion(q)}
                  >
                    {q}
                  </button>
                ))}
              </div>
            </div>
          )}

          <textarea
            ref={textareaRef}
            className={styles.composer_input}
            value={input}
            placeholder="질문 또는 메시지를 입력하세요..."
            onChange={(event) => setInput(event.target.value)}
            onKeyDown={handleKeyDown}
            rows={1}
            aria-label="메시지 입력"
            disabled={isLoading}
          />
          <div className={styles.composer_actions}>
            <button
              type="button"
              className={styles.reset_button}
              onClick={resetChat}
              disabled={messages.length <= 1 || isLoading}
            >
              대화 초기화
            </button>
            <button
              type="submit"
              className={styles.send_button}
              disabled={!input.trim() || isLoading}
            >
              {isLoading ? "생각 중..." : "보내기"}
            </button>
          </div>
        </form>
        <p className={styles.helper_text}>
          Enter로 전송 · Shift + Enter로 줄 바꿈
        </p>
      </section>
    </main>
  );
}
