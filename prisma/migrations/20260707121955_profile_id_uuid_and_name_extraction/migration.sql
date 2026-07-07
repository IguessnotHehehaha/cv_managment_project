create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
declare
meta jsonb := new.raw_user_meta_data;
  full_name text;
  first_part text;
  last_part text;
begin
  full_name := coalesce(meta ->> 'full_name', meta ->> 'name', meta ->> 'user_name', '');

  first_part := coalesce(
    meta ->> 'given_name',
    nullif(split_part(full_name, ' ', 1), '')
  );
  last_part := coalesce(
    meta ->> 'family_name',
    nullif(substring(full_name from position(' ' in full_name) + 1), '')
  );

insert into public.profiles (id, first_name, last_name, avatar_url, role, version, created_at, updated_at)
values (
           new.id,
           coalesce(first_part, ''),
           coalesce(last_part, ''),
           meta ->> 'avatar_url',
           'candidate',
           1,
           now(),
           now()
       )
    on conflict (id) do nothing;
return new;
end;
$$;
-- AlterTable
ALTER TABLE "profiles" DROP CONSTRAINT "profiles_pkey",
DROP COLUMN "id",
ADD COLUMN     "id" UUID NOT NULL,
ADD CONSTRAINT "profiles_pkey" PRIMARY KEY ("id");
