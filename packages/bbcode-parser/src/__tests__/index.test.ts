import { describe, it, expect } from 'vitest';

import { unified } from 'unified';
import rehypeStringify from 'rehype-stringify';
import bbcodeParser from '..';
import { toHast } from '@onachi/bbast-util-to-hast';

describe('BBCode Parser', () => {
  it('should parse BBCode to HTML', async () => {
    const bbcode = '[b]Bold Text[/b] [i]Italic Text[/i]';
    const processor = unified()
      .use(bbcodeParser, { paragraphs: false })
      .use(() => (tree) => toHast(tree as any, { paragraphs: false }))
      .use(rehypeStringify);

    const result = await processor.process(bbcode);
    expect(result.toString()).toBe('<strong class="bb-bold">Bold Text</strong> <em class="bb-italic">Italic Text</em>');
  });

  it('should handle nested BBCode tags', async () => {
    const bbcode = '[b][i]Bold and Italic[/i][/b]';
    const processor = unified()
      .use(bbcodeParser, { paragraphs: false })
      .use(() => (tree) => toHast(tree as any, { paragraphs: false }))
      .use(rehypeStringify);

    const result = await processor.process(bbcode);
    expect(result.toString()).toBe('<strong class="bb-bold"><em class="bb-italic">Bold and Italic</em></strong>');
  });
});