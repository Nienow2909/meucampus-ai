-- RLS base. Em produção, completar políticas de guardian/advisor conforme consentimento.

alter table public.users enable row level security;
alter table public.student_profiles enable row level security;
alter table public.essays enable row level security;
alter table public.activities enable row level security;
alter table public.sports_profiles enable row level security;
alter table public.recommendation_letters enable row level security;
alter table public.deadlines enable row level security;
alter table public.conversations enable row level security;
alter table public.messages enable row level security;
alter table public.tasks enable row level security;
alter table public.student_universities enable row level security;
alter table public.agent_tool_calls enable row level security;

create policy "users own row" on public.users
  for all using (id = auth.uid()) with check (id = auth.uid());

create policy "student owns profile" on public.student_profiles
  for all using (user_id = auth.uid()) with check (user_id = auth.uid());

create policy "student owns essays" on public.essays
  for all using (student_id in (select id from public.student_profiles where user_id = auth.uid()))
  with check (student_id in (select id from public.student_profiles where user_id = auth.uid()));

create policy "student owns activities" on public.activities
  for all using (student_id in (select id from public.student_profiles where user_id = auth.uid()))
  with check (student_id in (select id from public.student_profiles where user_id = auth.uid()));

create policy "student owns sports" on public.sports_profiles
  for all using (student_id in (select id from public.student_profiles where user_id = auth.uid()))
  with check (student_id in (select id from public.student_profiles where user_id = auth.uid()));

create policy "student owns recommendations" on public.recommendation_letters
  for all using (student_id in (select id from public.student_profiles where user_id = auth.uid()))
  with check (student_id in (select id from public.student_profiles where user_id = auth.uid()));

create policy "student owns deadlines" on public.deadlines
  for all using (student_id in (select id from public.student_profiles where user_id = auth.uid()))
  with check (student_id in (select id from public.student_profiles where user_id = auth.uid()));

create policy "student owns conversations" on public.conversations
  for all using (student_id in (select id from public.student_profiles where user_id = auth.uid()))
  with check (student_id in (select id from public.student_profiles where user_id = auth.uid()));

create policy "student owns messages" on public.messages
  for all using (conversation_id in (select id from public.conversations where student_id in (select id from public.student_profiles where user_id = auth.uid())))
  with check (conversation_id in (select id from public.conversations where student_id in (select id from public.student_profiles where user_id = auth.uid())));

create policy "student owns tasks" on public.tasks
  for all using (student_id in (select id from public.student_profiles where user_id = auth.uid()))
  with check (student_id in (select id from public.student_profiles where user_id = auth.uid()));

create policy "student owns saved universities" on public.student_universities
  for all using (student_id in (select id from public.student_profiles where user_id = auth.uid()))
  with check (student_id in (select id from public.student_profiles where user_id = auth.uid()));

create policy "student owns agent calls" on public.agent_tool_calls
  for all using (conversation_id in (select id from public.conversations where student_id in (select id from public.student_profiles where user_id = auth.uid())))
  with check (conversation_id in (select id from public.conversations where student_id in (select id from public.student_profiles where user_id = auth.uid())));

-- Universidades e fontes são públicas para leitura; publicação e revisão devem ser feitas por serviço/admin.
alter table public.universities enable row level security;
alter table public.courses enable row level security;
alter table public.sources enable row level security;
create policy "public university read" on public.universities for select using (true);
create policy "public course read" on public.courses for select using (true);
create policy "public source read" on public.sources for select using (status <> 'conflict');
