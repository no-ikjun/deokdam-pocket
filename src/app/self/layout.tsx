import type { Metadata } from "next";

export const metadata: Metadata = {
  alternates: {
    canonical: "https://deokdam.app/self",
  },
};

export default function SelfLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
