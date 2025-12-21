"use client";

import { useEffect, useMemo, useState, type CSSProperties } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import Image from "next/image";
import axios from "axios";
import styles from "./page.module.css";
import LoadingIndicator from "@/components/loadingIndicator/loadingIndicator";
import Modal from "@/components/modal/modal";
import InviteModal from "@/app/social/component/invite_modal";
import ToastPopup from "@/components/toastPopup/toastPopup";
import DeokdamWriteModal from "../component/deokdam_write";
import MyDeokdamModal from "../component/my_deokdam";
import { useAuthStore } from "@/stores/auth";
import type { Pocket } from "@/types/pocket";

const formatDate = (iso: string, showYear?: boolean) => {
  const d = new Date(iso);
  const year = d.getFullYear();
  const m = d.getMonth() + 1;
  const day = d.getDate();
  if (m === 2 && day === 17) return "설날";
  if (showYear) return `${year}년 ${m}월 ${day}일`;
  return `${m}월 ${day}일`;
};

export default function PocketDetailPage() {
  const { uuid } = useParams<{ uuid: string }>();
  const router = useRouter();
  const searchParams = useSearchParams();
  const isInvite = searchParams.get("invite") === "true";
  const authStatus = useAuthStore((s) => s.status);
  const authUser = useAuthStore((s) => s.user);
  const checkAuth = useAuthStore((s) => s.checkAuth);
  const [loading, setLoading] = useState(true);
  const [inviteModalOpen, setInviteModalOpen] = useState(false);
  const [writeModalOpen, setWriteModalOpen] = useState(false);
  const [toastOpen, setToastOpen] = useState(false);
  const [toastType, setToastType] = useState<"success" | "error">("success");
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [pocket, setPocket] = useState<Pocket | null>(null);
  const [currentCount, setCurrentCount] = useState<number>(0);
  const [madeByDisplay, setMadeByDisplay] = useState<string>("");
  const [members, setMembers] = useState<{ id: string; name: string }[]>([]);
  const [myDeokdamCount, setMyDeokdamCount] = useState<number>(0);
  const [autoJoinAttempted, setAutoJoinAttempted] = useState(false);

  const [myModalOpen, setMyModalOpen] = useState(false);

  const fetchDetail = async () => {
    setLoading(true);
    try {
      // invite 파라미터가 있으면 함께 전달
      const url = isInvite
        ? `/api/pocket/${uuid}?invite=true`
        : `/api/pocket/${uuid}`;
      const res = await axios.get(url);
      if (res.status === 200) {
        setPocket(res.data);
      }
    } catch (e: any) {
      console.error(e);
      // 401 에러면 비로그인 상태이므로 로그인 페이지로 리다이렉트
      if (e.response?.status === 401) {
        const currentUrl = window.location.pathname + window.location.search;
        router.push(`/signup?returnUrl=${encodeURIComponent(currentUrl)}`);
        return;
      }
      // 404 에러면 주머니가 없거나 접근 권한이 없는 경우
      if (e.response?.status === 404) {
        alert("주머니를 찾을 수 없어요.");
        router.push("/social");
        return;
      }
      alert("주머니 정보를 불러오지 못했어요.");
    } finally {
      setLoading(false);
    }
  };

  const fetchMemberName = async (user_uuid: string) => {
    try {
      const response = await axios.get("/api/user/name", {
        params: { user_uuid },
      });
      if (response.status === 200) {
        return response.data.name;
      }
      return "알 수 없음";
    } catch (error) {
      console.error("Error fetching user name:", error);
      return "알 수 없음";
    }
  };

  const fetchMyDeokdamCount = async () => {
    if (!uuid) return 0;
    try {
      const response = await axios.get("/api/deokdam/mine/count", {
        params: { pocket_uuid: uuid },
      });
      if (response.status === 200) {
        const val = Number(response.data.deokdam_count);
        return Number.isFinite(val) ? val : 0;
      }
    } catch (error) {
      console.error("Error fetching my deokdam count:", error);
      return 0;
    }
    return 0;
  };

  useEffect(() => {
    if (!pocket) return;
    let isMounted = true;

    const loadMeta = async () => {
      const start = Date.now();
      setLoading(true);
      try {
        const madeByPromise = axios
          .get("/api/user/name", { params: { user_uuid: pocket.made_by } })
          .then((res) => (res.status === 200 ? res.data.name : "알 수 없음"))
          .catch(() => "알 수 없음");

        const countPromise = axios
          .get("/api/pocket/info/count", {
            params: { pocket_uuid: pocket.pocket_uuid },
          })
          .then((countRes) => {
            if (countRes.status !== 200) return null;
            const val = Number(countRes.data.ment_count);
            return Number.isFinite(val) ? val : null;
          })
          .catch((err) => {
            console.error("Error fetching pocket count:", err);
            return null;
          });

        const myCountPromise = fetchMyDeokdamCount();

        const membersPromise = (async () => {
          try {
            const authRes = await axios.get("/api/auth/me");
            const myId =
              authRes.status === 200 ? authRes.data.user_uuid : undefined;
            const targets = pocket.members.filter((id) => id !== myId);
            const resolved = await Promise.all(
              targets.map(async (memberId) => ({
                id: memberId,
                name: await fetchMemberName(memberId),
              }))
            );
            return resolved;
          } catch (error) {
            console.error("Error fetching members:", error);
            return [];
          }
        })();

        const [madeByName, memberData, totalCount, myCount] = await Promise.all(
          [madeByPromise, membersPromise, countPromise, myCountPromise]
        );

        if (!isMounted) return;
        setMadeByDisplay(madeByName);
        setMembers(memberData);
        if (typeof totalCount === "number") {
          setCurrentCount(totalCount);
        }
        if (typeof myCount === "number") {
          setMyDeokdamCount(myCount);
        }
      } catch (error) {
        if (!isMounted) return;
        console.error("Error loading pocket meta:", error);
        setMadeByDisplay("알 수 없음");
        setMembers([]);
      } finally {
        const elapsed = Date.now() - start;
        const delay = Math.max(0, 200 - elapsed); // 최소 표시 시간으로 깜빡임 완화
        setTimeout(() => {
          if (isMounted) setLoading(false);
        }, delay);
      }
    };

    void loadMeta();

    return () => {
      isMounted = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pocket]);

  // 주머니 코드만 가져오는 함수 (초대된 유저용)
  const fetchPocketCode = async (): Promise<string | null> => {
    try {
      const res = await axios.get(`/api/pocket/${uuid}?invite=true`);
      if (res.status === 200 && res.data?.code) {
        return res.data.code;
      }
    } catch (e: any) {
      console.error("Error fetching pocket code:", e);
      // 401 에러면 비로그인 상태이므로 로그인 페이지로 리다이렉트
      if (e.response?.status === 401) {
        const currentUrl = window.location.pathname + window.location.search;
        router.push(`/signup?returnUrl=${encodeURIComponent(currentUrl)}`);
        return null;
      }
    }
    return null;
  };

  // 자동 참여 시도 함수
  const attemptAutoJoin = async (pocketCode: string) => {
    if (!authUser || autoJoinAttempted) return;

    setAutoJoinAttempted(true);
    setLoading(true);
    let isFull = false; // 인원이 가득 찬 경우를 추적
    try {
      const response = await axios.post("/api/pocket/join", {
        pocket_code: pocketCode,
      });

      if (response.status === 200) {
        setToastType("success");
        setToastMessage("주머니에 참여했어요!");
        setToastOpen(true);
        // 주머니 정보 새로고침 (이제 멤버이므로 정상적으로 로드됨)
        await fetchDetail();
      }
    } catch (error: any) {
      console.error("Auto join error:", error);

      const errorMessage =
        error.response?.data?.message || "참여에 실패했어요.";
      if (errorMessage === "인원이 가득 찼어요") {
        isFull = true; // 인원이 가득 찬 경우 표시
        setToastType("error");
        setToastMessage("인원이 가득 찼어요");
        setToastOpen(true);
        // 로딩 인디케이터는 유지하고, 1.5초 후 루트 디렉토리로 이동
        setTimeout(() => {
          window.location.replace("/");
        }, 1500);
      } else if (errorMessage === "Already a member of this pocket") {
        // 이미 멤버인 경우는 조용히 처리하고 정보 로드
        // autoJoinAttempted는 true로 유지하여 재시도 방지
        await fetchDetail();
      } else {
        setToastType("error");
        setToastMessage(errorMessage);
        setToastOpen(true);
        // 에러 발생 시에도 주머니 정보는 로드 시도
        // autoJoinAttempted는 true로 유지하여 재시도 방지
        await fetchDetail();
      }
    } finally {
      // 인원이 가득 찬 경우가 아니면 로딩 인디케이터 끄기
      if (!isFull) {
        setLoading(false);
      }
    }
  };

  // 인증 상태 확인 및 자동 참여 처리
  useEffect(() => {
    if (authStatus === "idle") {
      checkAuth();
    }
  }, [authStatus, checkAuth]);

  // 초대된 유저가 비로그인 상태인 경우: 로그인 페이지로 리다이렉트
  useEffect(() => {
    if (isInvite && authStatus === "unauthenticated" && uuid) {
      const currentUrl = window.location.pathname + window.location.search;
      router.push(`/signup?returnUrl=${encodeURIComponent(currentUrl)}`);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isInvite, authStatus, uuid]);

  // 초대된 유저인 경우: 먼저 가입하고 그 다음 정보 로드
  useEffect(() => {
    if (
      isInvite &&
      authStatus === "authenticated" &&
      authUser &&
      !autoJoinAttempted &&
      uuid
    ) {
      const handleInviteFlow = async () => {
        // 먼저 주머니 코드만 가져오기
        const pocketCode = await fetchPocketCode();
        if (pocketCode) {
          // 코드를 가져왔으면 바로 자동 참여 시도
          await attemptAutoJoin(pocketCode);
        } else {
          // 코드를 가져오지 못한 경우 (이미 리다이렉트되었거나 에러)
          setLoading(false);
        }
      };

      // 약간의 지연을 두어 인증 상태가 완전히 안정화되도록 함
      const timer = setTimeout(() => {
        handleInviteFlow();
      }, 300);
      return () => clearTimeout(timer);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isInvite, authStatus, authUser, autoJoinAttempted, uuid]);

  // 일반 유저 또는 초대된 유저가 가입 완료한 후: 주머니 정보 로드
  useEffect(() => {
    // 초대된 유저가 아직 가입 시도 중이면 정보를 로드하지 않음
    // (attemptAutoJoin 내부에서 fetchDetail을 호출하므로 여기서는 호출하지 않음)
    if (isInvite && authStatus === "authenticated" && !autoJoinAttempted) {
      return;
    }

    // 초대된 유저가 아니거나, 가입이 완료된 경우 정보 로드
    // 초대된 유저의 경우 attemptAutoJoin에서 이미 fetchDetail을 호출하므로
    // 여기서는 일반 유저만 처리
    if (uuid && (!isInvite || autoJoinAttempted)) {
      void fetchDetail();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [uuid, isInvite, authStatus, autoJoinAttempted]);

  const progress = useMemo(() => {
    const cur = currentCount;
    const goal = pocket?.goal ?? 1;
    if (goal <= 0) return 0;
    return Math.min(Math.round((cur / goal) * 100), 100);
  }, [currentCount, pocket]);
  const iconScaleStyle: CSSProperties = useMemo(() => {
    // 50%에서 1.0x가 되는 기준 스케일, 진행률 기반으로 선형 조정
    // (0% -> 0.85x, 50% -> 1x, 100% -> 1.15x)
    const scale = 0.85 + (progress / 100) * 0.3;
    return { "--icon-scale": scale } as CSSProperties;
  }, [progress]);

  const progressBarStyle: CSSProperties = useMemo(
    () =>
      ({
        "--progress-width": `${progress}%`,
      } as CSSProperties),
    [progress]
  );

  const ddayText = useMemo(() => {
    if (!pocket) return "";
    const open = new Date(pocket.open_at);
    const today = new Date();
    open.setHours(0, 0, 0, 0);
    today.setHours(0, 0, 0, 0);
    const diff = Math.ceil(
      (open.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)
    );
    if (diff < 0) return "오픈 완료";
    if (diff === 0) return "오늘 오픈";
    return `D-${diff}`;
  }, [pocket]);

  const handleCopyCode = async () => {
    if (!pocket) return;
    await navigator.clipboard.writeText(pocket.code);
    setToastMessage("참여 코드가 복사됐어요!");
    setToastOpen(true);
  };

  const progressText = useMemo(() => {
    if (!pocket) return "";
    const cur = currentCount;
    const goal = pocket.goal ?? 0;
    if (goal > 0) return `${cur}개의 덕담 / 목표 ${goal}개`;
    return `${cur}개의 덕담이 모였어요`;
  }, [currentCount, pocket]);
  const membersText = useMemo(() => {
    if (!pocket) return "";
    const cur = pocket.members.length;
    if (pocket.limit > 0) {
      return `${cur}명 / 최대 ${pocket.limit}명`;
    }
    return `${cur}명이 함께하는 주머니`;
  }, [pocket]);

  return (
    <main className={styles.page} aria-label="덕담 주머니 상세 페이지">
      <ToastPopup
        open={toastOpen}
        type={toastType}
        message={toastMessage || "복사했어요!"}
        duration={2000}
        onClose={() => setToastOpen(false)}
        actionLabel=""
      />
      {loading && <LoadingIndicator />}
      <Modal isOpen={inviteModalOpen} onClose={() => setInviteModalOpen(false)}>
        <InviteModal
          name={pocket?.name || ""}
          uuid={pocket?.pocket_uuid || ""}
          code={pocket?.code || ""}
        />
      </Modal>
      <Modal isOpen={writeModalOpen} onClose={() => setWriteModalOpen(false)}>
        <DeokdamWriteModal
          members={members}
          onSubmit={async (data) => {
            console.log("Deokdam submitted:", data);
            const response = await axios.post("/api/deokdam", {
              destination: data.receivers,
              pocket: uuid,
              desc: data.message,
              isAnonymous: data.anonymous,
            });
            if (response.status === 201) {
              console.log(
                "Deokdam created with UUID:",
                response.data.deokdam_uuid
              );
            } else {
              console.error("Failed to create deokdam:", response);
            }
            setWriteModalOpen(false);
            setCurrentCount((prev) => prev * 1 + 1);
            setMyDeokdamCount((prev) => prev * 1 + 1);
            setToastMessage("덕담을 보냈어요!");
            setToastOpen(true);
          }}
        />
      </Modal>
      <MyDeokdamModal
        open={myModalOpen}
        onClose={() => setMyModalOpen(false)}
        pocketUuid={pocket?.pocket_uuid ?? ""}
        members={members}
      />
      <div className={styles.back_button_div}>
        <span
          className={styles.back_link}
          onClick={() => {
            // 초대를 통해 들어온 경우 루트 경로로 이동
            if (isInvite) {
              router.replace("/");
            } else if (
              typeof window !== "undefined" &&
              window.history.length > 1
            ) {
              router.back();
            } else {
              router.replace("/social");
            }
          }}
          aria-label="뒤로"
        >
          ←
        </span>
      </div>
      <div className={styles.page_shell}>
        {/* 왼쪽: 비주얼 패널 */}
        <section className={styles.visual_panel}>
          <div className={styles.visual_header}>
            <span className={styles.visual_badge}>덕담 진행 현황</span>
            {ddayText && <span className={styles.visual_dday}>{ddayText}</span>}
          </div>

          <div className={styles.icon_shell}>
            <div
              className={styles.icon_orbit}
              style={iconScaleStyle}
              aria-hidden={!pocket}
            >
              <div className={styles.icon_glow} />
              <div className={styles.icon_inner}>
                {pocket && (
                  <Image
                    src={`/images/${pocket.icon}`}
                    alt={pocket.name}
                    width={140}
                    height={140}
                    className={styles.icon_image}
                  />
                )}
              </div>
            </div>
          </div>

          <div className={styles.progress_card}>
            <div className={styles.progress_header}>
              <p className={styles.progress_label}>이 주머니의 덕담 진행률</p>
              <p className={styles.progress_value}>
                {progress}
                <span className={styles.progress_percent_sign}>%</span>
              </p>
            </div>

            <div
              className={styles.progress_bar}
              style={progressBarStyle}
              aria-hidden
            >
              <div className={styles.progress_fill} />
            </div>

            <div className={styles.progress_footer}>
              <p className={styles.progress_text}>
                {progressText || "아직 덕담이 없어요. 첫 덕담을 남겨볼까요?"}
              </p>
              <p className={styles.progress_meta}>{membersText}</p>
            </div>
          </div>

          <div className={styles.mydeokdam_card}>
            <div className={styles.mydeokdam_top}>
              <p className={styles.mydeokdam_label}>내가 남긴 덕담</p>
              <p className={styles.mydeokdam_value}>
                {myDeokdamCount}
                <span className={styles.mydeokdam_unit}>개</span>
              </p>
            </div>

            <button
              type="button"
              className={styles.mydeokdam_button}
              onClick={() => pocket && setMyModalOpen(true)}
            >
              내가 남긴 덕담 확인하기
            </button>
          </div>
        </section>

        {/* 오른쪽: 정보 + 액션 패널 */}
        <section className={styles.info_panel}>
          <header className={styles.info_header}>
            <span className={styles.year_badge}>덕담 주머니 정보</span>
            {pocket?.code && (
              <button
                type="button"
                className={styles.code_chip}
                onClick={handleCopyCode}
              >
                <span className={styles.code_label}>참여 코드</span>
                <span className={styles.code_value}>{pocket.code}</span>
              </button>
            )}
          </header>

          <div className={styles.title_block}>
            <h1 className={styles.pocket_name}>
              {pocket ? pocket.name : "덕담 주머니"}
            </h1>
            <p className={styles.pocket_intro}>{pocket?.desc}</p>
          </div>

          <div className={styles.meta_grid}>
            {pocket && (
              <>
                <div className={styles.meta_item}>
                  <p className={styles.meta_label}>만든 사람</p>
                  <p className={styles.meta_value}>{madeByDisplay}</p>
                </div>
                <div className={styles.meta_item}>
                  <p className={styles.meta_label}>참여 인원</p>
                  <p className={styles.meta_value}>{membersText}</p>
                </div>
                <div className={styles.meta_item}>
                  <p className={styles.meta_label}>오픈일</p>
                  <p className={styles.meta_value}>
                    {formatDate(pocket.open_at)}
                  </p>
                </div>
                <div className={styles.meta_item}>
                  <p className={styles.meta_label}>생성일</p>
                  <p className={styles.meta_value}>
                    {formatDate(pocket.created_at, true)}
                  </p>
                </div>
              </>
            )}
          </div>

          <div className={styles.actions_block}>
            <button
              type="button"
              className={styles.primary_action}
              onClick={() => setWriteModalOpen(true)}
            >
              <span className={styles.action_label}>덕담 남기기</span>
            </button>
            <button
              type="button"
              className={styles.secondary_action}
              onClick={() => setInviteModalOpen(true)}
            >
              <span className={styles.action_label}>초대하기</span>
            </button>
          </div>

          <footer className={styles.info_footer}>
            <p className={styles.info_footer_text}>
              모든 덕담은 오픈일에 한꺼번에 공개돼요. 그때까지 기다려 주세요!
            </p>
          </footer>
        </section>
      </div>

      <footer className={styles.page_footer}>
        <p className={styles.footer_note}>
          ⓒ 2024 덕담 주머니 · 함께 나누는 말 한마디가 큰 힘이 돼요.
        </p>
      </footer>
    </main>
  );
}
