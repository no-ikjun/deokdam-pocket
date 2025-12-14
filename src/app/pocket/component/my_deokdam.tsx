"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import Modal from "@/components/modal/modal";
import LoadingIndicator from "@/components/loadingIndicator/loadingIndicator";
import styles from "./my_deokdam.module.css";

type Member = {
  id: string;
  name: string;
};

type MyDeokdam = {
  deokdam_uuid: string;
  desc: string;
  destination: string[];
  isAnonymous: boolean;
  is_anony?: boolean;
  created_at: string;
};

type Props = {
  open: boolean;
  onClose: () => void;
  pocketUuid: string;
  members: Member[];
};

const formatDate = (iso: string) => {
  const d = new Date(iso);
  return `${d.getFullYear()}년 ${d.getMonth() + 1}월 ${d.getDate()}일`;
};

export default function MyDeokdamModal({
  open,
  onClose,
  pocketUuid,
  members,
}: Props) {
  const [loading, setLoading] = useState(false);
  const [list, setList] = useState<MyDeokdam[]>([]);

  const fetchMyDeokdams = async () => {
    if (!pocketUuid) return;
    setLoading(true);
    try {
      const res = await axios.get("/api/deokdam/mine/pocket", {
        params: { pocket_uuid: pocketUuid },
      });
      if (res.status === 200) {
        const data = (res.data as MyDeokdam[]).map((item) => ({
          ...item,
          isAnonymous:
            typeof item.is_anony === "boolean"
              ? item.is_anony
              : item.isAnonymous,
        }));
        setList(data);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!open || !pocketUuid) return;
    void fetchMyDeokdams();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  return (
    <Modal isOpen={open} onClose={onClose}>
      <div className={styles.container}>
        <header className={styles.header}>
          <h2 className={styles.title}>내가 남긴 덕담</h2>
          <p className={styles.sub}>이 주머니에 작성한 덕담 {list.length}개</p>
        </header>

        {loading ? (
          <div className={styles.loading}>
            <LoadingIndicator />
          </div>
        ) : list.length === 0 ? (
          <div className={styles.empty}>
            아직 이 주머니에 남긴 덕담이 없어요.
            <br />첫 덕담을 남겨보세요!
          </div>
        ) : (
          <div className={styles.list}>
            {list
              .slice()
              .sort((a, b) => +new Date(b.created_at) - +new Date(a.created_at))
              .map((d) => (
                <div key={d.deokdam_uuid} className={styles.item}>
                  <div className={styles.meta}>
                    <span className={styles.date}>
                      {formatDate(d.created_at)}
                    </span>
                    {d.isAnonymous && (
                      <span className={styles.badge}>익명</span>
                    )}
                  </div>

                  <p className={styles.desc}>{d.desc}</p>

                  <p className={styles.to}>
                    받는 사람:{" "}
                    <span className={styles.to_names}>
                      {d.destination
                        .map(
                          (id) =>
                            members.find((m) => m.id === id)?.name ??
                            "알 수 없음"
                        )
                        .join(", ")}
                    </span>
                  </p>
                </div>
              ))}
          </div>
        )}

        <footer className={styles.footer}>
          <button className={styles.close} onClick={onClose}>
            닫기
          </button>
        </footer>
      </div>
    </Modal>
  );
}
