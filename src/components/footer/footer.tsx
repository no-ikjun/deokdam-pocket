"use client";

import Link from "next/link";
import styles from "./footer.module.css";
import { useAuthStore } from "@/stores/auth";
import { logoutAndRedirect } from "@/utils/logout";

interface FooterProps {
  showButtons?: boolean;
  usingIcons?: boolean;
}

export default function Footer({
  showButtons = true,
  usingIcons = false,
}: FooterProps) {
  const isLoggedIn = useAuthStore((state) => state.isAuthenticated);

  return (
    <footer className={styles.footer}>
      {showButtons && (
        <div className={styles.info_div}>
          <Link
            href="https://ikjun.notion.site/148ee261b89580ac9ad5defe33a92f65?pvs=4"
            className={styles.info_ment}
            target="_blank"
          >
            덕담 주머니란?
          </Link>

          <Link href="/policy" className={styles.info_ment} target="_blank">
            개인정보 처리방침
          </Link>

          {isLoggedIn() ? (
            <button
              type="button"
              className={styles.info_ment_btn}
              onClick={() => logoutAndRedirect("/")}
            >
              로그아웃
            </button>
          ) : (
            <></>
          )}
        </div>
      )}

      <div className={styles.footerContent}>
        <p className={styles.copyright}>
          ⓒ 2024 덕담 주머니
          {showButtons ? (
            ". All rights reserved."
          ) : usingIcons ? (
            <span
              style={{
                marginLeft: "0.5rem",
              }}
            >
              아이콘: flaticon.com
            </span>
          ) : (
            <Link
              href="/policy"
              style={{
                textDecoration: "none",
                color: "inherit",
                marginLeft: "0.5rem",
              }}
            >
              개인정보 처리방침
            </Link>
          )}
        </p>
        <p className={styles.contact}>
          문의 :{" "}
          <a
            href="mailto:deokdam@ikjun.com"
            style={{ textDecoration: "none", color: "inherit", margin: 0 }}
          >
            deokdam@ikjun.com
          </a>
        </p>
      </div>
    </footer>
  );
}
