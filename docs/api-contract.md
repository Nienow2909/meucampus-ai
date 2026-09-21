# Contrato de API — v1

Todas as rotas privadas exigem sessão validada no servidor. O cliente não escolhe o `studentId` efetivo.

## Perfil e onboarding

- `GET /api/v1/profile` → `StudentProfile`
- `PATCH /api/v1/profile` body `{field, value, expectedVersion}` → `{profile, auditId}`
- `PUT /api/v1/onboarding/steps/:step` body `{answers, completed}` → `{progress, nextStep}`

## Universidades, cursos e fontes

- `GET /api/v1/colleges?q=&country=&course=&category=` → `{items, explainability, sources}`
- `GET /api/v1/colleges/:id` → `{university, campuses, courses, requirements, costs, sources}`
- `POST /api/v1/college-list` body `{universityId, category}` → `{item, actionReceipt}`
- `PATCH /api/v1/college-list/:id` body `{category, expectedVersion}`
- `POST /api/v1/compare` body `{courseIds}` → `{rows, sources, limitations}`
- `GET /api/v1/sources?institutionId=` → `{sources, freshnessAlerts}`

## Candidatura

- `GET /api/v1/deadlines` → `{events, staleSources}`
- `POST /api/v1/tasks` body `{title, dueAt, sourceId}` → `{task, actionReceipt}`
- `PATCH /api/v1/tasks/:id` body `{status}`
- `POST /api/v1/essays` body `{promptId, title}` → `{essay}`
- `POST /api/v1/essays/:id/review` body `{checks}` → `{findings, sources, disclaimer}`
- `POST /api/v1/recommendations` body `{recommender, dueAt, shareConsent}`
- `POST /api/v1/activities` body `{activity}` → `{activity, authenticityChecklist}`
- `GET /api/v1/scholarships` → `{items, eligibilityReasons, sources}`

## Agente

`POST /api/v1/agent/conversations/:id/messages`

```json
{
  "message": "pergunta atual",
  "pageContext": {"route": "/app/universidades", "resourceId": "...", "selectedText": null},
  "requestedContext": ["profile.summary", "saved_colleges"],
  "stream": true
}
```

O servidor monta `userId`, perfil autorizado, histórico relevante e fontes recuperadas. Eventos SSE: `assistant_message`, `tool_started`, `tool_completed`, `confirmation_required`, `action_applied`, `action_cancelled`, `action_undone`, `error`, `done`.

## Conta e privacidade

- `POST /api/v1/account/export` → job assíncrono com link expirável.
- `POST /api/v1/account/delete` body `{confirmation}` → exclusão agendada e auditada.
- `GET /api/v1/consents`; `PATCH /api/v1/consents/:kind`.
