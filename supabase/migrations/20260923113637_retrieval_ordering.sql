create or replace function public.search_knowledge(search_text text, university_ids uuid[] default '{}')
returns table(id uuid,university_id uuid,document_name text,page integer,content text,source_status text)
language sql stable security invoker set search_path='' as $$
 with terms as (
  select string_agg(quote_literal(word),' | ') q from (
   select distinct lexeme word from unnest(tsvector_to_array(to_tsvector('portuguese',left(search_text,2000)))) lexeme limit 24
  ) t
 ), query as (select to_tsquery('portuguese',coalesce(q,'')) q from terms)
 select k.id,k.university_id,k.document_name,k.page,k.content,k.source_status
 from public.knowledge_chunks k cross join query q
 where k.search_vector @@ q.q
 order by coalesce(k.university_id=any(university_ids),false) desc,ts_rank_cd(k.search_vector,q.q) desc,k.id
 limit 8;
$$;
