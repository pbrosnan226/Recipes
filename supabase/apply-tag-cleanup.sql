-- recipes.apply_tag_cleanup: S-85. Sets the tags of the listed recipes in one transaction, so the cleanup is
-- all-or-nothing (W-15 step 3). Input j = {"recipes":[{"name":"Apple Pie","tags":["dessert","pie"]}, ...]}:
-- each recipe's complete new tag list in order; position is the place in the list, from 1, with no gaps.
-- Only recipe_tag rows (and tag rows) change: no recipe is deleted and no other recipe field is touched.
-- A recipe name that is not found, or a repeated tag in one list, raises an error and everything rolls back.
-- Tags left with no recipe are deleted, so a renamed or dropped tag does not stay behind (list-tags.js hides them anyway).
-- Only the service key can run it. The public key (anon, authenticated) cannot.
-- Touches only the `recipes` schema. No table changes, so the ERD is unchanged. Not applied until the Owner approves.

begin;

create or replace function recipes.apply_tag_cleanup(j jsonb)
returns integer
language plpgsql
security invoker
set search_path = recipes, pg_temp
as $$
declare
  r jsonb;
  rid uuid;
  n integer := 0;
begin
  for r in select * from jsonb_array_elements(coalesce(j->'recipes', '[]')) loop
    select id into rid from recipe where name = r->>'name';
    if rid is null then
      raise exception 'recipe not found: %', r->>'name';
    end if;

    delete from recipe_tag where recipe_id = rid;

    insert into tag (name)
    select distinct u.v from jsonb_array_elements_text(coalesce(r->'tags', '[]')) as u(v)
    on conflict (name) do nothing;

    insert into recipe_tag (recipe_id, tag_id, position)
    select rid, t.id, u.ord
    from jsonb_array_elements_text(coalesce(r->'tags', '[]')) with ordinality as u(v, ord)
    join tag t on t.name = u.v;

    n := n + 1;
  end loop;

  delete from tag where not exists (select 1 from recipe_tag rt where rt.tag_id = tag.id);

  return n;
end;
$$;

revoke all on function recipes.apply_tag_cleanup(jsonb) from public, anon, authenticated;
grant execute on function recipes.apply_tag_cleanup(jsonb) to service_role;

commit;
