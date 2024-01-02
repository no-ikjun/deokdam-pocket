"use client";
import Image from "next/image";
import styles from "./page.module.css";
import { useEffect, useState } from "react";
import MentExample from "@/components/ment_example";
import axios from "axios";
import Link from "next/link";
import useCountNum from "@/hooks/countUp";

function formatDateString(dateString: string) {
  const date = new Date(dateString);
  const year = date.getFullYear();
  const month = date.getMonth() + 1; // getMonth()는 0부터 시작하기 때문에 1을 더해줍니다.
  const day = date.getDate();
  const hours = date.getHours();
  const minutes = date.getMinutes();

  return `${year}년 ${month}월 ${day}일 ${hours}시 ${minutes}분`;
}

interface mentShow {
  ment: string;
  reaction: number;
  share: number;
}

type MentItem = [string, number, number];

const getMent = async (uuid: string): Promise<any> => {
  try {
    const res = await axios.get(`/api/ment?uuid=${uuid}`, {
      headers: {
        "Cache-Control": "no-cache",
        Pragma: "no-cache",
        Expires: "0",
      },
    });
    if (res.status === 200) {
      return res.data;
    }
  } catch (err) {
    console.log(err);
    return "";
  }
  return "";
};

const getRank = async (): Promise<mentShow[]> => {
  try {
    const res = await axios.get("/api/ment/rank", {
      headers: {
        "Cache-Control": "no-cache",
        Pragma: "no-cache",
        Expires: "0",
      },
    });
    if (res.status === 200) {
      let result = [];
      for (let i = 0; i < res.data.rows.length; i++) {
        result.push({
          ment: res.data.rows[i].ment,
          reaction:
            res.data.rows[i].liked01 +
            res.data.rows[i].liked02 +
            res.data.rows[i].liked03,
          share: res.data.rows[i].shared,
        });
      }
      return result;
    }
  } catch (err) {
    console.log(err);
    return [];
  }
  return [];
};

const getMoney = async (): Promise<any> => {
  try {
    const res = await axios.get("/api/money", {
      headers: {
        "Cache-Control": "no-cache",
        Pragma: "no-cache",
        Expires: "0",
      },
    });
    console.log(res.data.money);
    if (res.status === 200) {
      return res.data.money;
    }
  } catch (err) {
    console.log(err);
    return 0;
  }
  return 0;
};

export default function Data() {
  const [showDiv, setShowDiv] = useState(false);

  const [rankMent, setMentRank] = useState<mentShow[]>([]);
  const [myMent, setMyMent] = useState<MentItem[]>([]);

  const [money, setMoney] = useState(0);
  const count = useCountNum(money);
  const [moneyDate, setMoneyDate] = useState("");

  useEffect(() => {
    getMoney().then((res) => {
      setMoney(res.money * 1);
      setMoneyDate(formatDateString(res.updated_at));
    });

    const myMentInfo = async () => {
      const uuids = JSON.parse(localStorage.getItem("new-year-ment") ?? "[]");
      let result: MentItem[] = [];
      for (let i = uuids.length - 1; i > uuids.length - 4; i--) {
        if (i < 0) break;
        const ment = await getMent(uuids[i]);
        result.push([
          ment.ment.ment,
          ment.ment.liked01 + ment.ment.liked02 + ment.ment.liked03,
          ment.ment.shared,
        ]);
      }
      setMyMent(result);
    };
    myMentInfo();

    getRank().then((res) => {
      setMentRank(res);
    });

    const timer = setTimeout(() => {
      setShowDiv(true);
    }, 500);
    return () => clearTimeout(timer);
  }, []);

  // 렌더링 부분은 그대로 유지합니다.

  return (
    <>
      <div className={styles.main}>
        <h1 className={styles.title}>
          지금까지 기부금 {money.toLocaleString()}원이 적립되었습니다
        </h1>
        <p className={styles.time}>{moneyDate} 기준</p>
        <div
          className={
            showDiv ? [styles.show, styles.fade_div].join(" ") : styles.fade_div
          }
        >
          <div className={styles.rank_div}>
            <div className={styles.rank}>
              <h2 className={styles.rank_title}>인기 덕담 순위</h2>
              {rankMent.map((ment, index) => {
                let color = "";
                if (index === 0) color = "gold";
                else if (index === 1) color = "silver";
                else if (index === 2) color = "bronze";
                return (
                  <span key={ment.ment}>
                    <div className={styles.ment_wrapper}>
                      <MentExample profile={color} ment={ment.ment} />
                    </div>
                    <p className={styles.rank_detail}>
                      반응: {ment.reaction}개 | 전달: {ment.share}회
                    </p>
                  </span>
                );
              })}
            </div>
            <div className={styles.rank}>
              <h2 className={styles.rank_title}>내 덕담 정보</h2>
              {myMent.map((ment, index) => (
                <span key={index}>
                  <div className={styles.ment_wrapper}>
                    <MentExample profile="star" ment={ment[0]} />
                  </div>
                  <p className={styles.rank_detail}>
                    반응: {ment[1]}개 | 전달: {ment[2]}회
                  </p>
                </span>
              ))}
            </div>
          </div>
          <div className={styles.next_div}>
            <Link href="/" className={styles.next_ment}>
              다른 덕담 작성하기&nbsp;&rarr;
            </Link>
          </div>
        </div>
      </div>
    </>
  );
}
