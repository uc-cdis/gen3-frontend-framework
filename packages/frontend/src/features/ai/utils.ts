/**
 * Converts LaTeX math delimiters to streamdown-compatible $$ syntax.
 * Handles block (\[ \]) and inline (\( \)) delimiters.
 */
export function convertLatexDelimiters(text: string): string {
  // Block math: \[ ... \] → $$ ... $$
  text = text.replace(/\\\[([\s\S]*?)\\\]/g, (_match, inner) => {
    return `$$${inner}$$`;
  });

  // Inline math: \( ... \) → $$ ... $$
  text = text.replace(/\\\(([\s\S]*?)\\\)/g, (_match, inner) => {
    return `$$${inner}$$`;
  });

  return text;
}
