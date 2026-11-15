import type { Metadata } from "next";

export const metadata: Metadata = {
  alternates: {
    canonical: "https://deokdam.app/policy",
  },
};

export default function PolicyLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
