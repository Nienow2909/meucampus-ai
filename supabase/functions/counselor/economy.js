// Cost policy shared by all four assistants; the browser cannot select a model.
export const ECONOMY = Object.freeze({
  model: 'gpt-5-nano',
  maxCompletionTokens: 1500,
  maxInputBytes: 40000,
  historyTurns: 2,
  universities: 4,
});

const shorten = (value, limit) => {
  const text = String(value ?? '');
  return text.length > limit ? text.slice(0, limit) + ' [trecho abreviado]' : text;
};

export function compactHistory(rows) {
  return rows.slice(0, ECONOMY.historyTurns).reverse().flatMap(row => [
    {role: 'user', content: shorten(row.question, 1200)},
    {role: 'assistant', content: shorten(row.answer, 1200)},
  ]);
}

export function compactSources(sources) {
  return sources.map(source => ({
    id: source.id,
    university_id: source.university_id,
    title: source.title,
    document_name: source.document_name,
    page: source.page,
    page_end: source.page_end,
    record_number: source.record_number,
    url: source.url,
    cycle: source.cycle,
    status: source.status,
    excerpt: shorten(source.excerpt, 1600),
    excerpt_truncated: String(source.excerpt ?? '').length > 1600,
  }));
}

export function economyRequest(messages) {
  // Bytes are an input-size guard, not a token count or a monetary budget.
  if (new TextEncoder().encode(JSON.stringify(messages)).length > ECONOMY.maxInputBytes) {
    throw new RangeError('Context exceeds economy input budget');
  }
  return {
    model: ECONOMY.model,
    messages,
    max_completion_tokens: ECONOMY.maxCompletionTokens,
    reasoning_effort: 'minimal',
    response_format: {type: 'json_object'},
  };
}
