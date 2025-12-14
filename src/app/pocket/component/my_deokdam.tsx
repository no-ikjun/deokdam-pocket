"use client";

import { useEffect, useMemo, useState } from "react";
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

  const [modifyMode, setModifyMode] = useState(false);
  const [modifyId, setModifyId] = useState<string | null>(null);
  const [modifyDesc, setModifyDesc] = useState("");
  const [modifyAnonymous, setModifyAnonymous] = useState(false);
  const [saving, setSaving] = useState(false);

  const selectedItem = useMemo(
    () => (modifyId ? list.find((d) => d.deokdam_uuid === modifyId)! : null),
    [modifyId, list]
  );

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
    // 모달 열릴 때마다 초기화
    setModifyMode(false);
    setModifyId(null);
    setModifyDesc("");
    setModifyAnonymous(false);
    void fetchMyDeokdams();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  const startEdit = (item: MyDeokdam) => {
    setModifyId(item.deokdam_uuid);
    setModifyDesc(item.desc ?? "");
    setModifyAnonymous(
      typeof item.isAnonymous === "boolean" ? item.isAnonymous : !!item.is_anony
    );
  };

  const cancelEdit = () => {
    setModifyMode(false);
    setModifyId(null);
    setModifyDesc("");
    setModifyAnonymous(false);
  };

  const saveEdit = async () => {
    if (!modifyId) return;
    if (!modifyDesc.trim()) {
      alert("덕담 내용을 입력해 주세요.");
      return;
    }

    setSaving(true);
    try {
      const res = await axios.patch("/api/deokdam/mine", {
        deokdam_uuid: modifyId,
        desc: modifyDesc.trim(),
        is_anony: modifyAnonymous,
      });

      if (res.status === 200) {
        setList((prev) =>
          prev.map((x) =>
            x.deokdam_uuid === modifyId
              ? {
                  ...x,
                  desc: modifyDesc.trim(),
                  is_anony: modifyAnonymous,
                  isAnonymous: modifyAnonymous,
                }
              : x
          )
        );
        cancelEdit();
      } else {
        throw new Error("update failed");
      }
    } catch (e) {
      console.error(e);
      alert("덕담 수정에 실패했어요. 잠시 후 다시 시도해 주세요.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal isOpen={open} onClose={onClose}>
      <div className={styles.container}>
        <header className={styles.header}>
          <h2 className={styles.title}>내가 남긴 덕담</h2>
          <p className={styles.sub}>이 주머니에 작성한 덕담 {list.length}개</p>
        </header>

        {loading ? (
          <div className={styles.loading}>
            <LoadingIndicator text="덕담 불러오는 중..." />
          </div>
        ) : list.length === 0 ? (
          <div className={styles.empty}>
            아직 이 주머니에 남긴 덕담이 없어요.
            <br />첫 덕담을 남겨보세요!
          </div>
        ) : modifyMode ? (
          <section className={styles.edit_shell}>
            {/* 받는 사람/생성일은 상단에 작은 정보로 */}
            <div className={styles.edit_meta}>
              <span className={styles.edit_date}>
                {formatDate(selectedItem?.created_at!)}
              </span>
              <span className={styles.edit_to}>
                받는 사람:{" "}
                <span className={styles.to_names}>
                  {selectedItem?.destination
                    .map(
                      (id) =>
                        members.find((m) => m.id === id)?.name ?? "알 수 없음"
                    )
                    .join(", ")}
                </span>
              </span>
            </div>

            {/* textarea (DeokdamWriteModal 톤) */}
            <div className={styles.text_area_wrap}>
              <textarea
                className={styles.text_area}
                placeholder="덕담을 수정해 주세요 (최대 200자)"
                maxLength={200}
                value={modifyDesc}
                onChange={(e) => setModifyDesc(e.target.value)}
                disabled={saving}
              />
              <div className={styles.text_count}>{modifyDesc.length}/200</div>
            </div>

            {/* 익명 토글 (DeokdamWriteModal 그대로) */}
            <div className={styles.toggle_row}>
              <span className={styles.toggle_label}>익명으로 남기기</span>
              <label className={styles.toggle_switch}>
                <input
                  type="checkbox"
                  checked={modifyAnonymous}
                  onChange={(e) => setModifyAnonymous(e.target.checked)}
                  disabled={saving}
                />
                <span className={styles.slider}></span>
              </label>
            </div>

            {/* 저장/취소 버튼 */}
            <div className={styles.edit_actions}>
              <div
                role="button"
                tabIndex={0}
                className={`${styles.btn} ${styles.secondary_btn}`}
                onClick={cancelEdit}
              >
                취소
              </div>

              <div
                role="button"
                tabIndex={0}
                className={`${styles.btn} ${styles.primary_btn}`}
                onClick={saveEdit}
              >
                {saving ? "저장 중..." : "저장하기"}
              </div>
            </div>
          </section>
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

                  <div className={styles.list_bottom}>
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

                    <button
                      type="button"
                      className={styles.modify_btn}
                      onClick={() => {
                        startEdit(d);
                        setModifyMode(true);
                      }}
                    >
                      수정하기
                    </button>
                  </div>
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
