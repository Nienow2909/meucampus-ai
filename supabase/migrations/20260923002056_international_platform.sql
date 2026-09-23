-- Fresh international platform. This supersedes the unapplied db/ prototype.
create schema if not exists private;
revoke all on schema private from public;
grant usage on schema private to authenticated;

create table public.student_profiles (
 user_id uuid primary key references auth.users(id) on delete cascade,
 full_name text not null default '' check (length(full_name)<=120),
 school_year text not null default '', graduation_year integer check(graduation_year between 2020 and 2100),
 grade_average numeric, grade_scale numeric check(grade_scale>0 and grade_scale<=100),
 interest text not null default '', target_countries text[] not null default '{}',
 budget_annual numeric check(budget_annual>=0), budget_currency text not null default 'BRL' check(budget_currency in ('BRL','USD','EUR','GBP','CAD')),
 needs_aid boolean not null default false, sat_actual integer check(sat_actual between 400 and 1600 and sat_actual%10=0),
 sat_target integer check(sat_target between 400 and 1600 and sat_target%10=0),
 english_level text not null default '', hours_week integer check(hours_week between 1 and 80),
 extracurriculars text not null default '' check(length(extracurriculars)<=12000), ai_consent boolean not null default false,
 created_at timestamptz not null default now(), updated_at timestamptz not null default now(),
 check (grade_average is null or (grade_scale is not null and grade_average between 0 and grade_scale))
);
create table public.universities (
 id uuid primary key default gen_random_uuid(), name text not null, country text not null, city text,
 website_url text check(website_url is null or website_url ~ '^https://'),
 courses text[] not null default '{}', summary text, cycle text not null,
 requirements jsonb not null default '{}', costs jsonb not null default '{}', scholarships jsonb not null default '[]',
 published boolean not null default false, created_at timestamptz not null default now()
);
create table public.university_sources (
 id uuid primary key default gen_random_uuid(), university_id uuid not null references public.universities(id) on delete cascade,
 title text not null, url text check(url is null or url ~ '^https://'), document_name text, page integer check(page>0),
 excerpt text not null, cycle text not null, verified_at timestamptz,
 status text not null default 'needs_review' check(status in ('needs_review','verified','expired','conflict')),
 check(url is not null or document_name is not null)
);
create index sources_university_idx on public.university_sources(university_id);
create table public.student_universities (
 user_id uuid not null references auth.users(id) on delete cascade,
 university_id uuid not null references public.universities(id) on delete cascade,
 category text not null check(category in ('dream','target','likely')), slot integer not null,
 created_at timestamptz not null default now(),
 primary key(user_id,category,slot), unique(user_id,university_id),
 check(slot>=1 and slot<=case category when 'dream' then 3 when 'target' then 4 else 5 end)
);
create index shortlist_university_idx on public.student_universities(university_id);
create table public.tasks (
 id uuid primary key default gen_random_uuid(), user_id uuid not null references auth.users(id) on delete cascade,
 university_id uuid references public.universities(id) on delete set null,
 title text not null check(length(title) between 1 and 250), due_on date, done boolean not null default false,
 created_at timestamptz not null default now()
);
create index tasks_owner_date_idx on public.tasks(user_id,due_on);
create index tasks_university_idx on public.tasks(university_id);
create table public.essays (
 id uuid primary key default gen_random_uuid(), user_id uuid not null references auth.users(id) on delete cascade,
 university_id uuid references public.universities(id) on delete set null,
 title text not null check(length(title) between 1 and 200), prompt text not null default '',
 content text not null default '' check(length(content)<=60000),
 word_limit integer not null default 650 check(word_limit between 1 and 10000),
 version integer not null default 1, updated_at timestamptz not null default now()
);
create index essays_owner_idx on public.essays(user_id,updated_at desc);
create index essays_university_idx on public.essays(university_id);
create table public.sat_attempts (
 id uuid primary key default gen_random_uuid(), user_id uuid not null references auth.users(id) on delete cascade,
 question_id text not null, chosen integer not null check(chosen between 0 and 3), correct boolean not null,
 skill text not null, created_at timestamptz not null default now()
);
create index sat_owner_idx on public.sat_attempts(user_id,created_at desc);
create table public.ai_messages (
 id uuid primary key default gen_random_uuid(), user_id uuid not null references auth.users(id) on delete cascade,
 agent text not null check(agent in ('universities','essays','sat','application')),
 question text not null, answer text not null, citations jsonb not null default '[]',
 created_at timestamptz not null default now()
);
create index ai_owner_agent_idx on public.ai_messages(user_id,agent,created_at desc);
create table private.ai_usage (
 user_id uuid not null references auth.users(id) on delete cascade, day date not null,
 requests integer not null, primary key(user_id,day)
);
alter table private.ai_usage enable row level security;

-- All exposed tables start with explicit, minimal privileges.
do $$ declare t text; begin
 foreach t in array array['student_profiles','student_universities','tasks','essays','sat_attempts'] loop
  execute format('alter table public.%I enable row level security',t);
  execute format('revoke all on public.%I from anon, authenticated',t);
  execute format('grant select,insert,update,delete on public.%I to authenticated',t);
  execute format('create policy owner_access on public.%I for all to authenticated using ((select auth.uid())=user_id) with check ((select auth.uid())=user_id)',t);
 end loop;
end $$;
alter table public.universities enable row level security;
alter table public.university_sources enable row level security;
alter table public.ai_messages enable row level security;
revoke all on public.universities,public.university_sources,public.ai_messages from anon,authenticated;
grant select on public.universities,public.university_sources to anon,authenticated;
grant select on public.ai_messages to authenticated;
grant all on all tables in schema public to service_role;
create policy published_universities on public.universities for select to anon,authenticated using(published);
create policy verified_sources on public.university_sources for select to anon,authenticated
 using(status='verified' and exists(select 1 from public.universities u where u.id=university_id and u.published));
create policy own_ai_history on public.ai_messages for select to authenticated using((select auth.uid())=user_id);

-- Quota writes happen only inside a narrowly scoped private function.
create function private.consume_ai_credit() returns boolean language plpgsql security definer set search_path='' as $$
declare n integer; actor uuid := auth.uid();
begin
 if actor is null then return false; end if;
 insert into private.ai_usage(user_id,day,requests) values(actor,(now() at time zone 'UTC')::date,1)
 on conflict(user_id,day) do update set requests=private.ai_usage.requests+1 where private.ai_usage.requests<40
 returning requests into n;
 return n is not null;
end $$;
revoke all on function private.consume_ai_credit() from public,anon;
grant execute on function private.consume_ai_credit() to authenticated;
create function public.consume_ai_credit() returns boolean language sql security invoker set search_path=''
 as $$ select private.consume_ai_credit(); $$;
revoke all on function public.consume_ai_credit() from public,anon;
grant execute on function public.consume_ai_credit() to authenticated;

insert into storage.buckets(id,name,public,file_size_limit,allowed_mime_types)
 values('student-documents','student-documents',false,10485760,array['application/pdf','image/png','image/jpeg']);
create policy own_document_read on storage.objects for select to authenticated
 using(bucket_id='student-documents' and (storage.foldername(name))[1]=(select auth.uid())::text);
create policy own_document_upload on storage.objects for insert to authenticated
 with check(bucket_id='student-documents' and (storage.foldername(name))[1]=(select auth.uid())::text);
create policy own_document_delete on storage.objects for delete to authenticated
 using(bucket_id='student-documents' and (storage.foldername(name))[1]=(select auth.uid())::text);
