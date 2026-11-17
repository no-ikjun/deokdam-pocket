import { getSheepType, isSheepTypeId } from "@/sheep/data/types";
import { storyImage, typeOgImage } from "@/sheep/og/render";

export const runtime = "edge";

export async function GET(
  req: Request,
  { params }: { params: { type: string; shape: string } }
) {
  if (!isSheepTypeId(params.type)) {
    return new Response("not found", { status: 404 });
  }
  const type = getSheepType(params.type);
  const origin = new URL(req.url).origin;
  if (params.shape === "story") return storyImage(type, origin);
  if (params.shape === "og") return typeOgImage(type, origin);
  return new Response("not found", { status: 404 });
}
