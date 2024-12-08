"use client";

import { useEffect, useState } from "react";
import _ from "./page.module.css";
import Image from "next/image";
import Link from "next/link";
import localFont from "next/font/local";
import MentExample from "@/components/ment_example";

const myFont = localFont({
  src: "./fonts/NanumMyeongjo.ttf",
});

const mentList = [
  {
    profile: "1",
    ment: "새해에도 함께 웃고, 함께 성장할 수 있길 바랄게요.🙏 새해 복 많이 받으세요.",
  },
  {
    profile: "2",
    ment: "2025년 무거운 짐들은 모두 벗어버리시고 새로운 마음으로 힘차게 출발하시길 기원합니다.",
  },
  {
    profile: "3",
    ment: "😄 웃을수록 행복이 찾아온다고 합니다. 2025년에는 웃음을 잃지 않고 좋은 일만 가득하시길 바랍니다.",
  },
  {
    profile: "4",
    ment: "을사년 새해에는 승승장구하시길 진심으로 기원합니다.",
  },
  {
    profile: "5",
    ment: "새해에는 사랑 속에서 늘 빛나고 행복하시길 희망합니다.",
  },
  {
    profile: "6",
    ment: "을사년 새해 복 많이 받으세요. 건강과 뜻하는 일이 모두 이루어지는 을사년이 되시길 바랍니다.",
  },
  {
    profile: "7",
    ment: "올 한 해도 정말 수고 많으셨습니다😊 2025 을사년에도 행복하고 좋인 일만 가득하길 바랄게요.",
  },
  {
    profile: "1",
    ment: "다사다난했던 한 해가 저물어 갑니다. 다가오는 새해에는 더욱 큰 행복과 희망이 함께 하시길 바랍니다.",
  },
  {
    profile: "4",
    ment: "새해 복 많이 받으세요! 항상 건강하시고 행복하세요🤩",
  },
  {
    profile: "7",
    ment: "2025년 새해 좋은 일, 행복한 일 가득하기를 바라며 늘 건강하시길 기원하겠습니다.",
  },
];

export default function Temp() {
  const [animation, setAnimation] = useState(false);
  const [showDiv, setShowDiv] = useState(false);
  const [showSubMention, setShowSubMention] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setShowDiv(true);
      setTimeout(() => {
        setShowSubMention(true);
      }, 300);
    }, 500);

    return () => {
      clearTimeout(timer);
    };
  }, []);

  return (
    <>
      <div
        style={{ display: `${animation ? "flex" : "none"}` }}
        className={_.sending_div}
      >
        <Image
          src="/images/kite_icon.png"
          alt="kite"
          width={100}
          height={100}
          className={_.sending_icon}
        />
        <p className={_.sending_ment}>
          덕담 주머니 만들러 가는 중...
          <br />
          <span
            onClick={() => {
              window.location.href = "/";
            }}
            style={{ cursor: "pointer", color: "#6f6f6f", fontSize: "0.9rem" }}
          >
            새로고침
          </span>
        </p>
      </div>
      <div className={animation ? _.blur_background : ""}>
        <div className={_.main}>
          <h1 className={_.title}>
            2025년은 새해 덕담과 함께
            <br />
            빛나는 한 해가 되기를 기원합니다
          </h1>
          <div
            className={showDiv ? [_.show, _.fade_div].join(" ") : _.fade_div}
          >
            <div className={_.count_div}>
              <Image
                src="/images/pocket.png"
                alt="pocket"
                width={35}
                height={35}
              />
              <p className={_.count}>
                지금까지 덕담 주머니 399개에
                <br />총 1,239개의 덕담이 모였어요!
              </p>
              <Image
                src="/images/pocket.png"
                alt="pocket"
                width={35}
                height={35}
              />
            </div>
            <div className={_.example_div}>
              <div className={_.ment_wrapper}>
                {mentList.map((ment, index) => (
                  <MentExample
                    key={index}
                    profile={ment.profile}
                    ment={ment.ment}
                  />
                ))}
              </div>
            </div>
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                justifyContent: "center",
                alignItems: "center",
                marginTop: "0.5rem",
              }}
            >
              <p className={_.mention}>
                덕담 주머니를 만들고 덕담을 남기면 다른 사용자의 덕담을 차곡차곡
                모을 수 있어요.
              </p>
              {/* <textarea
                className={[_.text_field, myFont.className].join(" ")}
                placeholder="새해 덕담을 적어주세요"
                onChange={(e) => {}}
              />
              <div style={{ width: "100%" }}>
                <p className={_.word_length} style={{ color: "#949494" }}>
                  0 / 150자
                  <br />
                </p>
              </div> */}
              <div className={_.button_div}>
                <button
                  className={[_.submit_btn, myFont.className].join(" ")}
                  onClick={async () => {
                    setAnimation(true);
                    location.href = "/select";
                  }}
                >
                  덕담 주머니 만들기
                </button>
              </div>
              <p className={_.sub_mention}>
                <span style={{ fontWeight: 800 }}>
                  이미 만들었다면?&nbsp;&nbsp;
                </span>
                <span className={_.jump_ment}>
                  내 덕담 주머니 열어보기&nbsp;&rarr;
                </span>
              </p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
