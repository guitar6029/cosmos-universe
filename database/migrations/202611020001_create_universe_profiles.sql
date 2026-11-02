-- Cosmos Universe universal profile preferences; Clerk remains the identity provider.
-- Apply to the cosmoport_core database in Neon dev, then production after validation.
BEGIN;

CREATE TABLE public.profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT NOT NULL UNIQUE,
  avatar_id TEXT NOT NULL DEFAULT 'astronaut'
    CONSTRAINT profiles_avatar_id_check CHECK (
      avatar_id IN ('astronaut', 'cat', 'alien', 'robot')
    ),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

COMMIT;
