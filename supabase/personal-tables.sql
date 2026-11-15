-- Favorites, Want to try and ratings (stories S-25 to S-28, S-65 to S-76; ERD of 2026-11-14).
-- APPLIED by the Owner on 2026-11-14 (migration recipes_personal_tables).
-- Accounts are Supabase's own (auth.users); nothing there is changed.

-- ---------------------------------------------------------------- tables
create table recipes.favorite (
  user_id   uuid not null references auth.users(id)    on delete cascade,
  recipe_id uuid not null references recipes.recipe(id) on delete cascade,
  added_at  timestamptz not null default now(),
  primary key (user_id, recipe_id)
);

create table recipes.want_to_try (
  user_id   uuid not null references auth.users(id)    on delete cascade,
  recipe_id uuid not null references recipes.recipe(id) on delete cascade,
  added_at  timestamptz not null default now(),
  primary key (user_id, recipe_id)
);

create table recipes.rating (
  user_id   uuid not null references auth.users(id)    on delete cascade,
  recipe_id uuid not null references recipes.recipe(id) on delete cascade,
  stars     numeric(2,1) not null check (stars >= 0.5 and stars <= 5 and (stars * 2) = floor(stars * 2)),
  rated_at  timestamptz not null default now(),
  primary key (user_id, recipe_id)
);

-- ---------------------------------------------------------------- rule: rating a recipe clears its Want to try mark
-- (removing a rating does not bring the mark back)
create function recipes.clear_want_to_try() returns trigger
language plpgsql security definer set search_path = '' as $$
begin
  delete from recipes.want_to_try where user_id = new.user_id and recipe_id = new.recipe_id;
  return new;
end $$;

create trigger rating_clears_want_to_try
  after insert or update on recipes.rating
  for each row execute function recipes.clear_want_to_try();

-- ---------------------------------------------------------------- rule: no Want to try mark on a recipe the person has rated
create function recipes.block_want_to_try_if_rated() returns trigger
language plpgsql security definer set search_path = '' as $$
begin
  if exists (select 1 from recipes.rating where user_id = new.user_id and recipe_id = new.recipe_id) then
    raise exception 'recipe already rated' using errcode = '23505';
  end if;
  return new;
end $$;

create trigger want_to_try_not_if_rated
  before insert or update on recipes.want_to_try
  for each row execute function recipes.block_want_to_try_if_rated();

-- ---------------------------------------------------------------- everyone may read each recipe's average and count (not who rated)
create view recipes.recipe_rating_summary with (security_invoker = off) as
  select recipe_id,
         round(avg(stars)::numeric, 1) as average,
         count(*)::int                 as rating_count
  from recipes.rating
  group by recipe_id;

-- ---------------------------------------------------------------- row level security: a person sees and changes only their own rows
alter table recipes.favorite    enable row level security;
alter table recipes.want_to_try enable row level security;
alter table recipes.rating      enable row level security;

create policy "own rows" on recipes.favorite    for all to authenticated
  using (user_id = (select auth.uid())) with check (user_id = (select auth.uid()));
create policy "own rows" on recipes.want_to_try for all to authenticated
  using (user_id = (select auth.uid())) with check (user_id = (select auth.uid()));
create policy "own rows" on recipes.rating      for all to authenticated
  using (user_id = (select auth.uid())) with check (user_id = (select auth.uid()));

-- ---------------------------------------------------------------- grants (signed-out visitors get nothing on the three tables)
grant select, insert, update, delete on recipes.favorite, recipes.want_to_try, recipes.rating to authenticated;
grant all on recipes.favorite, recipes.want_to_try, recipes.rating to service_role;
grant select on recipes.recipe_rating_summary to anon, authenticated;
grant all    on recipes.recipe_rating_summary to service_role;
