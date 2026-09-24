begin;
set local role anon;
do $$ begin
 if (select count(*) from public.universities)<>400 then raise exception 'Expected 400 published institutions';end if;
 if (select count(*) from public.university_sources)<>1000 then raise exception 'Expected 1000 visible provenance records';end if;
 begin perform * from public.knowledge_chunks limit 1;raise exception 'Anonymous document access';
 exception when insufficient_privilege then null;end;
 begin update public.universities set name='Tampered' where catalog_rank=1;raise exception 'Anonymous catalog write';
 exception when insufficient_privilege then null;end;
end $$;
reset role;
set local role authenticated;
do $$ declare mit uuid; begin
 select id into mit from public.universities where catalog_rank=1;
 if not exists(select 1 from public.search_knowledge('MIT SAT',array[mit])) then raise exception 'Retrieval empty';end if;
 if exists(select 1 from public.search_knowledge('MIT SAT',array[mit]) limit 1) is false then raise exception 'Missing document retrieval';end if;
 begin insert into public.knowledge_chunks(id,document_name,page,content,source_status) values(gen_random_uuid(),'Injected',1,'bad','provided');raise exception 'Student knowledge write';
 exception when insufficient_privilege then null;end;
end $$;
rollback;
select 'PASS: catalog, provenance, authenticated retrieval and write protection' result;
