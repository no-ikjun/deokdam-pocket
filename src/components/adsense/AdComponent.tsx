"use client";

import React, { useEffect } from "react";
import { usePathname } from "next/navigation";
interface AdComponentProps {
  adSlot: string;
  adFormat?: string;
  adLayout?: string;
  layoutKey?: string;
  responsive?: boolean;
  style?: React.CSSProperties;
}
const AdComponent: React.FC<AdComponentProps> = ({
  adSlot,
  adFormat = "auto",
  adLayout = "",
  layoutKey = "",
  responsive = true,
  style,
}) => {
  const pathname = usePathname();
  useEffect(() => {
    try {
      (window as any).adsbygoogle = (window as any).adsbygoogle || [];
      (window as any).adsbygoogle.push({});
      console.log("AdSense ad loaded on", pathname);
    } catch (e) {
      console.error("Error loading ads:", e);
    }
  }, []);
  return pathname.startsWith("/test") ||
    pathname.startsWith("/aboutme") ? null : (
    <ins
      className="adsbygoogle"
      style={{ display: "block", ...style }}
      data-ad-client={"ca-pub-" + process.env.NEXT_PUBLIC_GAPID}
      data-ad-slot={adSlot}
      data-ad-format={adFormat}
      data-ad-layout={adLayout}
      data-ad-layout-key={layoutKey}
      data-full-width-responsive={responsive ? "true" : "false"}
    ></ins>
  );
};
export default AdComponent;
