/**
 * 덕담 주머니 타입 정의
 */
export type Pocket = {
  pocket_uuid: string;
  made_by: string;
  name: string;
  desc: string;
  icon: string;
  limit: number;
  goal: number;
  members: string[];
  code: string;
  open_at: string;
  created_at: string;
};

/**
 * PocketCard에서 사용하는 타입 (일부 필드만 필요한 경우)
 */
export type PocketCard = {
  pocket_uuid: string;
  name: string;
  icon: string;
  open_at: string;
  members_count: number;
  my_deokdam_count: number;
  goal: number;
};

