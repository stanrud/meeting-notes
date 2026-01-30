export function formatTodo(t: { text: string; owner?: string; due?: string }) {
  let result = `• ${t.text}`;

  if (t.owner) {
    result += ` (owner: ${t.owner})`;
  }

  if (t.due) {
    result += ` (due: ${t.due})`;
  }

  return result;
}