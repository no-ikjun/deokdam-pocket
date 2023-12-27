"use client";

import { useEffect } from "react";
import styles from "./page.module.css";
import {
  useRouter,
  usePathname,
  useSearchParams,
  useSelectedLayoutSegment,
  useSelectedLayoutSegments,
  redirect,
  notFound,
} from "next/navigation";
import axios from "axios";

const getCount = async (): Promise<any> => {
  try {
    const res = await axios.get("/api/ment", {
      headers: {
        "Cache-Control": "no-cache",
        Pragma: "no-cache",
        Expires: "0",
      },
    });
    if (res.status === 200) {
      return res.data.ment;
    }
  } catch (err) {
    console.log(err);
    return "";
  }
  return "";
};

export default function Ment() {
  const searchParams = useSearchParams();
  const search = searchParams.get("s");

  useEffect(() => {
    async function fetchMent() {
      const ment = await getCount();
      console.log(ment);
    }
    fetchMent();
  }, []);

  useEffect(() => {
    console.log(search);
  }, [search]);

  return (
    <div className={styles.main}>
      <h1>덕담 주머니</h1>
      <p>갑진년 새해는 모두 함께 덕담을 나누며 힘차게 출발합시다!</p>
    </div>
  );
}
