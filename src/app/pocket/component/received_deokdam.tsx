"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Image from "next/image";
import axios from "axios";
import Modal from "@/components/modal/modal";
import LoadingIndicator from "@/components/loadingIndicator/loadingIndicator";
import ConfettiEffect from "@/components/confetti/ConfettiEffect";
import ReceivedDeokdamRecap from "./received_deokdam_recap";
import { toPng } from "html-to-image";
import styles from "./received_deokdam.module.css";

// 불규칙한 카드 배치를 위한 랜덤 오프셋 생성 함수
const generateCardOffsets = (count: number) => {
  return Array.from({ length: count }, (_, i) => {
    // 각 카드마다 고유한 랜덤 시드 생성
    const seed = (i * 123.456) % 1000;
    const random1 = (Math.sin(seed) * 10000) % 1;
    const random2 = (Math.sin(seed * 2.345) * 10000) % 1;
    const random3 = (Math.sin(seed * 3.789) * 10000) % 1;

    return {
      rotation: (random1 - 0.5) * 8, // -4도 ~ 4도
      translateX: (random2 - 0.5) * 20, // -10px ~ 10px
      translateY: (random3 - 0.5) * 15, // -7.5px ~ 7.5px
    };
  });
};

type Member = {
  id: string;
  name: string;
};

type ReceivedDeokdam = {
  deokdam_uuid: string;
  desc: string;
  is_anony: boolean;
  isAnonymous?: boolean;
  from: string | null;
  from_name: string | null;
  created_at: string;
};

type Props = {
  open: boolean;
  onClose: () => void;
  pocketUuid: string;
  members: Member[];
  pocketName?: string;
  pocketIcon?: string;
  myDeokdamCount?: number;
  goal?: number;
  totalCount?: number;
};

const formatDate = (iso: string) => {
  const d = new Date(iso);
  return `${d.getFullYear()}년 ${d.getMonth() + 1}월 ${d.getDate()}일`;
};

export default function ReceivedDeokdamModal({
  open,
  onClose,
  pocketUuid,
  members,
  pocketName,
  pocketIcon,
  myDeokdamCount = 0,
  goal = 0,
  totalCount = 0,
}: Props) {
  const [loading, setLoading] = useState(false);
  const [list, setList] = useState<ReceivedDeokdam[]>([]);
  const [showRecap, setShowRecap] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState(0);
  const [dragOffset, setDragOffset] = useState(0);
  const [exporting, setExporting] = useState(false);

  const cardRefs = useRef<(HTMLDivElement | null)[]>([]);
  const containerRef = useRef<HTMLDivElement>(null);
  const activePointerIdRef = useRef<number | null>(null);
  const dragOffsetRef = useRef(0);
  const pointerStartRef = useRef<{
    x: number;
    y: number;
    inScrollableMessage: boolean;
    mode: "pending" | "swipe" | "scroll";
  } | null>(null);

  const currentCard = useMemo(
    () => (list.length > 0 ? list[currentIndex] : null),
    [list, currentIndex]
  );

  // 각 카드마다 불규칙한 오프셋 생성
  const cardOffsets = useMemo(() => {
    return generateCardOffsets(list.length);
  }, [list.length]);

  const senderName = useMemo(() => {
    if (!currentCard) return "익명";
    if (currentCard.is_anony || currentCard.isAnonymous) return "익명";
    // API에서 제공한 이름이 있으면 사용, 없으면 members에서 찾기
    if (currentCard.from_name) return currentCard.from_name;
    if (!currentCard.from) return "익명";
    const member = members.find((m) => m.id === currentCard.from);
    return member?.name || "익명";
  }, [currentCard, members]);

  const fetchReceivedDeokdams = async () => {
    if (!pocketUuid) return;
    setLoading(true);
    try {
      const res = await axios.get("/api/deokdam/received/pocket", {
        params: { pocket_uuid: pocketUuid },
      });
      if (res.status === 200) {
        const data = (res.data as ReceivedDeokdam[]).map((item) => ({
          ...item,
          isAnonymous:
            typeof item.is_anony === "boolean"
              ? item.is_anony
              : item.isAnonymous,
        }));
        setList(data);
        setCurrentIndex(0);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!open || !pocketUuid) return;
    setCurrentIndex(0);
    setDragOffset(0);
    setList([]); // 리스트 초기화로 깜빡임 방지
    setShowRecap(true); // 모달이 열릴 때 Recap부터 보여주기
    void fetchReceivedDeokdams();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  // 키보드 네비게이션
  useEffect(() => {
    if (!open) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft" && currentIndex > 0) {
        handlePrevious();
      } else if (e.key === "ArrowRight" && currentIndex < list.length - 1) {
        handleNext();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, currentIndex, list.length]);

  const handleNext = () => {
    if (currentIndex < list.length - 1) {
      setDragOffset(0);
      // 애니메이션 없이 즉시 전환
      requestAnimationFrame(() => {
        setCurrentIndex(currentIndex + 1);
      });
    }
  };

  const handlePrevious = () => {
    if (currentIndex > 0) {
      setDragOffset(0);
      // 애니메이션 없이 즉시 전환
      requestAnimationFrame(() => {
        setCurrentIndex(currentIndex - 1);
      });
    }
  };

  const isInScrollableMessageArea = (target: EventTarget | null) => {
    if (!target || !(target instanceof HTMLElement)) return false;
    const el = target.closest(
      `.${styles.card_message_section}`
    ) as HTMLElement | null;
    if (!el) return false;
    // 실제로 스크롤이 필요한 경우에만(내용이 넘치는 경우) 스와이프를 막고 스크롤을 허용
    return el.scrollHeight > el.clientHeight + 1;
  };

  // Pointer Events로 드래그/스와이프 통합
  // - 본문(스크롤 영역)에서도 '가로로' 움직이면 스와이프
  // - '세로로' 움직이면 스크롤
  const handlePointerDown = (e: React.PointerEvent) => {
    // 버튼 등 인터랙션 요소는 스와이프 시작하지 않도록
    if ((e.target as HTMLElement | null)?.closest("button")) return;

    activePointerIdRef.current = e.pointerId;
    pointerStartRef.current = {
      x: e.clientX,
      y: e.clientY,
      inScrollableMessage: isInScrollableMessageArea(e.target),
      mode: "pending",
    };
    // 아직 스와이프인지 스크롤인지 결정 전이므로 드래그 시작하지 않음
    setIsDragging(false);
    setDragStart(e.clientX);
    setDragOffset(0);
    dragOffsetRef.current = 0;
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (activePointerIdRef.current !== e.pointerId) return;
    const start = pointerStartRef.current;
    if (!start) return;

    const dx = e.clientX - start.x;
    const dy = e.clientY - start.y;

    // 아직 방향 결정을 안 했으면, 작은 움직임은 무시
    if (start.mode === "pending") {
      const absX = Math.abs(dx);
      const absY = Math.abs(dy);
      if (absX < 6 && absY < 6) return;

      // 스크롤 가능한 본문에서 시작했고, 세로 이동이 더 크면 스크롤 모드로 확정
      if (start.inScrollableMessage && absY > absX) {
        pointerStartRef.current = { ...start, mode: "scroll" };
        return;
      }

      // 그 외에는 스와이프 모드로 확정
      pointerStartRef.current = { ...start, mode: "swipe" };
      setIsDragging(true);
      setDragStart(start.x);
      try {
        containerRef.current?.setPointerCapture(e.pointerId);
      } catch {
        // ignore
      }
    }

    // 스와이프 모드에서만 카드 이동
    if (pointerStartRef.current?.mode !== "swipe") return;
    if (e.cancelable) e.preventDefault();
    setDragOffset(dx);
    dragOffsetRef.current = dx;
  };

  const finishPointerGesture = () => {
    if (!isDragging) return;
    const threshold = 100;
    const dx = dragOffsetRef.current;
    if (dx > threshold && currentIndex > 0) {
      setIsDragging(false);
      setDragOffset(0);
      dragOffsetRef.current = 0;
      requestAnimationFrame(() => {
        setCurrentIndex(currentIndex - 1);
      });
    } else if (dx < -threshold && currentIndex < list.length - 1) {
      setIsDragging(false);
      setDragOffset(0);
      dragOffsetRef.current = 0;
      requestAnimationFrame(() => {
        setCurrentIndex(currentIndex + 1);
      });
    } else {
      setDragOffset(0);
      setIsDragging(false);
      dragOffsetRef.current = 0;
    }
    activePointerIdRef.current = null;
    pointerStartRef.current = null;
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    if (activePointerIdRef.current !== e.pointerId) return;
    try {
      containerRef.current?.releasePointerCapture(e.pointerId);
    } catch {
      // ignore
    }

    // 스크롤 모드였다면 스와이프 처리 없이 종료
    if (pointerStartRef.current?.mode !== "swipe") {
      activePointerIdRef.current = null;
      pointerStartRef.current = null;
      setIsDragging(false);
      setDragOffset(0);
      dragOffsetRef.current = 0;
      return;
    }

    finishPointerGesture();
  };

  const handlePointerCancel = (e: React.PointerEvent) => {
    if (activePointerIdRef.current !== e.pointerId) return;
    try {
      containerRef.current?.releasePointerCapture(e.pointerId);
    } catch {
      // ignore
    }
    setDragOffset(0);
    setIsDragging(false);
    dragOffsetRef.current = 0;
    activePointerIdRef.current = null;
    pointerStartRef.current = null;
  };

  const handleExportImage = async () => {
    const currentCardRef = cardRefs.current[currentIndex];
    if (!currentCardRef) return;

    setExporting(true);

    const waitForImages = async (root: HTMLElement) => {
      const imgs = Array.from(
        root.querySelectorAll("img")
      ) as HTMLImageElement[];
      await Promise.all(
        imgs.map(async (img) => {
          // next/image는 srcset을 쓰는데, html-to-image에서 종종 누락되는 케이스가 있어
          // 저장 시에는 단일 src로 고정하고 로드/디코드 완료를 기다린다.
          const rawSrc = img.getAttribute("src") || "";
          const absoluteSrc =
            rawSrc.startsWith("/") && typeof window !== "undefined"
              ? `${window.location.origin}${rawSrc}`
              : rawSrc;

          try {
            img.crossOrigin = "anonymous";
          } catch {
            // ignore
          }
          img.decoding = "sync";
          img.loading = "eager";

          if (absoluteSrc && img.src !== absoluteSrc) {
            img.src = absoluteSrc;
          }
          img.removeAttribute("srcset");
          img.removeAttribute("sizes");

          // decode가 지원되면 우선 사용, 아니면 onload로 대기
          try {
            if (!img.complete) {
              await new Promise<void>((resolve) => {
                const done = () => resolve();
                img.onload = done;
                img.onerror = done;
              });
            }
            if ("decode" in img) {
              await img.decode();
            }
          } catch {
            // ignore
          }
        })
      );
    };

    const pixelRatio = 3;
    // offsetWidth/offsetHeight는 transform(scale 등) 적용 전 레이아웃 크기라서
    // 저장 이미지에서 "오른쪽이 남는" 현상(폭 불일치)을 줄이는데 더 안정적
    const exportWidth = Math.round(currentCardRef.offsetWidth);
    const baseHeight = Math.round(currentCardRef.offsetHeight);
    const computedRadiusStr =
      typeof window !== "undefined"
        ? window.getComputedStyle(currentCardRef).borderRadius
        : "24px";
    const computedRadius = Number.parseFloat(computedRadiusStr) || 24;

    // 임시 컨테이너 생성
    const tempContainer = document.createElement("div");
    tempContainer.style.position = "fixed";
    tempContainer.style.left = "-9999px";
    tempContainer.style.top = "0";
    tempContainer.style.width = `${exportWidth}px`;
    tempContainer.style.zIndex = "-1";
    document.body.appendChild(tempContainer);

    try {
      // 폰트가 완전히 로드될 때까지 기다림
      if (document.fonts) {
        await document.fonts.ready;
      }

      // 카드 복제
      const clonedCard = currentCardRef.cloneNode(true) as HTMLElement;

      // 복제된 카드의 스타일 초기화 (transform 제거)
      clonedCard.style.position = "relative";
      clonedCard.style.transform = "none";
      clonedCard.style.opacity = "1";
      // 저장 이미지는 '현재 화면에서 보이는 카드 폭'과 동일하게 캡처해서 줄바꿈/레이아웃이 일치하도록
      clonedCard.style.width = `${exportWidth}px`;
      clonedCard.style.boxSizing = "border-box";
      // 저장 이미지에서는 스크롤이 생겨도 전체 내용이 다 보이도록 카드 높이를 자동 확장
      clonedCard.style.height = "auto";
      clonedCard.style.minHeight = `${baseHeight}px`;
      clonedCard.style.margin = "0";
      clonedCard.style.borderRadius = `${computedRadius}px`;
      // 카드 디자인(둥근 모서리)을 유지하기 위해 overflow는 hidden 유지
      clonedCard.style.overflow = "hidden";

      tempContainer.appendChild(clonedCard);

      // 저장 이미지에서는 덕담 영역의 스크롤을 제거(전체 내용 표시)
      const messageSection = clonedCard.querySelector(
        `.${styles.card_message_section}`
      ) as HTMLElement | null;
      if (messageSection) {
        messageSection.style.overflow = "visible";
        messageSection.style.overflowY = "visible";
        messageSection.style.maxHeight = "none";
      }

      // 약간의 지연으로 렌더링 완료 대기
      await new Promise((resolve) => setTimeout(resolve, 100));

      // 아이콘/이미지(특히 next/image)가 캡처 전에 로드되지 않아 누락되는 버그 방지
      await waitForImages(clonedCard);

      // html-to-image가 filter/box-shadow를 간헐적으로 "사각 잔상"으로 렌더링하는 케이스 방지
      // (특히 좌측 하단 주머니 정보 박스 주변에서 자주 발생)
      const pocketInfoEl = clonedCard.querySelector(
        `.${styles.pocket_info}`
      ) as HTMLElement | null;
      if (pocketInfoEl) {
        pocketInfoEl.style.boxShadow = "none";
        pocketInfoEl.style.filter = "none";
        pocketInfoEl.style.backdropFilter = "none";
        (pocketInfoEl.style as any).webkitBackdropFilter = "none";
      }

      const serviceLogoEl = clonedCard.querySelector(
        `.${styles.service_logo}`
      ) as HTMLElement | null;
      if (serviceLogoEl) {
        serviceLogoEl.style.filter = "none";
      }

      // 렌더 후 실제 필요한 높이 계산 (스크롤 포함 전체)
      const cardHeight = Math.max(baseHeight, clonedCard.scrollHeight);
      clonedCard.style.height = `${cardHeight}px`;

      // 먼저 이미지 생성
      const tempDataUrl = await toPng(clonedCard, {
        quality: 0.95,
        pixelRatio,
        backgroundColor: "#ffffff",
        width: exportWidth,
        height: cardHeight,
        cacheBust: true,
      });

      // 캔버스로 border-radius 적용
      const img = new window.Image();
      img.src = tempDataUrl;

      await new Promise<void>((resolve, reject) => {
        img.onload = () => resolve();
        img.onerror = reject;
      });

      const canvas = document.createElement("canvas");
      canvas.width = exportWidth * pixelRatio;
      canvas.height = cardHeight * pixelRatio;
      const ctx = canvas.getContext("2d");

      if (ctx) {
        // border-radius 적용
        const radius = computedRadius * pixelRatio;
        ctx.beginPath();
        ctx.moveTo(radius, 0);
        ctx.lineTo(canvas.width - radius, 0);
        ctx.quadraticCurveTo(canvas.width, 0, canvas.width, radius);
        ctx.lineTo(canvas.width, canvas.height - radius);
        ctx.quadraticCurveTo(
          canvas.width,
          canvas.height,
          canvas.width - radius,
          canvas.height
        );
        ctx.lineTo(radius, canvas.height);
        ctx.quadraticCurveTo(0, canvas.height, 0, canvas.height - radius);
        ctx.lineTo(0, radius);
        ctx.quadraticCurveTo(0, 0, radius, 0);
        ctx.closePath();
        ctx.clip();

        // 이미지 그리기
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      }

      const dataUrl = canvas.toDataURL("image/png", 0.95);

      const link = document.createElement("a");
      link.download = `덕담_${formatDate(currentCard?.created_at || "")}.png`;
      link.href = dataUrl;
      link.click();
    } catch (error) {
      console.error("이미지 내보내기 실패:", error);
      alert("이미지를 내보내는데 실패했어요. 잠시 후 다시 시도해 주세요.");
    } finally {
      // 임시 컨테이너 제거
      document.body.removeChild(tempContainer);
      setExporting(false);
    }
  };

  const handleRecapComplete = () => {
    setShowRecap(false);
  };

  return (
    <>
      {open && !showRecap && (
        <div className={styles.confetti_wrapper}>
          <ConfettiEffect particleCount={50}>
            <div />
          </ConfettiEffect>
        </div>
      )}
      <Modal isOpen={open} onClose={onClose} ariaTitle="받은 덕담">
        <div className={styles.container}>
          {showRecap && list.length > 0 ? (
            <ReceivedDeokdamRecap
              myDeokdamCount={myDeokdamCount}
              goal={goal}
              totalCount={totalCount}
              receivedCount={list.length}
              onComplete={handleRecapComplete}
            />
          ) : (
            <div>
              {loading ? (
                <div className={styles.loading}>
                  <LoadingIndicator text="덕담 불러오는 중..." />
                </div>
              ) : (
                <>
                  <header className={styles.header}>
                    <h2 className={styles.title}>받은 덕담</h2>
                    <p className={styles.sub}>
                      {list.length > 0
                        ? `${currentIndex + 1} / ${list.length}`
                        : "받은 덕담이 없어요"}
                    </p>
                    {list.length > 1 && (
                      <p className={styles.swipe_hint}>
                        스와이프하여 넘겨보세요
                      </p>
                    )}
                  </header>

                  {list.length === 0 ? (
                    <div className={styles.empty}>
                      <div className={styles.empty_icon}>💌</div>
                      <h3 className={styles.empty_title}>
                        아직 받은 덕담이 없어요
                      </h3>
                      <p className={styles.empty_message}>
                        오픈된 후에도 덕담을 남길 수 있어요
                        <br />그 전까지 친구들에게 덕담을 남겨보는 건 어떨까요?
                      </p>
                      <div className={styles.empty_actions}>
                        <button
                          type="button"
                          className={styles.empty_action_btn}
                          onClick={() => {
                            onClose();
                            // 모달이 닫힌 후 덕담 남기기 액션을 트리거하기 위해
                            // 짧은 딜레이 후 이벤트 발생
                            setTimeout(() => {
                              window.dispatchEvent(
                                new CustomEvent("openWriteDeokdam")
                              );
                            }, 300);
                          }}
                        >
                          덕담 남기기
                        </button>
                        <button
                          type="button"
                          className={`${styles.empty_action_btn} ${styles.empty_action_btn_secondary}`}
                          onClick={() => {
                            onClose();
                            setTimeout(() => {
                              window.dispatchEvent(
                                new CustomEvent("openInvite")
                              );
                            }, 300);
                          }}
                        >
                          친구 초대하기
                        </button>
                      </div>
                    </div>
                  ) : (
                    <>
                      <div
                        ref={containerRef}
                        className={styles.card_stack}
                        onPointerDown={handlePointerDown}
                        onPointerMove={handlePointerMove}
                        onPointerUp={handlePointerUp}
                        onPointerCancel={handlePointerCancel}
                      >
                        {/* 좌측 화살표 버튼 */}
                        {currentIndex > 0 && (
                          <button
                            type="button"
                            className={`${styles.card_nav_btn} ${styles.card_nav_btn_left}`}
                            onClick={(e) => {
                              e.stopPropagation();
                              handlePrevious();
                            }}
                            aria-label="이전"
                            style={{ left: "1rem" }}
                          >
                            <Image
                              src="/images/arrow.svg"
                              alt="이전"
                              width={14}
                              height={14}
                              className={styles.arrow_icon}
                            />
                          </button>
                        )}

                        {/* 우측 화살표 버튼 */}
                        {currentIndex < list.length - 1 && (
                          <button
                            type="button"
                            className={`${styles.card_nav_btn} ${styles.card_nav_btn_right}`}
                            onClick={(e) => {
                              e.stopPropagation();
                              handleNext();
                            }}
                            aria-label="다음"
                            style={{ right: "1rem" }}
                          >
                            <Image
                              src="/images/arrow.svg"
                              alt="다음"
                              width={14}
                              height={14}
                              className={styles.arrow_icon}
                            />
                          </button>
                        )}

                        {list.map((deokdam, index) => {
                          const isCurrent = index === currentIndex;
                          const dragOffsetValue = isCurrent ? dragOffset : 0;
                          const zIndex = list.length - index;
                          const depth = index - currentIndex; // 현재 카드 기준 상대 위치

                          // 각 카드의 고유한 불규칙한 오프셋 가져오기
                          const baseOffset = cardOffsets[index] || {
                            rotation: 0,
                            translateX: 0,
                            translateY: 0,
                          };

                          // 깊이에 따라 오프셋 조정 (뒤로 갈수록 더 많이 이동)
                          const rotation = baseOffset.rotation + depth * 1.5; // 기본 회전 + 깊이에 따른 추가 회전
                          const translateX = baseOffset.translateX + depth * 6; // 기본 X 이동 + 깊이에 따른 추가
                          const translateY =
                            baseOffset.translateY + depth * -10; // 기본 Y 이동 + 깊이에 따른 추가

                          // 맨 앞 카드를 작게 해서 뒤 카드가 더 잘 보이도록
                          const scale = isCurrent
                            ? 0.92
                            : 0.9 - Math.abs(depth) * 0.03;

                          const opacity = isCurrent
                            ? 1
                            : index < currentIndex
                            ? 0
                            : 0.95 - Math.abs(depth) * 0.08;

                          return (
                            <div
                              key={deokdam.deokdam_uuid}
                              ref={(el) => {
                                cardRefs.current[index] = el;
                              }}
                              className={`${styles.card} ${
                                isCurrent ? styles.card_active : ""
                              } ${
                                isDragging && isCurrent
                                  ? styles.card_dragging
                                  : ""
                              } ${
                                index === currentIndex
                                  ? styles.card_entering
                                  : ""
                              }`}
                              style={{
                                zIndex,
                                transform: isCurrent
                                  ? `translateX(${dragOffsetValue}px) translateY(0) scale(${scale}) rotateZ(0deg)`
                                  : `translateX(${
                                      translateX + dragOffsetValue
                                    }px) translateY(${translateY}px) scale(${scale}) rotateZ(${rotation}deg)`,
                                opacity: Math.max(0, Math.min(1, opacity)),
                                ["--drag-offset" as string]:
                                  isDragging && isCurrent ? dragOffsetValue : 0,
                              }}
                            >
                              {/* 상단: From 섹션 */}
                              <div className={styles.card_from_section}>
                                <div className={styles.from_content}>
                                  <p className={styles.from_label}>From.</p>
                                  <p className={styles.from_name}>
                                    {deokdam.is_anony || deokdam.isAnonymous
                                      ? "익명"
                                      : senderName}
                                  </p>
                                  {(deokdam.is_anony ||
                                    deokdam.isAnonymous) && (
                                    <span className={styles.anonymous_badge}>
                                      익명
                                    </span>
                                  )}
                                </div>
                              </div>

                              {/* 구분선 장식 */}
                              <div className={styles.divider}>
                                <div className={styles.divider_line}></div>
                                <div className={styles.divider_ornament}>❀</div>
                                <div className={styles.divider_line}></div>
                              </div>

                              {/* 중앙: 편지 내용 */}
                              <div className={styles.card_message_section}>
                                <div className={styles.message_content}>
                                  <p className={styles.card_message}>
                                    {deokdam.desc}
                                  </p>
                                </div>
                              </div>

                              {/* 하단: To 섹션 */}
                              <div className={styles.card_to_section}>
                                <div className={styles.pocket_info}>
                                  <Image
                                    src="/images/pocket.png"
                                    alt="덕담 주머니"
                                    width={24}
                                    height={24}
                                    className={styles.service_logo}
                                  />
                                  <div className={styles.pocket_info_text}>
                                    <span className={styles.service_name}>
                                      덕담 주머니
                                    </span>
                                    {pocketName && (
                                      <span className={styles.pocket_info_name}>
                                        {pocketName}
                                      </span>
                                    )}
                                  </div>
                                </div>
                                <div className={styles.to_content}>
                                  <p className={styles.to_label}>To.</p>
                                  <p className={styles.to_name}>나에게</p>
                                  <p className={styles.to_date}>
                                    {formatDate(deokdam.created_at)}
                                  </p>
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </>
                  )}
                </>
              )}
            </div>
          )}
          {!showRecap && list.length > 0 && (
            <div className={styles.action_buttons}>
              <div
                role="button"
                tabIndex={0}
                className={styles.export_btn}
                onClick={handleExportImage}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    handleExportImage();
                  }
                }}
                aria-disabled={exporting}
              >
                {exporting ? "저장 중..." : "카드 이미지 저장하기"}
              </div>
              <button className={styles.close_btn} onClick={onClose}>
                닫기
              </button>
            </div>
          )}
          {!showRecap && list.length === 0 && (
            <button className={styles.close_btn_only} onClick={onClose}>
              닫기
            </button>
          )}
        </div>
      </Modal>
    </>
  );
}
