-- NEXUS operational metadata only. No customer, invoice, contract or patient records.
CREATE TABLE IF NOT EXISTS nexus_owner_credentials (
  id smallint PRIMARY KEY CHECK(id=1),
  password_hash text NOT NULL,
  version integer NOT NULL DEFAULT 1 CHECK(version>=1),
  created_at timestamptz NOT NULL DEFAULT now(),
  changed_at timestamptz NOT NULL DEFAULT now()
);
CREATE TABLE IF NOT EXISTS nexus_sessions (
  token_hash char(64) PRIMARY KEY,
  email text NOT NULL,
  owner_version integer NOT NULL CHECK(owner_version>=0),
  expires_at timestamptz NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS nexus_sessions_expiration_idx ON nexus_sessions(expires_at);
CREATE TABLE IF NOT EXISTS nexus_audit (
  id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  happened_at timestamptz NOT NULL DEFAULT now(),
  kind text NOT NULL,
  actor_kind text NOT NULL DEFAULT 'owner',
  result text NOT NULL CHECK(result IN ('success','denied','failed','unknown')),
  app_id text,
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb
);
CREATE INDEX IF NOT EXISTS nexus_audit_time_idx ON nexus_audit(happened_at DESC);
CREATE TABLE IF NOT EXISTS nexus_observations (
  id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  app_id text NOT NULL,
  environment text NOT NULL,
  provider text NOT NULL,
  resource_ref text NOT NULL,
  probe_kind text NOT NULL,
  state text NOT NULL CHECK(state IN ('reachable','unreachable','unknown')),
  observed_at timestamptz NOT NULL DEFAULT now(),
  response_status integer,
  latency_ms integer,
  evidence jsonb NOT NULL DEFAULT '{}'::jsonb,
  CONSTRAINT observed_http_status CHECK(response_status IS NULL OR (response_status BETWEEN 100 AND 599))
);
CREATE INDEX IF NOT EXISTS nexus_observations_scope_time_idx
  ON nexus_observations(app_id,environment,observed_at DESC);
CREATE TABLE IF NOT EXISTS nexus_connections (
  provider text PRIMARY KEY CHECK(provider IN ('github','railway')),
  ciphertext text NOT NULL,
  connection_state text NOT NULL DEFAULT 'pending' CHECK(connection_state IN ('pending','verified','degraded','disabled')),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE TABLE IF NOT EXISTS nexus_job_receipts (
  id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  job_kind text NOT NULL,
  state text NOT NULL CHECK(state IN ('running','succeeded','failed','unknown')),
  started_at timestamptz NOT NULL DEFAULT now(),
  completed_at timestamptz,
  info jsonb NOT NULL DEFAULT '{}'::jsonb
);
