drop function if exists public.search_cvs(text);

create or replace function public.search_cvs(q text)
returns table(id uuid, first_name text, last_name text, title text, like_count bigint)
language sql stable
as $$
select cv.id, pr.first_name, pr.last_name, pos.title,
       (select count(*) from public.likes l where l.cv_id = cv.id) as like_count
from public.cvs cv
         join public.profiles pr on pr.id = cv.profile_id
         join public.positions pos on pos.id = cv.position_id
where cv.status = 'published'
  and (pr.search_vector @@ websearch_to_tsquery('english', q)
    or pos.search_vector @@ websearch_to_tsquery('english', q))
    limit 10;
$$;