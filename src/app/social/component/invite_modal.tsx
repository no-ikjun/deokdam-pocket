"use client";

import { useCallback, useMemo, useRef, useState } from "react";
import styles from "../page.module.css";
import { useQRCode } from "next-qrcode";
import ToastPopup from "@/components/toastPopup/toastPopup";

type InviteModalProps = {
  name: string;
  uuid: string;
  inviteLink?: string;
  code: string;
};

export default function InviteModal({
  name,
  uuid,
  inviteLink,
  code,
}: InviteModalProps) {
  const { SVG } = useQRCode();
  const safeOrigin =
    typeof window !== "undefined" ? window.location.origin : "";

  const fullLink = useMemo(
    () => inviteLink || `${safeOrigin}/pocket/${uuid}`,
    [inviteLink, safeOrigin, uuid]
  );
  const qrContainerRef = useRef<HTMLDivElement>(null);

  const [toastMessage, setToastMessage] = useState("");
  const [toastOpen, setToastOpen] = useState(false);

  const copy = async (text: string, msg: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setToastMessage(msg);
      setToastOpen(true);
    } catch {
      alert("복사하지 못했어요. 직접 복사해 주세요.");
    }
  };

  const onKey =
    (fn: () => void) => (e: React.KeyboardEvent<HTMLDivElement>) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        fn();
      }
    };

  const saveQrImage = useCallback(() => {
    const container = qrContainerRef.current;
    if (!container) {
      alert("이미지를 찾지 못했어요. 다시 시도해 주세요.");
      return;
    }

    const svg = container.querySelector("svg");
    if (!svg) {
      alert("이미지를 찾지 못했어요. 다시 시도해 주세요.");
      return;
    }

    const serializer = new XMLSerializer();
    let source = serializer.serializeToString(svg);

    if (!source.includes('xmlns="http://www.w3.org/2000/svg"')) {
      source = source.replace(
        "<svg",
        '<svg xmlns="http://www.w3.org/2000/svg"'
      );
    }

    if (!source.startsWith("<?xml")) {
      source = `<?xml version="1.0" standalone="no"?>\n${source}`;
    }

    const svgBlob = new Blob([source], {
      type: "image/svg+xml;charset=utf-8",
    });
    const svgUrl = URL.createObjectURL(svgBlob);
    const image = new Image();
    image.crossOrigin = "anonymous";

    image.onload = () => {
      try {
        const widthAttr = svg.getAttribute("width");
        const heightAttr = svg.getAttribute("height");
        const width = widthAttr ? parseInt(widthAttr, 10) : image.width;
        const height = heightAttr ? parseInt(heightAttr, 10) : image.height;

        const canvas = document.createElement("canvas");
        canvas.width = width || 200;
        canvas.height = height || 200;
        const context = canvas.getContext("2d");
        if (!context) {
          throw new Error("canvas context missing");
        }

        context.drawImage(image, 0, 0, canvas.width, canvas.height);
        canvas.toBlob(
          (blob) => {
            try {
              if (!blob) {
                const fallbackUrl = canvas.toDataURL("image/png");
                const link = document.createElement("a");
                link.href = fallbackUrl;
                link.download = `${code}-invite-qr.png`;
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
                return;
              }

              const blobUrl = URL.createObjectURL(blob);
              const link = document.createElement("a");
              link.href = blobUrl;
              link.download = `${code}-invite-qr.png`;
              document.body.appendChild(link);
              link.click();
              document.body.removeChild(link);
              URL.revokeObjectURL(blobUrl);
            } catch {
              alert("이미지를 저장하지 못했어요. 다시 시도해 주세요.");
            }
          },
          "image/png",
          0.92
        );
      } catch {
        alert("이미지를 저장하지 못했어요. 다시 시도해 주세요.");
      } finally {
        setToastMessage("QR 코드 이미지를 저장했어요!");
        setToastOpen(true);
        URL.revokeObjectURL(svgUrl);
      }
    };

    image.onerror = () => {
      URL.revokeObjectURL(svgUrl);
      alert("이미지를 저장하지 못했어요. 다시 시도해 주세요.");
    };

    image.src = svgUrl;
  }, [code]);

  return (
    <>
      <ToastPopup
        open={toastOpen}
        type="success"
        message={toastMessage}
        duration={2000}
        onClose={() => setToastOpen(false)}
        actionLabel=""
        onAction={() => console.log("undo")}
      />

      <header className={styles.modal_head}>
        <h3 id="invite_title" className={styles.modal_title}>
          초대하기
        </h3>
      </header>

      <div className={styles.modal_body}>
        <p>{name}</p>
        <div className={styles.qr_wrap} aria-label="초대 링크 QR 코드">
          <p className={styles.qr_text}>
            하단 QR코드를 스캔해 바로 입장하세요!
          </p>
          <div ref={qrContainerRef} className={styles.qr_canvas}>
            <SVG
              text={fullLink}
              options={{
                type: "image/jpeg",
                quality: 0.3,
                errorCorrectionLevel: "M",
                margin: 3,
                scale: 4,
                width: 200,
                color: {
                  dark: "#000000",
                  light: "#FFFFFF00",
                },
              }}
            />
          </div>
          <div
            role="button"
            tabIndex={0}
            className={styles.qr_btn}
            onClick={saveQrImage}
            onKeyDown={onKey(saveQrImage)}
          >
            이미지 저장하기
          </div>
        </div>

        <div className={styles.code_box} aria-label="주머니 코드">
          <span className={styles.code_label}>초대 코드</span>
          <span className={styles.code_value}>{code}</span>
        </div>

        <div className={styles.actions}>
          <div
            role="button"
            tabIndex={0}
            className={`${styles.btn} ${styles.primary_btn}`}
            onClick={() => copy(fullLink, "초대 링크를 복사했어요!")}
            onKeyDown={onKey(() => copy(fullLink, "초대 링크를 복사했어요!"))}
          >
            링크 복사하기
          </div>

          <div
            role="button"
            tabIndex={0}
            className={`${styles.btn} ${styles.secondary_btn}`}
            onClick={() => copy(code, "코드를 복사했어요!")}
            onKeyDown={onKey(() => copy(code, "코드를 복사했어요!"))}
          >
            코드 복사하기
          </div>
        </div>
      </div>
    </>
  );
}
