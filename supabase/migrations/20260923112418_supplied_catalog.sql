alter table public.universities
 add column catalog_rank integer unique check(catalog_rank between 1 and 400),
 add column institutional_group text,
 add column collection text,
 add column guidance jsonb not null default '{}',
 add column details jsonb not null default '{}';
alter table public.university_sources
 add column page_end integer check(page_end>=page),
 add column record_number integer check(record_number>0);
alter table public.university_sources drop constraint university_sources_status_check;
alter table public.university_sources add constraint university_sources_status_check
 check(status in ('needs_review','provided','verified','expired','conflict'));
drop policy verified_sources on public.university_sources;
create policy readable_sources on public.university_sources for select to anon,authenticated
 using(status in ('provided','verified') and exists(select 1 from public.universities u where u.id=university_id and u.published));

create table public.knowledge_chunks (
 id uuid primary key,
 university_id uuid references public.universities(id) on delete cascade,
 document_name text not null,
 page integer not null check(page>0),
 content text not null check(length(content) between 1 and 4000),
 source_status text not null check(source_status in ('provided','verified','expired')),
 search_vector tsvector generated always as (to_tsvector('portuguese', content)) stored
);
create index knowledge_search_idx on public.knowledge_chunks using gin(search_vector);
create index knowledge_university_idx on public.knowledge_chunks(university_id);
alter table public.knowledge_chunks enable row level security;
revoke all on public.knowledge_chunks from anon,authenticated;
grant select on public.knowledge_chunks to authenticated;
grant all on public.knowledge_chunks to service_role;
create policy readable_knowledge on public.knowledge_chunks for select to authenticated
 using(source_status in ('provided','verified') and (university_id is null or exists(select 1 from public.universities u where u.id=university_id and u.published)));

create function public.search_knowledge(search_text text, university_ids uuid[] default '{}')
returns table(id uuid,university_id uuid,document_name text,page integer,content text,source_status text)
language sql stable security invoker set search_path='' as $$
 with terms as (
  select string_agg(word,' | ') q from (
   select distinct lexeme word from unnest(tsvector_to_array(to_tsvector('portuguese',left(search_text,2000)))) lexeme limit 24
  ) t
 ), query as (select to_tsquery('portuguese',coalesce(q,'')) q from terms)
 select k.id,k.university_id,k.document_name,k.page,k.content,k.source_status
 from public.knowledge_chunks k cross join query q
 where k.search_vector @@ q.q
 order by (case when k.university_id=any(university_ids) then 0.5 else 0 end)+ts_rank_cd(k.search_vector,q.q) desc,k.id
 limit 8;
$$;
revoke all on function public.search_knowledge(text,uuid[]) from public,anon;
grant execute on function public.search_knowledge(text,uuid[]) to authenticated;
