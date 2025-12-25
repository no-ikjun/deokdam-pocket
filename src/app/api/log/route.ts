import { NextResponse } from "next/server";
import { v4 as uuidv4 } from "uuid";
import { withAuthAndDb } from "@/utils/db";

export async function POST(req: Request) {
  return withAuthAndDb(async (user_uuid, client) => {
    try {
      const request = await req.json();
      const { logType, action, metadata } = request as {
        logType: string;
        action?: string;
        metadata?: Record<string, any>;
      };

      if (!logType) {
        return NextResponse.json(
          { message: "logType is required" },
          { status: 400 }
        );
      }

      const logUuid = uuidv4();
      const metadataJson = metadata ? JSON.stringify(metadata) : null;

      await client.sql`
        INSERT INTO event_logs (
          log_uuid,
          log_type,
          action,
          user_uuid,
          metadata,
          created_at
        )
        VALUES (
          ${logUuid},
          ${logType},
          ${action || null},
          ${user_uuid},
          ${metadataJson}::jsonb,
          NOW()
        )
      `;

      return NextResponse.json(
        { message: "success", log_uuid: logUuid },
        { status: 201 }
      );
    } catch (error) {
      console.error("Error creating log:", error);
      return NextResponse.json(
        { message: "error", error: "Failed to create log" },
        { status: 500 }
      );
    }
  });
}
