import { NextResponse } from "next/server";
import { withDbClient } from "@/utils/db";
import { verifyToken } from "@/utils/auth";
import { getOrCreateAnonId } from "@/sheep/server/anon";
import { isEventName } from "@/sheep/events";
import { SEASON } from "@/config/season";

export const dynamic = "force-dynamic";

const MAX_PROPS_BYTES = 1000;

export async function POST(req: Request) {
  let body: { name?: unknown; props?: unknown };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ message: "invalid json" }, { status: 400 });
  }
  if (!isEventName(body.name)) {
    return NextResponse.json({ message: "unknown event" }, { status: 400 });
  }
  const name = body.name;
  const props =
    body.props && typeof body.props === "object" && !Array.isArray(body.props)
      ? JSON.stringify(body.props)
      : null;
  if (props && props.length > MAX_PROPS_BYTES) {
    return NextResponse.json({ message: "props too large" }, { status: 400 });
  }

  const anonId = getOrCreateAnonId();
  const userUuid = await verifyToken();

  return withDbClient(async (client) => {
    await client.sql`
      INSERT INTO sheep_event (season, name, anon_id, user_uuid, props)
      VALUES (${SEASON.year}, ${name}, ${anonId}, ${userUuid}, ${props}::jsonb)
    `;
    return NextResponse.json({ message: "ok" }, { status: 201 });
  });
}
