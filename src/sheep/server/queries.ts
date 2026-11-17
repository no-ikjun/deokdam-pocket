import { sql } from "@/sheep/server/db";
import { validate as isUuid } from "uuid";
import { isSheepTypeId, type SheepTypeId } from "@/sheep/data/types";

export type StoredResult = {
  resultId: string;
  anonId: string;
  typeId: SheepTypeId;
};

export type StoredPair = {
  pairId: string;
  inviterTypeId: SheepTypeId;
  inviteeTypeId: SheepTypeId;
  inviterNickname: string | null;
  inviteeNickname: string | null;
};

/** 별명은 앞뒤 공백을 지우고 12자까지만 받는다. 비어 있으면 null. */
export function cleanNickname(value: unknown): string | null {
  if (typeof value !== "string") return null;
  const trimmed = value.replace(/\s+/g, " ").trim().slice(0, 12);
  return trimmed || null;
}

export async function getResult(resultId: string): Promise<StoredResult | null> {
  if (!isUuid(resultId)) return null;
  const { rows } = await sql`
    SELECT result_id, anon_id, type_id FROM sheep_result WHERE result_id = ${resultId}
  `;
  const row = rows[0];
  if (!row || !isSheepTypeId(row.type_id)) return null;
  return { resultId: row.result_id, anonId: row.anon_id, typeId: row.type_id };
}

export async function getPair(pairId: string): Promise<StoredPair | null> {
  if (!isUuid(pairId)) return null;
  const { rows } = await sql`
    SELECT p.pair_id, a.type_id AS inviter_type, b.type_id AS invitee_type,
           p.inviter_nickname, p.invitee_nickname
    FROM sheep_pair p
    JOIN sheep_result a ON a.result_id = p.inviter_result_id
    JOIN sheep_result b ON b.result_id = p.invitee_result_id
    WHERE p.pair_id = ${pairId}
  `;
  const row = rows[0];
  if (!row || !isSheepTypeId(row.inviter_type) || !isSheepTypeId(row.invitee_type)) {
    return null;
  }
  return {
    pairId: row.pair_id,
    inviterTypeId: row.inviter_type,
    inviteeTypeId: row.invitee_type,
    inviterNickname: row.inviter_nickname,
    inviteeNickname: row.invitee_nickname,
  };
}

/** 내가 보낸 궁합 링크로 완성된 궁합 목록 (최근 순, 최대 50개) */
export async function listPairsByInviter(
  inviterResultId: string
): Promise<{ pairId: string; inviteeTypeId: SheepTypeId; inviteeNickname: string | null }[]> {
  if (!isUuid(inviterResultId)) return [];
  const { rows } = await sql`
    SELECT p.pair_id, b.type_id, p.invitee_nickname
    FROM sheep_pair p
    JOIN sheep_result b ON b.result_id = p.invitee_result_id
    WHERE p.inviter_result_id = ${inviterResultId}
    ORDER BY p.created_at DESC
    LIMIT 50
  `;
  return rows
    .filter((r) => isSheepTypeId(r.type_id))
    .map((r) => ({
      pairId: r.pair_id,
      inviteeTypeId: r.type_id as SheepTypeId,
      inviteeNickname: r.invitee_nickname,
    }));
}

export type StoredFlock = {
  flockId: string;
  kind: "chat" | "family";
  name: string;
  /** 들어온 순서 */
  members: { anonId: string; nickname: string; typeId: SheepTypeId }[];
};

export async function getFlock(flockId: string): Promise<StoredFlock | null> {
  if (!isUuid(flockId)) return null;
  const flock = await sql`
    SELECT flock_id, kind, name FROM sheep_flock WHERE flock_id = ${flockId}
  `;
  if (!flock.rows[0]) return null;
  const members = await sql`
    SELECT m.anon_id, m.nickname, r.type_id
    FROM sheep_flock_member m
    JOIN sheep_result r ON r.result_id = m.result_id
    WHERE m.flock_id = ${flockId}
    ORDER BY m.joined_at, m.anon_id
  `;
  return {
    flockId: flock.rows[0].flock_id,
    kind: flock.rows[0].kind === "family" ? "family" : "chat",
    name: flock.rows[0].name,
    members: members.rows
      .filter((r) => isSheepTypeId(r.type_id))
      .map((r) => ({
        anonId: r.anon_id,
        nickname: r.nickname,
        typeId: r.type_id as SheepTypeId,
      })),
  };
}
