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
import LoadingIndicator from "@/components/loadingIndicator/loadingIndicator";
import Modal from "@/components/modal/modal";
import { LoadingButton } from "@/components/loadingButton/loadingButton";

const DAILY_CHAT_LIMIT = 10;

type MessageRole = "user" | "assistant";

type ChatMessage = {
  id: string;
  role: MessageRole;
  content: string;
  status?: "pending" | "done" | "error";
  createdAt?: string;
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

const MAX_INPUT_LENGTH = 100;

const formatTime = (dateString?: string) => {
  if (!dateString) return "";
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);
  const diffMonths = Math.floor(diffMs / 2592000000);

  if (diffMins < 1) return "방금 전";
  if (diffMins < 60) return `${diffMins}분 전`;
  if (diffHours < 24) return `${diffHours}시간 전`;
  if (diffDays < 7) return `${diffDays}일 전`;
  if (diffMonths < 1) return `${diffMonths}개월 전`;

  return `${date.getFullYear()}.${date.getMonth() + 1}.${date.getDate()}`;
};

export default function SelfChatPage() {
  const [messages, setMessages] = useState<ChatMessage[]>([introMessage]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loadingHistory, setLoadingHistory] = useState(true);
  const [showResetModal, setShowResetModal] = useState(false);
  const [showScrollDown, setShowScrollDown] = useState(false);
  const [tone, setTone] = useState<"mild" | "spicy">(() => {
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem("self_chat_tone");
      if (stored === "mild" || stored === "spicy") {
        return stored;
      }
    }
    return "mild";
  });

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

  // 스크롤 위치 감지
  useEffect(() => {
    const messagesArea = messagesRef.current;
    if (!messagesArea) return;

    const checkScroll = () => {
      const { scrollTop, scrollHeight, clientHeight } = messagesArea;
      const isNearBottom = scrollHeight - scrollTop - clientHeight < 100;
      setShowScrollDown(!isNearBottom && scrollHeight > clientHeight);
    };

    checkScroll();
    messagesArea.addEventListener("scroll", checkScroll);
    return () => messagesArea.removeEventListener("scroll", checkScroll);
  }, [messages]);

  // 대화 이력 불러오기
  useEffect(() => {
    const loadHistory = async () => {
      try {
        const response = await fetch("/api/self/chat/history");
        if (response.ok) {
          const data = (await response.json()) as {
            messages?: Array<{
              id: string;
              role: string;
              content: string;
              createdAt: string;
            }>;
          };
          if (data.messages && data.messages.length > 0) {
            const historyMessages: ChatMessage[] = data.messages.map((msg) => ({
              id: msg.id,
              role: msg.role as MessageRole,
              content: msg.content,
              status: "done",
              createdAt: msg.createdAt,
            }));
            // 이력이 있으면 intro 메시지 없이 시작
            setMessages(historyMessages);
          } else {
            // 이력이 없으면 intro 메시지만 표시
            setMessages([introMessage]);
          }
        }
      } catch (err) {
        console.error("Failed to load chat history", err);
        // 에러 시 intro 메시지만 표시
        setMessages([introMessage]);
      } finally {
        setLoadingHistory(false);
      }
    };

    loadHistory();
  }, []);

  const resetChat = () => {
    setShowResetModal(true);
  };

  const confirmResetChat = () => {
    setMessages([introMessage]);
    setError(null);
    setIsLoading(false);
    setShowResetModal(false);
  };

  const submitMessage = async (rawText: string) => {
    const trimmed = rawText.trim();
    if (!trimmed || isLoading) return;

    const userMessage: ChatMessage = {
      id: createId(),
      role: "user",
      content: trimmed,
      status: "done",
      createdAt: new Date().toISOString(),
    };

    setInput("");
    setMessages((prev) => [...prev, userMessage]);
    setIsLoading(true);
    setError(null);

    // 스트리밍 응답을 위한 assistant 메시지 생성
    const assistantMessageId = createId();
    const assistantMessage: ChatMessage = {
      id: assistantMessageId,
      role: "assistant",
      content: "",
      status: "pending",
    };
    setMessages((prev) => [...prev, assistantMessage]);

    try {
      const response = await fetch("/api/self/chat/send", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          tone: tone,
          query: trimmed,
        }),
      });

      if (!response.ok) {
        // Handle rate limit error (429)
        if (response.status === 429) {
          const errorData = await response.json().catch(() => ({}));
          const resetAt = errorData.resetAt
            ? new Date(errorData.resetAt).toLocaleString("ko-KR", {
                timeZone: "Asia/Seoul",
                hour: "2-digit",
                minute: "2-digit",
              })
            : "자정";
          setError(
            `일일 대화 횟수 제한(${
              errorData.limit || DAILY_CHAT_LIMIT
            }회)에 도달했습니다. 다음 리셋 시간: ${resetAt}`
          );
          // Remove user message and assistant message on limit error
          setMessages((prev) =>
            prev.filter(
              (msg) =>
                msg.id !== userMessage.id && msg.id !== assistantMessageId
            )
          );
          return;
        }
        throw new Error("Failed to fetch AI response.");
      }

      if (!response.body) {
        throw new Error("Response body is null");
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";
      let fullContent = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n");
        buffer = lines.pop() || "";

        for (const line of lines) {
          if (!line.trim()) continue;

          try {
            const data = JSON.parse(line);

            if (data.type === "metadata") {
              // 메타데이터는 필요시 사용 (컨텍스트 정보 등)
            } else if (data.type === "content" && data.delta) {
              fullContent += data.delta;
              setMessages((prev) =>
                prev.map((msg) =>
                  msg.id === assistantMessageId
                    ? { ...msg, content: fullContent }
                    : msg
                )
              );
            } else if (data.type === "done") {
              // 토큰 사용량 정보는 필요시 사용 가능
              setMessages((prev) =>
                prev.map((msg) =>
                  msg.id === assistantMessageId
                    ? { ...msg, status: "done" }
                    : msg
                )
              );
            }
          } catch (e) {
            // JSON 파싱 오류는 무시
          }
        }
      }

      // 최종적으로 완료 상태로 설정
      setMessages((prev) =>
        prev.map((msg) =>
          msg.id === assistantMessageId
            ? {
                ...msg,
                content: fullContent.trim(),
                status: "done",
                createdAt: new Date().toISOString(),
              }
            : msg
        )
      );
    } catch (err) {
      console.error(err);
      setError("응답을 가져오지 못했습니다. 잠시 후 다시 시도해주세요.");
      setMessages(
        (prev) =>
          prev
            .map((message) =>
              message.id === userMessage.id
                ? { ...message, status: "error" as const }
                : message
            )
            .filter((msg) => msg.id !== assistantMessageId) // 실패한 assistant 메시지 제거
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
      if (input.trim() && input.length <= MAX_INPUT_LENGTH && !isLoading) {
        void submitMessage(input);
      }
    }
  };

  const handleInputChange = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = event.target.value;
    if (value.length <= MAX_INPUT_LENGTH) {
      setInput(value);
    }
  };

  const handleToneChange = (newTone: "mild" | "spicy") => {
    setTone(newTone);
    if (typeof window !== "undefined") {
      localStorage.setItem("self_chat_tone", newTone);
    }
  };

  if (loadingHistory) {
    return (
      <main className={styles.chat_page} aria-label="AI와 나누는 새해 대화">
        <LoadingIndicator />
      </main>
    );
  }

  return (
    <div className={styles.chat_page_wrapper}>
      <main className={styles.chat_page} aria-label="AI와 나누는 새해 대화">
        <header className={styles.header_section}>
          <span className={styles.header_badge}>나와의 대화</span>
          <h1 className={styles.header_title}>
            미래의 나와 함께 이야기를 나누세요
          </h1>
          <p className={styles.header_subtitle}>
            새해 목표와 고민을 미리 학습된 AI와 함께 정리해보세요.
          </p>
          <div className={styles.tone_selector}>
            <button
              type="button"
              className={`${styles.tone_button} ${
                tone === "mild" ? styles.tone_active : ""
              }`}
              onClick={() => handleToneChange("mild")}
            >
              따뜻한 말투
            </button>
            <button
              type="button"
              className={`${styles.tone_button} ${
                tone === "spicy" ? styles.tone_active : ""
              }`}
              onClick={() => handleToneChange("spicy")}
            >
              직설적인 말투
            </button>
          </div>
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
                {message.status === "pending" && !message.content ? (
                  <div
                    className={styles.typing_bubble}
                    aria-live="polite"
                    aria-label="응답 생성중"
                  >
                    <span className={styles.dot} />
                    <span className={styles.dot} />
                    <span className={styles.dot} />
                  </div>
                ) : (
                  <>
                    {message.content && (
                      <p className={styles.bubble_text}>{message.content}</p>
                    )}
                    {message.createdAt && (
                      <div className={styles.bubble_timestamp}>
                        {formatTime(message.createdAt)}
                      </div>
                    )}
                  </>
                )}
              </article>
            ))}
            <div ref={endRef} />
          </div>

          {/* ▼ 아래로 스크롤 버튼 */}
          {showScrollDown && (
            <button
              type="button"
              className={styles.scroll_down_button}
              onClick={() =>
                endRef.current?.scrollIntoView({
                  behavior: "smooth",
                  block: "end",
                })
              }
              aria-label="마지막 대화로 이동"
            >
              ↓
            </button>
          )}

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

            <div className={styles.input_wrapper}>
              <textarea
                ref={textareaRef}
                className={styles.composer_input}
                value={input}
                placeholder="질문 또는 메시지를 입력하세요..."
                onChange={handleInputChange}
                onKeyDown={handleKeyDown}
                rows={1}
                maxLength={MAX_INPUT_LENGTH}
                aria-label="메시지 입력"
                disabled={isLoading}
              />
              <div className={styles.input_counter}>
                {input.length}/{MAX_INPUT_LENGTH}
              </div>
            </div>
            <div className={styles.composer_actions}>
              <button
                type="button"
                className={styles.reset_button}
                onClick={resetChat}
                disabled={messages.length <= 1 || isLoading}
              >
                대화 초기화
              </button>
              <LoadingButton
                type="submit"
                label="보내기"
                loading={isLoading}
                loadingLabel="생각 중..."
                disabled={!input.trim() || input.length > MAX_INPUT_LENGTH}
                className={styles.send_button_loading}
                variant="red"
                height={40}
                fontSize="0.9rem"
              />
            </div>
          </form>
          <p className={styles.helper_text}>
            Enter로 전송 · Shift + Enter로 줄 바꿈
          </p>
        </section>

        {/* 대화 초기화 확인 모달 */}
        <Modal
          isOpen={showResetModal}
          onClose={() => setShowResetModal(false)}
          ariaTitle="대화 초기화 확인"
        >
          <div className={styles.reset_modal_content}>
            <h3 className={styles.reset_modal_title}>
              대화를 초기화하시겠어요?
            </h3>
            <p className={styles.reset_modal_text}>
              모든 대화 내용이 삭제되며 복구할 수 없습니다.
            </p>
            <div className={styles.reset_modal_actions}>
              <button
                type="button"
                className={styles.reset_modal_cancel}
                onClick={() => setShowResetModal(false)}
              >
                취소
              </button>
              <button
                type="button"
                className={styles.reset_modal_confirm}
                onClick={confirmResetChat}
              >
                초기화
              </button>
            </div>
          </div>
        </Modal>
      </main>
    </div>
  );
}
