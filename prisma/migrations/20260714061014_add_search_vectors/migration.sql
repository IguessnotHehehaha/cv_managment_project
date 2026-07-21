alter table public.positions add column search_vector tsvector
    generated always as (to_tsvector('english', coalesce(title, '') || ' ' || coalesce(description, '') || ' ' || coalesce(company, ''))) stored;
create index positions_search_idx on public.positions using gin (search_vector);

alter table public.profiles add column search_vector tsvector
    generated always as (to_tsvector('english', coalesce(first_name, '') || ' ' || coalesce(last_name, ''))) stored;
create index profiles_search_idx on public.profiles using gin (search_vector);