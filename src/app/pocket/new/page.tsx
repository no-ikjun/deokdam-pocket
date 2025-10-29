"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import styles from "./page.module.css";

export default function NewPouchPage() {
  const router = useRouter();

  const [name, setName] = useState("");
  const [icon, setIcon] = useState("🧧");
  const [maxMembers, setMaxMembers] = useState<number | "">("");
  const [goalCount, setGoalCount] = useState<number | "">("");

  const icons = ["🧧", "🎁", "💌", "🎊", "🌸", "🍀", "💫", "🎈"];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!name || !maxMembers || !goalCount) {
      alert("모든 항목을 입력해주세요.");
      return;
    }

    // 실제로는 API POST 로직이 들어감
    console.log({ name, icon, maxMembers, goalCount });

    // 완료 페이지로 이동
    router.push("/pocket/new/done?code=HAPPY25");
  };

  return (
    <main className={styles.new_wrap}>
      <header className={styles.header}>
        <h1 className={styles.title}>새 덕담 주머니 만들기</h1>
        <p className={styles.subtitle}>
          이름과 아이콘을 정하고, 함께할 사람들과 목표를 설정하세요.
        </p>
      </header>

      <form className={styles.form} onSubmit={handleSubmit}>
        {/* 이름 입력 */}
        <div className={styles.field}>
          <label htmlFor="name" className={styles.label}>
            주머니 이름
          </label>
          <input
            id="name"
            className={styles.input}
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="예: 새해 가족 덕담 주머니"
            maxLength={30}
          />
        </div>

        {/* 아이콘 선택 */}
        <div className={styles.field}>
          <span className={styles.label}>아이콘 선택</span>
          <div className={styles.icon_grid}>
            {icons.map((emoji) => (
              <button
                key={emoji}
                type="button"
                className={`${styles.icon_btn} ${
                  icon === emoji ? styles.active_icon : ""
                }`}
                onClick={() => setIcon(emoji)}
              >
                {emoji}
              </button>
            ))}
          </div>
        </div>

        {/* 최대 인원 수 */}
        <div className={styles.field}>
          <label htmlFor="maxMembers" className={styles.label}>
            최대 인원 수
          </label>
          <input
            id="maxMembers"
            type="number"
            className={styles.input}
            value={maxMembers}
            onChange={(e) => setMaxMembers(Number(e.target.value))}
            placeholder="예: 10"
            min={1}
            max={50}
          />
        </div>

        {/* 목표 덕담 수 */}
        <div className={styles.field}>
          <label htmlFor="goalCount" className={styles.label}>
            목표 덕담 수
          </label>
          <input
            id="goalCount"
            type="number"
            className={styles.input}
            value={goalCount}
            onChange={(e) => setGoalCount(Number(e.target.value))}
            placeholder="예: 30"
            min={1}
            max={200}
          />
        </div>

        <button type="submit" className={styles.submit_btn}>
          덕담 주머니 만들기
        </button>
      </form>
    </main>
  );
}
