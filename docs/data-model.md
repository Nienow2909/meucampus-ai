# Modelo de dados

O MVP usa objetos locais demonstrativos. A implementação de produção deve usar banco relacional, IDs opacos e políticas de acesso por linha.

## Entidades principais

`users(id, email, role, locale, country, email_verified_at, created_at, deleted_at)`

`student_profiles(user_id, name, birth_year, school_id, stage, residence, target_scope, interests, modality, language, budget, aid_need, agent_consent, updated_at)`

`guardian_links(id, student_id, guardian_id, consent_scope, status, created_at, revoked_at)`

`advisor_links(id, student_id, advisor_id, scope, status, created_at, revoked_at)`

`universities(id, name, country, state, city, type, website, verified_at)`

`campuses(id, university_id, name, city, climate, size, housing_info)`

`courses(id, university_id, name, level, language, modality, department, official_url)`

`admission_requirements(id, course_id, applicant_type, requirement_type, value, cycle_label, source_id, status)`

`test_policies(id, institution_id, test_type, policy, minimum, cycle_label, source_id)`

`score_concordances(id, test_type, from_scale, to_scale, method, source_id, approximation_note)`

`application_prompts(id, university_id, course_id, prompt, word_limit, cycle_label, source_id)`

`essay_drafts(id, student_id, prompt_id, title, content, version, status, word_count, created_at)`

`activities(id, student_id, category, name, description, role, organization, start_date, end_date, hours_week, weeks_year, level, impact, evidence_url, authenticity_status)`

`honors(id, student_id, name, level, year, evidence_url)`; `sports_profiles(id, student_id, sport, position, club, ranking, video_url, statistics, consent_status)`

`recommendation_requests(id, student_id, recommender_name, subject, requested_at, due_at, status, share_consent)`

`scholarships(id, institution_id, name, eligibility, value, deadline, cycle_label, source_id, status)`

`deadlines(id, owner_type, owner_id, kind, title, due_at, cycle_label, source_id, status)`; `tasks(id, student_id, title, due_at, status, source_id, created_by, undone_at)`

`costs(id, institution_id, course_id, category, amount, currency, period, cycle_label, source_id)`

`sources(id, source_url, publisher, source_type, institution_id, course_id, country, cycle_label, published_at, checked_at, next_review_at, quoted_support, confidence, status, reviewer)`

`source_snapshots(id, source_id, retrieved_at, content_hash, evidence_excerpt, http_status, diff_summary)`

`conversations(id, student_id, title, created_at, updated_at)`; `messages(id, conversation_id, role, content, sources, created_at)`; `agent_tool_calls(id, conversation_id, tool_name, input, output, status, confirmation_id, created_at)`

`audit_logs(id, actor_id, subject_id, action, metadata, ip_hash, created_at)`; `subscriptions(id, user_id, plan, provider_customer_id, status, renews_at)`; `consents(id, user_id, kind, version, granted_at, revoked_at)`

## Invariantes

- Todo requisito importante aponta para `source_id` ou aparece explicitamente como `não confirmado`.
- Todo acesso de estudante usa `student_id` derivado da sessão no servidor.
- Conteúdo de essay não entra em analytics.
- Uma ação mutável tem recibo, confirmação quando necessário e operação de desfazer.
- Estatísticas possuem ciclo e data; conversões guardam escala original e método.
