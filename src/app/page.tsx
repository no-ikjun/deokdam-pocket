"use client";

import Head from "next/head";
import styles from "./page.module.css";
import { useEffect, useState } from "react";
import Image from "next/image";
import useCountNum from "@/hooks/countUp";
import Link from "next/link";
import MentExample from "@/components/ment_example";
import axios from "axios";

const mentList = [
  {
    profile: "1",
    ment: "새해에도 함께 웃고, 함께 성장할 수 있길 바랄게요.🙏 새해 복 많이 받으세요.",
  },
  {
    profile: "2",
    ment: "2024년 무거운 짐들은 모두 벗어버리시고 새로운 마음으로 힘차게 출발하시길 기원합니다.",
  },
  {
    profile: "3",
    ment: "😄 웃을수록 행복이 찾아온다고 합니다. 2024년에는 웃음을 잃지 않고 좋은 일만 가득하시길 바랍니다.",
  },
  {
    profile: "4",
    ment: "갑진년 새해에는 승승장구하시길 진심으로 기원합니다.",
  },
  {
    profile: "5",
    ment: "새해에는 사랑 속에서 늘 빛나고 행복하시길 희망합니다.",
  },
  {
    profile: "6",
    ment: "갑진년 새해 복 많이 받으세요. 건강과 뜻하는 일이 모두 이루어지는 갑진년이 되시길 바랍니다.",
  },
  {
    profile: "7",
    ment: "올 한 해도 정말 수고 많으셨습니다☺️ 2024 갑진년에도 행복하고 좋인 일만 가득하길 바랄게요.",
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
    ment: "2024년 새해 좋은 일, 행복한 일 가득하기를 바라며 늘 건강하시길 기원하겠습니다.",
  },
];

const getCount = async (): Promise<number> => {
  try {
    const res = await axios.get("/api/ment/count");
    if (res.status === 200) {
      return res.data.count;
    }
  } catch (err) {
    console.log(err);
    return 0;
  }
  return 0;
};

const setMent = async () => {
  const ment = "good";
  try {
    const res = await axios.post("/api/ment", { ment });
    if (res.status === 201) {
      alert("덕담이 전달되었습니다!");
    } else {
      alert("적어주신 덕담을 다시 확인해주세요.");
    }
  } catch (err) {
    console.log(err);
    alert("적어주신 덕담을 다시 확인해주세요.");
  }
};

export default function Home() {
  const [showDiv, setShowDiv] = useState(false);
  const [tempCount, setTempCount] = useState(0);
  const count = useCountNum(tempCount);

  useEffect(() => {
    // getCount 함수를 호출하고 결과를 tempCount에 저장합니다.
    async function fetchCount() {
      const count = await getCount();
      console.log(count);
      setTempCount(count);
    }

    fetchCount();

    // setShowDiv 관련 로직
    const timer = setTimeout(() => {
      setShowDiv(true);
    }, 500);

    return () => {
      clearTimeout(timer);
    };
  }, []);

  return (
    <div className={styles.main}>
      <Head>
        <link
          href="https://hangeul.pstatic.net/hangeul_static/css/nanum-myeongjo.css"
          rel="stylesheet"
        />
      </Head>
      <h1 className={styles.title}>
        2024년은 새해 덕담과 함께
        <br />
        빛나는 한 해가 되기를 기원합니다
      </h1>
      <div
        className={
          showDiv ? [styles.show, styles.fade_div].join(" ") : styles.fade_div
        }
      >
        <div className={styles.count_div}>
          <Image src="/images/pocket.png" alt="pocket" width={40} height={40} />
          <p className={styles.count}>
            지금까지 총 {count.toLocaleString()}개의 덕담이 모였어요
          </p>
          <Image src="/images/pocket.png" alt="pocket" width={40} height={40} />
        </div>
        <div className={styles.example_div}>
          <div className={styles.ment_wrapper}>
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
          <p className={styles.mention}>
            덕담을 적어주시면 다른 사용자들이 작성한 덕담을 전달받을 수
            있어요.&nbsp;&nbsp;
            <Link href="/" className={styles.jump_ment}>
              건너뛰기
            </Link>
          </p>
          <textarea
            className={styles.text_field}
            placeholder="새해 덕담을 적어주세요"
          />
          <div className={styles.button_div}>
            <button className={styles.submit_btn} onClick={setMent}>
              전달하기
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
