-- Bibi · schema
-- Run this in your Supabase project's SQL editor.

create extension if not exists "uuid-ossp";

drop table if exists item_feedback cascade;
drop table if exists submissions cascade;
drop table if exists menu_items cascade;
drop table if exists restaurants cascade;

create table restaurants (
  id            uuid primary key default uuid_generate_v4(),
  slug          text unique not null,
  name          text not null,
  tagline       text,
  city          text,
  discount_pct  integer not null default 10,
  created_at    timestamptz not null default now()
);

create table menu_items (
  id            uuid primary key default uuid_generate_v4(),
  restaurant_id uuid not null references restaurants(id) on delete cascade,
  name          text not null,
  description   text,
  category      text not null,
  price_cents   integer not null,
  active        boolean not null default true,
  display_order integer not null default 0
);

create table submissions (
  id              uuid primary key default uuid_generate_v4(),
  restaurant_id   uuid not null references restaurants(id) on delete cascade,
  phone           text,
  overall_rating  integer not null check (overall_rating between 1 and 5),
  overall_comment text,
  discount_code   text not null,
  created_at      timestamptz not null default now()
);

create table item_feedback (
  id              uuid primary key default uuid_generate_v4(),
  submission_id   uuid not null references submissions(id) on delete cascade,
  menu_item_id    uuid not null references menu_items(id) on delete cascade,
  rating          integer not null check (rating between 1 and 5),
  comment         text,
  created_at      timestamptz not null default now()
);

create index submissions_restaurant_created_idx
  on submissions(restaurant_id, created_at desc);

create index item_feedback_item_created_idx
  on item_feedback(menu_item_id, created_at desc);

create index item_feedback_submission_idx
  on item_feedback(submission_id);

create index menu_items_restaurant_idx
  on menu_items(restaurant_id, display_order);

-- Bibi runs all DB writes server-side with the service-role key, so RLS is
-- intentionally left off in this hackathon build. Turn it on before
-- exposing this to real users.
