create or replace function public.immutable_array_to_string(arr text[], sep text)
returns text
language sql
immutable
parallel safe
as $$
select array_to_string(arr, sep);
$$;

alter table public.positions drop column search_vector;
alter table public.positions add column search_vector tsvector
    generated always as (
        to_tsvector('english',
                    coalesce(title, '') || ' ' || coalesce(description, '') || ' ' ||
                    coalesce(company, '') || ' ' || coalesce(public.immutable_array_to_string(project_tags, ' '), '')
        )
        ) stored;
create index positions_search_idx on public.positions using gin (search_vector);