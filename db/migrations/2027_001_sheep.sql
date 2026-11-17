-- 2027 시즌 "나는 어떤 양?" 테이블
-- 기존 테이블은 건드리지 않는다. 여러 번 실행해도 안전하다(IF NOT EXISTS).
-- user_uuid는 기존 "user" 테이블 값을 문자열로 담고, 외래 키는 걸지 않는다.

-- 테스트 결과. 로그인 없이 만들어지고, 로그인하면 user_uuid가 채워진다.
CREATE TABLE IF NOT EXISTS sheep_result (
  result_id   uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  season      smallint    NOT NULL,
  anon_id     uuid        NOT NULL,
  user_uuid   text,
  type_id     text        NOT NULL,
  answers     smallint[]  NOT NULL,
  created_at  timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS sheep_result_anon_idx ON sheep_result (anon_id, created_at DESC);
CREATE INDEX IF NOT EXISTS sheep_result_user_idx ON sheep_result (user_uuid) WHERE user_uuid IS NOT NULL;

-- 궁합. 초대한 사람의 결과로 만들고, 친구가 테스트를 마치면 invitee가 채워진다.
-- 링크 하나로 여러 친구가 볼 수 있도록 초대 1건당 행 1개가 아니라 친구 1명당 행 1개다.
CREATE TABLE IF NOT EXISTS sheep_pair (
  pair_id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  season             smallint    NOT NULL,
  inviter_result_id  uuid        NOT NULL REFERENCES sheep_result (result_id) ON DELETE CASCADE,
  invitee_result_id  uuid        NOT NULL REFERENCES sheep_result (result_id) ON DELETE CASCADE,
  created_at         timestamptz NOT NULL DEFAULT now(),
  UNIQUE (inviter_result_id, invitee_result_id)
);
CREATE INDEX IF NOT EXISTS sheep_pair_invitee_idx ON sheep_pair (invitee_result_id);

-- 단톡방(또는 가족) 양 무리
CREATE TABLE IF NOT EXISTS sheep_flock (
  flock_id    uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  season      smallint    NOT NULL,
  kind        text        NOT NULL DEFAULT 'chat' CHECK (kind IN ('chat', 'family')),
  name        text        NOT NULL,
  created_by  uuid        NOT NULL, -- 만든 사람의 anon_id
  created_at  timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS sheep_flock_member (
  flock_id    uuid        NOT NULL REFERENCES sheep_flock (flock_id) ON DELETE CASCADE,
  anon_id     uuid        NOT NULL,
  result_id   uuid        NOT NULL REFERENCES sheep_result (result_id) ON DELETE CASCADE,
  nickname    text        NOT NULL,
  joined_at   timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (flock_id, anon_id)
);

-- 오늘의 복주머니. 하루(한국 날짜)에 한 장.
CREATE TABLE IF NOT EXISTS sheep_daily_draw (
  anon_id     uuid        NOT NULL,
  draw_date   date        NOT NULL,
  season      smallint    NOT NULL,
  user_uuid   text,
  card_id     text        NOT NULL,
  created_at  timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (anon_id, draw_date)
);
CREATE INDEX IF NOT EXISTS sheep_daily_draw_user_idx ON sheep_daily_draw (user_uuid) WHERE user_uuid IS NOT NULL;

-- 1년 뒤 적중률 알림 수신 동의 (로그인한 사람만)
CREATE TABLE IF NOT EXISTS sheep_recheck_optin (
  user_uuid   text        NOT NULL,
  season      smallint    NOT NULL,
  created_at  timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (user_uuid, season)
);

-- 지표 이벤트
CREATE TABLE IF NOT EXISTS sheep_event (
  event_id    bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  season      smallint    NOT NULL,
  name        text        NOT NULL,
  anon_id     uuid        NOT NULL,
  user_uuid   text,
  props       jsonb,
  created_at  timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS sheep_event_name_time_idx ON sheep_event (season, name, created_at);
