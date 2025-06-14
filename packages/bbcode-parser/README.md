# @onachi/bbcode-parser

[Unified](https://unifiedjs.com/) plugin to parse BBCode text into [bbast](https://github.com/your-org/bbast) syntax tree.

## Installation

```bash
npm install @onachi/bbcode-parser
# or
pnpm add @onachi/bbcode-parser
# or
yarn add @onachi/bbcode-parser
```

## Usage

```typescript
import { unified } from 'unified'
import bbcodeParser from '@onachi/bbcode-parser'
import { toHast } from '@onachi/bbast-util-to-hast'
import rehypeStringify from 'rehype-stringify'

// Parse BBCode and convert to HTML
const processor = unified()
  .use(bbcodeParser)
  .use(() => (tree) => toHast(tree))
  .use(rehypeStringify)

const result = await processor.process('[b]Hello[/b] [i]World[/i]!')
console.log(String(result))
// <p><strong>Hello</strong> <em>World</em>!</p>
```

## API

### `bbcodeParser(options?)`

Unified plugin that parses BBCode text into bbast syntax tree.

#### Parameters

- `options` (`ParseOptions`, optional) - Parser options (same as [@onachi/bbast-util-from-bbcode](https://www.npmjs.com/package/@onachi/bbast-util-from-bbcode))

#### Returns

Returns a unified plugin that transforms BBCode text into bbast.

### `ParseOptions`

Parser configuration options (inherited from `@onachi/bbast-util-from-bbcode`):

```typescript
interface ParseOptions {
  /** Whether to create paragraph nodes for text blocks (default: true) */
  paragraphs?: boolean
  /** Whether to preserve line breaks (default: true) */
  preserveLineBreaks?: boolean
  /** Custom tag handlers */
  customTags?: Record<string, TagHandler>
  /** Whether to be strict about tag matching (default: false) */
  strict?: boolean
}
```

For detailed documentation of these options, see [@onachi/bbast-util-from-bbcode](https://www.npmjs.com/package/@onachi/bbast-util-from-bbcode).

## Examples

### Basic Usage

```typescript
import { unified } from 'unified'
import bbcodeParser from '@onachi/bbcode-parser'

const processor = unified().use(bbcodeParser)

const bbcode = '[b]Bold text[/b] and [i]italic text[/i]'
const ast = processor.parse(bbcode)

console.log(ast)
// {
//   type: 'root',
//   children: [
//     {
//       type: 'paragraph',
//       children: [
//         {
//           type: 'bold',
//           children: [{ type: 'text', value: 'Bold text' }]
//         },
//         { type: 'text', value: ' and ' },
//         {
//           type: 'italic',
//           children: [{ type: 'text', value: 'italic text' }]
//         }
//       ]
//     }
//   ]
// }
```

### With Custom Options

```typescript
import { unified } from 'unified'
import bbcodeParser from '@onachi/bbcode-parser'

const processor = unified().use(bbcodeParser, {
  paragraphs: false,
  strict: true,
  customTags: {
    spoiler: (tagName, attributes, children) => ({
      type: 'spoiler',
      hidden: true,
      children
    })
  }
})

const ast = processor.parse('[spoiler]Hidden content[/spoiler]')
```

### Complete Pipeline: BBCode to HTML

```typescript
import { unified } from 'unified'
import bbcodeParser from '@onachi/bbcode-parser'
import { toHast } from '@onachi/bbast-util-to-hast'
import rehypeStringify from 'rehype-stringify'

const processor = unified()
  .use(bbcodeParser)
  .use(() => (tree) => toHast(tree))
  .use(rehypeStringify)

const bbcode = `
[quote author="John"]
  [b]Important:[/b] Check out this [url=https://example.com]link[/url]!
  
  [code]console.log('Hello World')[/code]
[/quote]
`

const result = await processor.process(bbcode)
console.log(String(result))
// <blockquote data-author="John">
//   <p><strong>Important:</strong> Check out this <a href="https://example.com">link</a>!</p>
//   <p><code>console.log('Hello World')</code></p>
// </blockquote>
```

### Using with bbcode-rehype

```typescript
import { unified } from 'unified'
import bbcodeParser from '@onachi/bbcode-parser'
import bbcodeRehype from '@onachi/bbcode-rehype'
import rehypeStringify from 'rehype-stringify'

const processor = unified()
  .use(bbcodeParser, { strict: false })
  .use(bbcodeRehype, { 
    elementMappings: { bold: 'b', italic: 'i' }
  })
  .use(rehypeStringify)

const result = await processor.process('[b]Bold[/b] and [i]italic[/i]')
console.log(String(result))
// <p><b>Bold</b> and <i>italic</i></p>
```

### Processing Files

```typescript
import { unified } from 'unified'
import bbcodeParser from '@onachi/bbcode-parser'
import { toHast } from '@onachi/bbast-util-to-hast'
import rehypeStringify from 'rehype-stringify'
import { read, write } from 'to-vfile'

const processor = unified()
  .use(bbcodeParser)
  .use(() => (tree) => toHast(tree))
  .use(rehypeStringify)

const input = await read('input.bbcode')
const result = await processor.process(input)
await write({ path: 'output.html', contents: String(result) })
```

### Streaming Processing

```typescript
import { unified } from 'unified'
import bbcodeParser from '@onachi/bbcode-parser'
import { stream } from 'unified-stream'

const processor = unified()
  .use(bbcodeParser)
  .use(() => (tree) => {
    // Transform the bbast tree
    console.log('Parsed BBCode AST:', tree)
    return tree
  })

process.stdin
  .pipe(stream(processor))
  .pipe(process.stdout)
```

### Error Handling

```typescript
import { unified } from 'unified'
import bbcodeParser from '@onachi/bbcode-parser'

const processor = unified().use(bbcodeParser, { strict: true })

try {
  const ast = processor.parse('[invalid bbcode')
  console.log('Parsed successfully:', ast)
} catch (error) {
  console.error('Parse error:', error.message)
}
```

## Integration with Unified Ecosystem

This plugin works seamlessly with the unified ecosystem:

### With Remark (Markdown)

```typescript
import { unified } from 'unified'
import remarkParse from 'remark-parse'
import remarkRehype from 'remark-rehype'
import bbcodeParser from '@onachi/bbcode-parser'
import rehypeStringify from 'rehype-stringify'

// Process both Markdown and BBCode
const processor = unified()
  .use(remarkParse)
  .use(remarkRehype)
  .use(rehypeStringify)

const bbcodeProcessor = unified()
  .use(bbcodeParser)
  .use(() => (tree) => toHast(tree))
  .use(rehypeStringify)
```

### With Rehype (HTML)

```typescript
import { unified } from 'unified'
import bbcodeParser from '@onachi/bbcode-parser'
import bbcodeRehype from '@onachi/bbcode-rehype'
import rehypeFormat from 'rehype-format'
import rehypeStringify from 'rehype-stringify'

const processor = unified()
  .use(bbcodeParser)
  .use(bbcodeRehype)
  .use(rehypeFormat)
  .use(rehypeStringify)
```

## Supported BBCode Tags

This plugin supports all BBCode tags handled by [@onachi/bbast-util-from-bbcode](https://www.npmjs.com/package/@onachi/bbast-util-from-bbcode):

### Formatting
- `[b]bold[/b]`, `[i]italic[/i]`, `[u]underline[/u]`, `[s]strikethrough[/s]`

### Colors and Styling
- `[color=red]text[/color]`, `[size=large]text[/size]`, `[font=Arial]text[/font]`

### Alignment
- `[center]text[/center]`, `[left]text[/left]`, `[right]text[/right]`

### Links and Media
- `[url=https://example.com]Link[/url]`, `[img=https://example.com/image.jpg]`

### Blocks
- `[quote]text[/quote]`, `[code]code[/code]`

### Lists
- `[list][li]item[/li][/list]`

### Tables
- `[table][tr][td]cell[/td][/tr][/table]`

For complete documentation of supported tags, see [@onachi/bbast-util-from-bbcode](https://www.npmjs.com/package/@onachi/bbast-util-from-bbcode).

## Related

- [@onachi/bbast](https://www.npmjs.com/package/@onachi/bbast) — BBCode Abstract Syntax Tree format
- [@onachi/bbast-util-from-bbcode](https://www.npmjs.com/package/@onachi/bbast-util-from-bbcode) — Convert BBCode to bbast
- [@onachi/bbast-util-to-hast](https://www.npmjs.com/package/@onachi/bbast-util-to-hast) — Convert bbast to hast
- [@onachi/bbcode-rehype](https://www.npmjs.com/package/@onachi/bbcode-rehype) — Unified plugin to convert bbast to hast
- [unified](https://unifiedjs.com/) — Text processing framework
- [hast](https://github.com/syntax-tree/hast) — HTML Abstract Syntax Tree format

## License

MIT
