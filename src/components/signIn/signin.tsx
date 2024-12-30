import React, { useState, useRef, useEffect } from "react";
import Image from "next/image";
import styles from "./signin.module.css";
import localFont from "next/font/local";
import axios from "axios";
import Link from "next/link";

const myFont = localFont({
  src: "./fonts/NanumMyeongjo.ttf",
});

const SignIn = () => {
  const [name, setName] = useState<string>("");
  const [pin, setPin] = useState<string[]>(["", "", "", ""]);
  const inputRefs = useRef<Array<HTMLInputElement | null>>(Array(4).fill(null));
  const nameInputRef = useRef<HTMLInputElement | null>(null);

  // 입력 처리 함수
  const handleInputChange = (value: string, index: number) => {
    if (/^\d?$/.test(value)) {
      // 숫자 한 자리만 허용
      const newPin = [...pin];
      newPin[index] = value;
      setPin(newPin);

      // 입력 후 다음 칸으로 이동
      if (value && index < 3) {
        inputRefs.current[index + 1]?.focus();
      }
    }
  };

  // 백스페이스 처리
  const handleKeyDown = (e: React.KeyboardEvent, index: number) => {
    if (e.key === "Backspace") {
      const newPin = [...pin];

      // 현재 칸 비우기
      if (newPin[index]) {
        newPin[index] = "";
        setPin(newPin); // 현재 칸 값 지우기
      } else if (index > 0) {
        // 이전 칸으로 이동 후 삭제
        newPin[index - 1] = "";
        setPin(newPin);
        inputRefs.current[index - 1]?.focus(); // 포커스 이동
      }
    }
  };

  // 클릭 시 포커스 이동 처리 (아이콘 클릭 수정 가능)
  const handleFocus = (index: number) => {
    inputRefs.current[index]?.focus();
  };

  // 초기화 버튼 클릭 처리
  const handleReset = () => {
    setPin(["", "", "", ""]); // PIN 상태 초기화
    inputRefs.current[0]?.focus(); // 첫 번째 입력칸에 포커스
  };

  useEffect(() => {
    nameInputRef.current?.focus(); // 이름 입력칸에 포커스 설정
  }, []);

  return (
    <>
      <Image src="/images/pocket.png" alt="pocket" width={35} height={35} />
      <p className={styles.modal_title}>덕담 주머니 조회</p>
      <p className={styles.modal_ment}>내 덕담 주머니의 이름을 입력해주세요</p>
      <input
        className={styles.input}
        placeholder="내 덕담 주머니 이름 입력"
        ref={nameInputRef}
        value={name}
        onChange={(e) => setName(e.target.value)}
      />

      <p className={styles.modal_ment}>비밀번호 네 자리를 입력해주세요</p>
      <div className={styles.password_container}>
        <div className={styles.pin_container}>
          {pin.map((digit, index) => (
            <div
              key={index}
              className={styles.pin_box}
              onClick={() => handleFocus(index)}
              style={digit ? { border: "none" } : {}}
            >
              {digit ? (
                // 입력된 값이 있을 경우 pocket 아이콘 표시
                <Image
                  src="/images/pocket.png"
                  alt="pocket"
                  width={35}
                  height={35}
                />
              ) : (
                // 입력된 값이 없을 경우 입력창 표시
                <input
                  ref={(el) => (inputRefs.current[index] = el)}
                  type="tel"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  maxLength={1}
                  className={styles.pin_input}
                  value={digit}
                  onChange={(e) => handleInputChange(e.target.value, index)}
                  onKeyDown={(e) => handleKeyDown(e, index)}
                />
              )}
            </div>
          ))}
        </div>
        <div className={styles.reset_container}>
          <button className={styles.reset_button} onClick={handleReset}>
            초기화
          </button>
        </div>
      </div>
      <button
        className={[styles.submit_btn, myFont.className].join(" ")}
        onClick={async () => {
          try {
            const response = await axios.get(
              "/api/pocket?name=" + name + "&password=" + pin.join("")
            );
            if (response.status === 200) {
              console.log(response.data);
              localStorage.setItem("pocket_uuid", response.data.pocket_uuid);
              window.location.href = "/pocket";
            } else {
              alert("다시 시도해주세요.");
            }
          } catch (error) {
            console.log(error);
            alert("다시 시도해주세요.");
          }
        }}
      >
        조회하기
      </button>
      <p className={styles.modal_contact}>
        내 덕담 주머니 정보가 기억나지 않나요?{" "}
        <Link href="https://www.instagram.com/deokdam_pocket/" target="_blank">
          문의하기
        </Link>
      </p>
    </>
  );
};

export default SignIn;
