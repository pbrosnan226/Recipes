-- recipes.save_recipe: saves one recipe and all its parts together, or none of them (S-44.11).
-- If a recipe with the same name or the same slug already exists it is replaced whole (S-44.12); the import script
-- only asks for that when the name is on the list the Owner confirmed (S-43.9).
-- Only the service key can run it. The public key (anon, authenticated) cannot.
-- Touches only the `recipes` schema. Not applied until the Owner approves (S-38.9).

begin;

create or replace function recipes.save_recipe(j jsonb)
returns uuid
language plpgsql
security invoker
set search_path = recipes, pg_temp
as $$
declare
  rid uuid;
begin
  delete from recipe where name = j->>'name' or slug = j->>'slug';

  insert into recipe (
    course_id, name, slug, source_url, archived_url, site, author, description, photo_path,
    created, base_amount, amount_noun, amount_noun_singular, servings_label,
    prep_time, cook_time, total_time, total_minutes, nutrition_basis)
  values (
    (select id from course where name = j->>'course'),
    j->>'name', j->>'slug', j->>'source_url', j->>'archived_url', j->>'site', j->>'author',
    j->>'description', j->>'photo_path', (j->>'created')::date, (j->>'base_amount')::numeric,
    j->>'amount_noun', j->>'amount_noun_singular', j->>'servings_label',
    j->>'prep_time', j->>'cook_time', j->>'total_time', (j->>'total_minutes')::integer,
    j->>'nutrition_basis')
  returning id into rid;

  insert into recipe_alias (recipe_id, alias)
  select rid, a from jsonb_array_elements_text(coalesce(j->'aliases', '[]')) a;

  insert into tag (name)
  select t from jsonb_array_elements_text(coalesce(j->'tags', '[]')) t
  on conflict (name) do nothing;

  insert into recipe_tag (recipe_id, tag_id, position)
  select rid, (select id from tag where name = t.v), t.ord
  from jsonb_array_elements_text(coalesce(j->'tags', '[]')) with ordinality t(v, ord);

  insert into serving_option (recipe_id, position, amount, label)
  select rid, o.ord, (o.v->>'amount')::numeric, o.v->>'label'
  from jsonb_array_elements(coalesce(j->'serving_options', '[]')) with ordinality o(v, ord);

  insert into recipe_ingredient (
    recipe_id, position, ingredient_key, name, text_as_written, group_name, quantity,
    quantity_high, unit_singular, unit_plural, fixed_text, lead_text, grams_before, hidden)
  select rid, i.ord, i.v->>'key', i.v->>'name', i.v->>'text_as_written', i.v->>'group_name',
    (i.v->>'quantity')::numeric, (i.v->>'quantity_high')::numeric, i.v->>'unit_singular',
    i.v->>'unit_plural', i.v->>'fixed_text', i.v->>'lead_text', (i.v->>'grams_before')::numeric,
    coalesce((i.v->>'hidden')::boolean, false)
  from jsonb_array_elements(coalesce(j->'ingredients', '[]')) with ordinality i(v, ord);

  insert into step (recipe_id, position, text)
  select rid, s.ord, s.v
  from jsonb_array_elements_text(coalesce(j->'steps', '[]')) with ordinality s(v, ord);

  insert into recipe_note (recipe_id, position, level, text)
  select rid, n.ord, (n.v->>'level')::integer, n.v->>'text'
  from jsonb_array_elements(coalesce(j->'notes', '[]')) with ordinality n(v, ord);

  insert into nutrient (recipe_id, position, name, amount)
  select rid, u.ord, u.v->>'name', u.v->>'amount'
  from jsonb_array_elements(coalesce(j->'nutrients', '[]')) with ordinality u(v, ord);

  return rid;
end;
$$;

revoke all on function recipes.save_recipe(jsonb) from public, anon, authenticated;
grant execute on function recipes.save_recipe(jsonb) to service_role;

commit;
