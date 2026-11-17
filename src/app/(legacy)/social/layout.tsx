import type { Metadata } from "next";

export const metadata: Metadata = {
  alternates: {
    canonical: "https://deokdam.app/social",
  },
};

export default function SocialLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
