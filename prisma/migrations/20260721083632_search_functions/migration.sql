create or replace function public.search_positions(q text, is_staff boolean)
returns table(id uuid, title text, company text)
language sql stable
as $$
select p.id, p.title, p.company
from public.positions p
where p.search_vector @@ websearch_to_tsquery('english', q)
  and (is_staff or p.visibility = 'public')
order by ts_rank(p.search_vector, websearch_to_tsquery('english', q)) desc
    limit 10;
$$;

create or replace function public.search_candidates(q text)
returns table(id uuid, first_name text, last_name text)
language sql stable
as $$
select pr.id, pr.first_name, pr.last_name
from public.profiles pr
where pr.search_vector @@ websearch_to_tsquery('english', q)
    limit 10;
$$;

create or replace function public.search_cvs(q text)
returns table(id uuid, first_name text, last_name text, title text)
language sql stable
as $$
select cv.id, pr.first_name, pr.last_name, pos.title
from public.cvs cv
         join public.profiles pr on pr.id = cv.profile_id
         join public.positions pos on pos.id = cv.position_id
where cv.status = 'published'
  and (pr.search_vector @@ websearch_to_tsquery('english', q)
    or pos.search_vector @@ websearch_to_tsquery('english', q))
    limit 10;
$$;

create or replace function public.search_posts(q text)
returns table(id uuid, position_id uuid, content text)
language sql stable
as $$
select p.id, p.position_id, p.content
from public.posts p
where p.content ilike ('%' || q || '%')
  limit 10;
$$;