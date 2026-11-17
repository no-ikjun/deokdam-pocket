-- 궁합 화면에 보여줄 별명(선택 입력). 비어 있으면 유형 이름으로 대신한다.
ALTER TABLE sheep_pair ADD COLUMN IF NOT EXISTS inviter_nickname text;
ALTER TABLE sheep_pair ADD COLUMN IF NOT EXISTS invitee_nickname text;
