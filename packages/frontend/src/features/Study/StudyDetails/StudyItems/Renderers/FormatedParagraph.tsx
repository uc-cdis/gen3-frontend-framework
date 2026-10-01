import type { ReactElement } from 'react';
import React from 'react';
import type { FieldRendererFunction } from '../RendererFactory';
import type { JSONValue } from '@gen3/core';
import { discoveryFieldStyle } from './utils';
import { Text } from '@mantine/core';

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

/**
 * Formats raw scraped text into structured paragraphs.
 *
 * Detection rules (applied in order):
 *  1. Three or more consecutive whitespace characters → paragraph break
 *  2. "Label:  Value" (2+ spaces after colon) → new paragraph per field
 *  3. Remaining runs of single spaces are left as normal prose.
 *
 * Output is an array of trimmed, non-empty paragraph strings.
 */
function formatRawText(raw: string): string[] {
  // Normalize: collapse \r\n and \t into spaces so we work with one
  // whitespace character, then operate purely on space-runs.
  const normalized = raw.replace(/[\r\n\t]+/g, ' ');

  // Split on runs of 3+ whitespace characters.  This catches both
  // "section gap" patterns and the metadata block at the end.
  const chunks = normalized.split(/\s{2,}/);

  const paragraphs: string[] = [];

  for (const chunk of chunks) {
    const trimmed = chunk.trim();
    if (!trimmed) continue;

    // Within a chunk, detect "Label:  Value" pairs (2+ spaces after colon)
    // that were below the 3-space split threshold.
    // Example: "Study Type:  Longitudinal Family"
    const kvPattern = /^(.+?:\s{2,}.+)$/;
    if (kvPattern.test(trimmed)) {
      // Could contain multiple K:V pairs separated by 2-space gaps
      // that survived the 3-space split — re-split on "  " (2+ spaces).
      const subParts = trimmed.split(/\s{2,}/);
      let buffer = '';
      for (const part of subParts) {
        const p = part.trim();
        if (!p) continue;
        // If this part looks like a label (ends with ':'), start accumulating
        if (p.endsWith(':')) {
          if (buffer) paragraphs.push(buffer.trim());
          buffer = p;
        } else if (buffer) {
          buffer += ' ' + p;
        } else {
          buffer = p;
        }
      }
      if (buffer) paragraphs.push(buffer.trim());
    } else {
      paragraphs.push(trimmed);
    }
  }

  return paragraphs;
}

/** Convenience: returns the paragraphs joined with double-newlines. */
function formatScrapedTextAsString(raw: string): string {
  return formatRawText(raw).join('\n\n');
}

/** Convenience: returns HTML <p> tags. */
function formatScrapedTextAsHtml(raw: string): string {
  return formatRawText(raw)
    .map((p) => `<p>${escapeHtml(p)}</p>`)
    .join('\n');
}

/** Convenience: returns HTML <p> tags. */
function formatScrapedTextToElement(raw: string): ReactElement {
  const text = formatRawText(raw);
  return (
    <div className="flex flex-col">
      {text.map((p) => (
        <p key={p.slice(20)}>
          <Text>{p}</Text>
        </p>
      ))}
    </div>
  );
}

const RenderFormattedParagraph: FieldRendererFunction = (
  fieldValue: JSONValue,
  fieldLabel?: string,
) => {
  if (typeof fieldValue !== 'string') return <React.Fragment />;

  const stringFieldValue = fieldValue as string;
  return (
    <div
      className={`${discoveryFieldStyle}`}
      key={`study-details-${fieldLabel}-${stringFieldValue}`}
    >
      {fieldLabel ? (
        <Text
          tt="uppercase"
          fw="500"
          className="p-0.75 mr-4 whitespace-pre-wrap break-words"
        >
          {fieldLabel}
        </Text>
      ) : (
        <React.Fragment />
      )}
      {formatScrapedTextToElement(fieldValue as string)}
    </div>
  );
};

export default RenderFormattedParagraph;
