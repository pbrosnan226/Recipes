-- Recipes schema for the Gambling App Supabase project (wbeaswhbzkqmxcsweisu).
-- Written against requirements/erd.md (approved 2026-11-13). Not applied until the Owner approves (S-38, S-39).
-- Touches only the `recipes` schema and the `recipe-photos` Storage bucket (and its object policy).
-- WANT_TO_TRY and RATING are not created here: they are blocked on sign-in (W-06).

begin;

create schema recipes;

-- COURSE ---------------------------------------------------------------
create table recipes.course (
  id       uuid primary key default gen_random_uuid(),
  name     text not null unique,
  position integer not null
);

-- RECIPE ---------------------------------------------------------------
create table recipes.recipe (
  id                    uuid primary key default gen_random_uuid(),
  course_id             uuid references recipes.course (id) on delete set null,
  name                  text not null unique,
  slug                  text not null unique,
  source_url            text not null,
  archived_url          text,
  site                  text,
  author                text,
  description           text,
  photo_path            text,
  created               date not null,
  base_amount           numeric not null,
  amount_noun           text not null,
  amount_noun_singular  text,
  servings_label        text,
  prep_time             text,
  cook_time             text,
  total_time            text,
  total_minutes         integer,
  nutrition_basis       text
);
create index recipe_course_id_idx on recipes.recipe (course_id);

-- RECIPE_ALIAS ---------------------------------------------------------
create table recipes.recipe_alias (
  id        uuid primary key default gen_random_uuid(),
  recipe_id uuid not null references recipes.recipe (id) on delete cascade,
  alias     text not null
);
create index recipe_alias_recipe_id_idx on recipes.recipe_alias (recipe_id);

-- TAG ------------------------------------------------------------------
create table recipes.tag (
  id   uuid primary key default gen_random_uuid(),
  name text not null unique
);

-- RECIPE_TAG (one row per recipe and tag) ------------------------------
create table recipes.recipe_tag (
  recipe_id uuid not null references recipes.recipe (id) on delete cascade,
  tag_id    uuid not null references recipes.tag (id) on delete cascade,
  position  integer not null,
  primary key (recipe_id, tag_id)
);
create index recipe_tag_tag_id_idx on recipes.recipe_tag (tag_id);

-- SERVING_OPTION -------------------------------------------------------
create table recipes.serving_option (
  id        uuid primary key default gen_random_uuid(),
  recipe_id uuid not null references recipes.recipe (id) on delete cascade,
  position  integer not null,
  amount    numeric not null,
  label     text
);
create index serving_option_recipe_id_idx on recipes.serving_option (recipe_id);

-- RECIPE_INGREDIENT ----------------------------------------------------
create table recipes.recipe_ingredient (
  id               uuid primary key default gen_random_uuid(),
  recipe_id        uuid not null references recipes.recipe (id) on delete cascade,
  position         integer not null,
  ingredient_key   text not null,
  name             text not null,
  text_as_written  text not null,
  group_name       text,
  quantity         numeric,
  quantity_high    numeric,
  unit_singular    text,
  unit_plural      text,
  fixed_text       text,
  lead_text        text,
  grams_before     numeric,
  hidden           boolean not null default false,
  unique (recipe_id, ingredient_key)
);

-- STEP -----------------------------------------------------------------
create table recipes.step (
  id        uuid primary key default gen_random_uuid(),
  recipe_id uuid not null references recipes.recipe (id) on delete cascade,
  position  integer not null,
  text      text not null
);
create index step_recipe_id_idx on recipes.step (recipe_id);

-- RECIPE_NOTE ----------------------------------------------------------
create table recipes.recipe_note (
  id        uuid primary key default gen_random_uuid(),
  recipe_id uuid not null references recipes.recipe (id) on delete cascade,
  position  integer not null,
  level     integer not null check (level in (0, 1)),
  text      text not null
);
create index recipe_note_recipe_id_idx on recipes.recipe_note (recipe_id);

-- NUTRIENT -------------------------------------------------------------
create table recipes.nutrient (
  id        uuid primary key default gen_random_uuid(),
  recipe_id uuid not null references recipes.recipe (id) on delete cascade,
  position  integer not null,
  name      text not null,
  amount    text not null
);
create index nutrient_recipe_id_idx on recipes.nutrient (recipe_id);

-- The six courses, in chip order ----------------------------------------
insert into recipes.course (name, position) values
  ('Breakfast', 1),
  ('Main',      2),
  ('Side',      3),
  ('Soup',      4),
  ('Dessert',   5),
  ('Sauce',     6);

-- Read-only access for the public key (anon) ----------------------------
-- Row level security is on for every table; the only policy is "select".
-- No insert/update/delete grant or policy exists, so only the service key
-- (which bypasses row level security) can write.
alter table recipes.course            enable row level security;
alter table recipes.recipe            enable row level security;
alter table recipes.recipe_alias      enable row level security;
alter table recipes.tag               enable row level security;
alter table recipes.recipe_tag        enable row level security;
alter table recipes.serving_option    enable row level security;
alter table recipes.recipe_ingredient enable row level security;
alter table recipes.step              enable row level security;
alter table recipes.recipe_note       enable row level security;
alter table recipes.nutrient          enable row level security;

create policy "public read" on recipes.course            for select to anon, authenticated using (true);
create policy "public read" on recipes.recipe            for select to anon, authenticated using (true);
create policy "public read" on recipes.recipe_alias      for select to anon, authenticated using (true);
create policy "public read" on recipes.tag               for select to anon, authenticated using (true);
create policy "public read" on recipes.recipe_tag        for select to anon, authenticated using (true);
create policy "public read" on recipes.serving_option    for select to anon, authenticated using (true);
create policy "public read" on recipes.recipe_ingredient for select to anon, authenticated using (true);
create policy "public read" on recipes.step              for select to anon, authenticated using (true);
create policy "public read" on recipes.recipe_note       for select to anon, authenticated using (true);
create policy "public read" on recipes.nutrient          for select to anon, authenticated using (true);

grant usage on schema recipes to anon, authenticated, service_role;
grant select on all tables in schema recipes to anon, authenticated;
grant all    on all tables in schema recipes to service_role;

-- Photo bucket: public read, no public write -----------------------------
insert into storage.buckets (id, name, public)
values ('recipe-photos', 'recipe-photos', true);

create policy "recipe photos public read" on storage.objects
  for select to anon, authenticated
  using (bucket_id = 'recipe-photos');

commit;
