import { landingOgImage } from "@/sheep/og/render";

export const runtime = "edge";

export async function GET(req: Request) {
  return landingOgImage(new URL(req.url).origin);
}
