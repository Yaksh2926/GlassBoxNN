import React, { useMemo } from 'react';
import katex from 'katex';

interface MathViewProps {
  math: string;
  block?: boolean;
  className?: string;
}

export const MathView: React.FC<MathViewProps> = ({ math, block = false, className = '' }) => {
  const html = useMemo(() => {
    try {
      return katex.renderToString(math, {
        displayMode: block,
        throwOnError: false,
        output: 'html',
      });
    } catch (e) {
      return math;
    }
  }, [math, block]);

  return (
    <span
      className={`inline-block font-mono ${className}`}
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
};
