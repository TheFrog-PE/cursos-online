import React from 'react';

/**
 * Parses basic Markdown (bold **, italic *, and bullet lists)
 * and returns React elements for dynamic course descriptions.
 */
export const renderFormattedDescription = (text: string) => {
  if (!text) return null;

  const parseInlineMarkdown = (str: string): React.ReactNode[] => {
    const parts = str.split(/(\*\*.*?\*\*|\*.*?\*)/g);
    return parts.map((part, i) => {
      if (part.startsWith('**') && part.endsWith('**')) {
        return <strong key={i} style={{ color: 'var(--text-main)', fontWeight: 700 }}>{part.slice(2, -2)}</strong>;
      }
      if (part.startsWith('*') && part.endsWith('*')) {
        return <em key={i} style={{ fontStyle: 'italic' }}>{part.slice(1, -1)}</em>;
      }
      return part;
    });
  };

  const lines = text.split('\n');
  const elements: React.ReactNode[] = [];
  let currentList: React.ReactNode[] = [];
  let listKey = 0;

  lines.forEach((line, index) => {
    const trimmed = line.trim();
    if (trimmed.startsWith('-') || trimmed.startsWith('*') || trimmed.startsWith('•')) {
      const bulletContent = trimmed.substring(1).trim();
      currentList.push(
        <li key={`li-${index}`} style={{ listStyleType: 'disc', marginLeft: '20px', marginBottom: '6px', color: 'var(--text-muted)' }}>
          {parseInlineMarkdown(bulletContent)}
        </li>
      );
    } else {
      if (currentList.length > 0) {
        elements.push(
          <ul key={`list-${listKey++}`} style={{ marginTop: '8px', marginBottom: '8px', paddingLeft: '20px' }}>
            {currentList}
          </ul>
        );
        currentList = [];
      }
      if (trimmed) {
        elements.push(
          <p key={`p-${index}`} style={{ margin: '8px 0', whiteSpace: 'pre-line', color: 'var(--text-muted)' }}>
            {parseInlineMarkdown(line)}
          </p>
        );
      }
    }
  });

  if (currentList.length > 0) {
    elements.push(
      <ul key={`list-${listKey++}`} style={{ marginTop: '8px', marginBottom: '8px', paddingLeft: '20px' }}>
        {currentList}
      </ul>
    );
  }

  return elements;
};
