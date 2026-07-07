create or replace function public.custom_access_token_hook(event jsonb)
returns jsonb
language plpgsql
stable
as $$
declare
claims jsonb;
  user_role public."Role";
begin
select role into user_role from public.profiles where id::uuid = (event->>'user_id')::uuid;
claims := coalesce(event->'claims', '{}'::jsonb);
  claims := jsonb_set(claims, '{user_role}', to_jsonb(coalesce(user_role::text, 'candidate')));
  event := jsonb_set(event, '{claims}', claims);
return event;
end;
$$;

grant execute on function public.custom_access_token_hook to supabase_auth_admin;
revoke execute on function public.custom_access_token_hook from authenticated, anon, public;
grant select on public.profiles to supabase_auth_admin;