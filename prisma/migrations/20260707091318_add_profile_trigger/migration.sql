create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
insert into public.profiles (id, first_name, last_name, avatar_url, role, version, created_at, updated_at)
values (
           new.id,
           new.raw_user_meta_data ->> 'given_name',
           new.raw_user_meta_data ->> 'family_name',
           new.raw_user_meta_data ->> 'avatar_url',
           'candidate',
           1,
           now(),
           now()
       )
    on conflict (id) do nothing;
return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
    after insert on auth.users
    for each row execute function public.handle_new_user();