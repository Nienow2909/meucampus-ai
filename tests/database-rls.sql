-- Run using a SQL client that stops on errors. Everything is rolled back.
begin;
create temporary table qa_ids as select gen_random_uuid() a,gen_random_uuid() b,gen_random_uuid() u;
grant select on qa_ids to authenticated;
insert into auth.users(id) select a from qa_ids union all select b from qa_ids;
insert into public.student_profiles(user_id,full_name) select a,'Aluno A' from qa_ids union all select b,'Aluno B' from qa_ids;
insert into public.universities(id,name,country,cycle,published) select u,'Fixture','Teste','QA',true from qa_ids;
insert into public.tasks(user_id,title) select a,'A' from qa_ids union all select b,'B' from qa_ids;
set local role authenticated;
select set_config('request.jwt.claim.sub',(select a::text from qa_ids),true);
do $$
declare n integer;uid_a uuid;uid_b uuid;uni uuid;
begin
 select a,b,u into uid_a,uid_b,uni from qa_ids;
 if (select count(*) from public.student_profiles)<>1 then raise exception 'Profile isolation';end if;
 if (select count(*) from public.tasks)<>1 then raise exception 'Task isolation';end if;
 begin insert into public.tasks(user_id,title) values(uid_b,'Unauthorized');raise exception 'Cross-user write allowed';
 exception when insufficient_privilege then null;end;
 begin update public.student_profiles set user_id=uid_b where user_id=uid_a;raise exception 'Owner transfer allowed';
 exception when insufficient_privilege then null;end;
 insert into public.student_universities(user_id,university_id,category,slot) values(uid_a,uni,'dream',1);
 begin update public.student_universities set slot=4 where user_id=uid_a;raise exception 'Category cap bypassed';
 exception when check_violation then null;end;
 for n in 1..40 loop if not public.consume_ai_credit() then raise exception 'Quota rejected early';end if;end loop;
 if public.consume_ai_credit() then raise exception 'Quota bypassed';end if;
 begin insert into public.ai_messages(user_id,agent,question,answer) values(uid_a,'sat','fake','fake');raise exception 'Client forged history';
 exception when insufficient_privilege then null;end;
end $$;
rollback;
select 'PASS: isolation, ownership, category cap, quota and protected AI history' result;
