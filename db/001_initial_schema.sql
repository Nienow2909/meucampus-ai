-- MeuCampus AI — modelo inicial PostgreSQL
-- Dados acadêmicos continuam separados de dados privados do estudante.

create extension if not exists pgcrypto;

create type public.app_role as enum ('student', 'guardian', 'advisor', 'admin');
create type public.application_category as enum ('dream', 'target', 'likely');
create type public.essay_status as enum ('draft', 'reviewing', 'ready', 'submitted', 'archived');
create type public.task_status as enum ('todo', 'in_progress', 'done', 'cancelled');
create type public.source_status as enum ('verified', 'needs_review', 'expired', 'conflict', 'unconfirmed');

create table public.users (
  id uuid primary key references auth.users(id) on delete cascade,
  role public.app_role not null default 'student',
  display_name text,
  locale text not null default 'pt-BR',
  country text not null default 'BR',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.student_profiles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null unique references public.users(id) on delete cascade,
  full_name text,
  birth_year smallint,
  stage text,
  school_name text,
  residence_country text,
  residence_state text,
  target_scope text[] not null default '{}',
  interests text[] not null default '{}',
  preferred_modalities text[] not null default '{}',
  preferred_languages text[] not null default '{}',
  grading_scale numeric(5,2),
  budget_monthly numeric(12,2),
  needs_financial_aid boolean not null default false,
  agent_context_consent boolean not null default false,
  onboarding_step smallint not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.universities (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  country text not null,
  state text,
  city text,
  institution_type text,
  website_url text,
  admissions_url text,
  logo_url text,
  is_public boolean,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.courses (
  id uuid primary key default gen_random_uuid(),
  university_id uuid not null references public.universities(id) on delete cascade,
  name text not null,
  level text not null,
  language text,
  modality text,
  official_url text,
  created_at timestamptz not null default now(),
  unique (university_id, name, level)
);

create table public.sources (
  id uuid primary key default gen_random_uuid(),
  source_url text not null,
  publisher text not null,
  source_type text not null,
  university_id uuid references public.universities(id) on delete set null,
  course_id uuid references public.courses(id) on delete set null,
  country text,
  cycle_label text,
  published_at date,
  checked_at timestamptz,
  next_review_at timestamptz,
  quoted_support text,
  confidence numeric(4,3) check (confidence is null or confidence between 0 and 1),
  status public.source_status not null default 'needs_review',
  reviewer_id uuid references public.users(id) on delete set null,
  created_at timestamptz not null default now()
);

create table public.scholarships (
  id uuid primary key default gen_random_uuid(),
  university_id uuid references public.universities(id) on delete set null,
  name text not null,
  description text,
  eligibility jsonb not null default '{}',
  value_amount numeric(12,2),
  currency text not null default 'BRL',
  deadline date,
  cycle_label text,
  source_id uuid references public.sources(id) on delete restrict,
  status text not null default 'active'
);

create table public.deadlines (
  id uuid primary key default gen_random_uuid(),
  student_id uuid references public.student_profiles(id) on delete cascade,
  university_id uuid references public.universities(id) on delete set null,
  course_id uuid references public.courses(id) on delete set null,
  title text not null,
  kind text not null,
  due_at timestamptz not null,
  cycle_label text,
  source_id uuid references public.sources(id) on delete restrict,
  status text not null default 'active',
  created_at timestamptz not null default now()
);

create table public.essays (
  id uuid primary key default gen_random_uuid(),
  student_id uuid not null references public.student_profiles(id) on delete cascade,
  university_id uuid references public.universities(id) on delete set null,
  course_id uuid references public.courses(id) on delete set null,
  title text not null,
  prompt text,
  prompt_source_id uuid references public.sources(id) on delete set null,
  content text not null default '',
  word_limit integer,
  character_limit integer,
  status public.essay_status not null default 'draft',
  version integer not null default 1,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.activities (
  id uuid primary key default gen_random_uuid(),
  student_id uuid not null references public.student_profiles(id) on delete cascade,
  name text not null,
  category text not null,
  description text,
  role text,
  organization text,
  started_on date,
  ended_on date,
  hours_per_week numeric(6,2),
  weeks_per_year smallint,
  level text,
  measurable_impact text,
  evidence_url text,
  authenticity_status text not null default 'needs_review',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.sports_profiles (
  id uuid primary key default gen_random_uuid(),
  student_id uuid not null unique references public.student_profiles(id) on delete cascade,
  sport text not null,
  position text,
  category text,
  club text,
  ranking text,
  statistics jsonb not null default '{}',
  video_urls text[] not null default '{}',
  coach_contacts jsonb not null default '[]',
  recruitment_consent boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.recommendation_letters (
  id uuid primary key default gen_random_uuid(),
  student_id uuid not null references public.student_profiles(id) on delete cascade,
  recommender_name text not null,
  recommender_email text,
  subject text,
  relationship text,
  requested_at date,
  due_at date,
  status text not null default 'not_requested',
  share_consent boolean not null default false,
  brag_sheet_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.conversations (
  id uuid primary key default gen_random_uuid(),
  student_id uuid not null references public.student_profiles(id) on delete cascade,
  title text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.messages (
  id uuid primary key default gen_random_uuid(),
  conversation_id uuid not null references public.conversations(id) on delete cascade,
  role text not null check (role in ('user', 'assistant', 'tool', 'system')),
  content text not null,
  citations jsonb not null default '[]',
  created_at timestamptz not null default now()
);

create table public.tasks (
  id uuid primary key default gen_random_uuid(),
  student_id uuid not null references public.student_profiles(id) on delete cascade,
  title text not null,
  description text,
  due_at timestamptz,
  status public.task_status not null default 'todo',
  source_id uuid references public.sources(id) on delete set null,
  created_by uuid references public.users(id) on delete set null,
  previous_state jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.student_universities (
  id uuid primary key default gen_random_uuid(),
  student_id uuid not null references public.student_profiles(id) on delete cascade,
  university_id uuid not null references public.universities(id) on delete cascade,
  course_id uuid references public.courses(id) on delete set null,
  category public.application_category not null,
  notes text,
  created_at timestamptz not null default now(),
  unique (student_id, university_id, course_id)
);

create table public.agent_tool_calls (
  id uuid primary key default gen_random_uuid(),
  conversation_id uuid not null references public.conversations(id) on delete cascade,
  tool_name text not null,
  input jsonb not null default '{}',
  output jsonb,
  status text not null,
  confirmation_id uuid,
  created_at timestamptz not null default now()
);

create table public.audit_logs (
  id uuid primary key default gen_random_uuid(),
  actor_id uuid references public.users(id) on delete set null,
  student_id uuid references public.student_profiles(id) on delete set null,
  action text not null,
  metadata jsonb not null default '{}',
  created_at timestamptz not null default now()
);

create index sources_review_idx on public.sources(next_review_at, status);
create index deadlines_student_idx on public.deadlines(student_id, due_at);
create index tasks_student_idx on public.tasks(student_id, status, due_at);
create index essays_student_idx on public.essays(student_id, updated_at desc);
create index messages_conversation_idx on public.messages(conversation_id, created_at);

-- Buckets privados sugeridos:
-- documents: documentos pessoais e comprovantes; caminho {user_id}/{document_id}.
-- essays: anexos e exportações de redações; caminho {user_id}/{essay_id}.
-- Ambos devem ser privados, com URLs assinadas e expiração curta.
