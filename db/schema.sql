-- ============================================================================
--  ম্যাথ একাডেমি — Neon Postgres schema (v10.3)
--  Run:  npm run db:migrate      (or: psql "$DATABASE_URL" -f db/schema.sql)
--  Then: npm run db:push         (seeds from _src/content/site.json)
--
--  Every statement is separated by a line that reads exactly:  -- @@ split
--  The HTTP driver sends one statement per request, so the marker is what makes
--  this file runnable from Node without a psql binary.
--  Safe to re-run: if not exists / or replace / on conflict.
-- ============================================================================

-- @@ split
create table if not exists settings (
  key        text primary key,
  value      jsonb not null,
  updated_at timestamptz not null default now()
);

-- @@ split
create table if not exists batches (
  id           text primary key,
  name_bn      text    not null,
  code         text    not null,
  classes_bn   text    not null,
  days_bn      text    not null,
  time_bn      text    not null,
  fee          integer not null check (fee between 1 and 100000),
  filled       integer not null default 0 constraint batches_filled_max_15 check (filled between 0 and 15),
  -- Capacity is global (settings.capacity.per_batch = 15); never batch-specific.
  hot          boolean not null default false,
  wa_text      text    not null,
  sort_order   smallint not null default 0,
  active       boolean not null default true,
  updated_at   timestamptz not null default now()
);

-- @@ split
-- New cap is enforced in Postgres too. Legacy >15 counts are reconciled to full batches before constraint creation.
update batches set filled = 15, updated_at = now() where filled > 15;

-- @@ split
do $$
begin
  if not exists (
    select 1 from pg_constraint
    where conname = 'batches_filled_max_15'
      and conrelid = 'batches'::regclass
  ) then
    alter table batches
      add constraint batches_filled_max_15 check (filled between 0 and 15);
  end if;
end $$;

-- @@ split
create table if not exists bookings (
  id         bigserial primary key,
  batch_id   text references batches(id) on delete set null,
  name       text not null check (length(name) between 1 and 80),
  phone      text not null check (length(phone) between 6 and 24),
  note       text,
  created_at timestamptz not null default now()
);

-- @@ split
create index if not exists batches_active_order on batches (active, sort_order);

-- @@ split
create index if not exists bookings_batch on bookings (batch_id, created_at desc);

-- @@ split
create or replace function touch_updated_at() returns trigger language plpgsql as $$
begin
  new.updated_at := now();
  return new;
end $$;

-- @@ split
drop trigger if exists batches_touch on batches;

-- @@ split
create trigger batches_touch before update on batches
  for each row execute function touch_updated_at();

-- @@ split
drop trigger if exists settings_touch on settings;

-- @@ split
create trigger settings_touch before update on settings
  for each row execute function touch_updated_at();

-- @@ split
create table if not exists meta (
  key   text primary key,
  value text not null
);

-- @@ split
insert into meta (key, value) values ('schema_version', '10.3')
  on conflict (key) do update set value = excluded.value;
