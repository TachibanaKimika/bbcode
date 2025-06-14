# @onachi/bbcode-rehype

[Unified](https://unifiedjs.com/) plugin to convert BBCode AST ([bbast](https://github.com/your-org/bbast)) to [hast](https://github.com/syntax-tree/hast) (HTML Abstract Syntax Tree).

## Installation

```bash
npm install @onachi/bbcode-rehype
# or
pnpm add @onachi/bbcode-rehype
# or
yarn add @onachi/bbcode-rehype
```

## Usage

```typescript
import { unified } from 'unified'
import bbcodeParser from '@onachi/bbcode-parser'
import bbcodeRehype from '@onachi/bbcode-rehype'
import rehypeStringify from 'rehype-stringify'

// Complete BBCode to HTML pipeline
const processor = unified()
  .use(bbcodeParser)
  .use(bbcodeRehype)
  .use(rehypeStringify)

const result = await processor.process('[b]Hello[/b] [i]World[/i]!')
console.log(String(result))
// <p><strong>Hello</strong> <em>World</em>!</p>
```

## API

### `bbcodeRehype(options?)`

Unified plugin that transforms bbast syntax tree to hast.

#### Parameters

- `options` (`ToHastOptions`, optional) - Transform options (same as [@onachi/bbast-util-to-hast](https://www.npmjs.com/package/@onachi/bbast-util-to-hast))

#### Returns

Returns a unified plugin that transforms bbast to hast.

### `ToHastOptions`

Transform configuration options (inherited from `@onachi/bbast-util-to-hast`):

```typescript
interface ToHastOptions {
  /** Whether to create paragraphs for text blocks (default: true) */
  paragraphs?: boolean
  /** Custom element mappings */
  elementMappings?: Partial<ElementMappings>
  /** Custom class names for elements */
  classNames?: Partial<ClassNames>
  /** Whether to preserve data attributes (default: true) */
  preserveDataAttributes?: boolean
  /** Default image attributes */
  defaultImageAttributes?: Properties
}
```

For detailed documentation of these options, see [@onachi/bbast-util-to-hast](https://www.npmjs.com/package/@onachi/bbast-util-to-hast).

## Examples

### Basic Usage

```typescript
import { unified } from 'unified'
import bbcodeParser from '@onachi/bbcode-parser'
import bbcodeRehype from '@onachi/bbcode-rehype'
import rehypeStringify from 'rehype-stringify'

const processor = unified()
  .use(bbcodeParser)
  .use(bbcodeRehype)
  .use(rehypeStringify)

const bbcode = '[b]Bold text[/b] and [i]italic text[/i]'
const result = await processor.process(bbcode)

console.log(String(result))
// <p><strong>Bold text</strong> and <em>italic text</em></p>
```

### Custom Element Mappings

```typescript
import { unified } from 'unified'
import bbcodeParser from '@onachi/bbcode-parser'
import bbcodeRehype from '@onachi/bbcode-rehype'
import rehypeStringify from 'rehype-stringify'

const processor = unified()
  .use(bbcodeParser)
  .use(bbcodeRehype, {
    elementMappings: {
      bold: 'b',        // Use <b> instead of <strong>
      italic: 'i',      // Use <i> instead of <em>
      quote: 'div'      // Use <div> instead of <blockquote>
    }
  })
  .use(rehypeStringify)

const result = await processor.process('[b]Bold[/b] [quote]Quote[/quote]')
console.log(String(result))
// <p><b>Bold</b> <div>Quote</div></p>
```

### Custom CSS Classes

```typescript
import { unified } from 'unified'
import bbcodeParser from '@onachi/bbcode-parser'
import bbcodeRehype from '@onachi/bbcode-rehype'
import rehypeStringify from 'rehype-stringify'

const processor = unified()
  .use(bbcodeParser)
  .use(bbcodeRehype, {
    classNames: {
      bold: 'my-bold',
      italic: 'my-italic',
      quote: 'my-quote'
    }
  })
  .use(rehypeStringify)

const result = await processor.process('[b]Bold[/b] [quote]Quote[/quote]')
console.log(String(result))
// <p><strong class="my-bold">Bold</strong> <blockquote class="my-quote">Quote</blockquote></p>
```

### Complex BBCode Processing

```typescript
import { unified } from 'unified'
import bbcodeParser from '@onachi/bbcode-parser'
import bbcodeRehype from '@onachi/bbcode-rehype'
import rehypeStringify from 'rehype-stringify'

const processor = unified()
  .use(bbcodeParser)
  .use(bbcodeRehype, {
    defaultImageAttributes: {
      loading: 'lazy',
      decoding: 'async'
    }
  })
  .use(rehypeStringify)

const bbcode = `
[quote author="John"]
  [b]Important:[/b] Check out this [url=https://example.com]awesome site[/url]!
  
  [img=https://example.com/image.jpg]
  
  [code]
  const example = 'Hello World';
  console.log(example);
  [/code]
[/quote]
`

const result = await processor.process(bbcode)
console.log(String(result))
// <blockquote data-author="John">
//   <p><strong>Important:</strong> Check out this <a href="https://example.com">awesome site</a>!</p>
//   <p><img src="https://example.com/image.jpg" loading="lazy" decoding="async"></p>
//   <p><code>const example = 'Hello World';
//   console.log(example);</code></p>
// </blockquote>
```

### Without Paragraphs

```typescript
import { unified } from 'unified'
import bbcodeParser from '@onachi/bbcode-parser'
import bbcodeRehype from '@onachi/bbcode-rehype'
import rehypeStringify from 'rehype-stringify'

const processor = unified()
  .use(bbcodeParser, { paragraphs: false })
  .use(bbcodeRehype, { paragraphs: false })
  .use(rehypeStringify)

const result = await processor.process('[b]Bold[/b] [i]italic[/i]')
console.log(String(result))
// <strong>Bold</strong> <em>italic</em>
```

### Processing Files

```typescript
import { unified } from 'unified'
import bbcodeParser from '@onachi/bbcode-parser'
import bbcodeRehype from '@onachi/bbcode-rehype'
import rehypeStringify from 'rehype-stringify'
import { read, write } from 'to-vfile'

const processor = unified()
  .use(bbcodeParser)
  .use(bbcodeRehype)
  .use(rehypeStringify)

const input = await read('content.bbcode')
const result = await processor.process(input)
await write({ path: 'output.html', contents: String(result) })
```

### With Additional Rehype Plugins

```typescript
import { unified } from 'unified'
import bbcodeParser from '@onachi/bbcode-parser'
import bbcodeRehype from '@onachi/bbcode-rehype'
import rehypeFormat from 'rehype-format'
import rehypeMinify from 'rehype-preset-minify'
import rehypeStringify from 'rehype-stringify'

// Pretty-formatted HTML
const prettyProcessor = unified()
  .use(bbcodeParser)
  .use(bbcodeRehype)
  .use(rehypeFormat)
  .use(rehypeStringify)

// Minified HTML
const minifyProcessor = unified()
  .use(bbcodeParser)
  .use(bbcodeRehype)
  .use(rehypeMinify)
  .use(rehypeStringify)
```

### Custom Tag Handling

```typescript
import { unified } from 'unified'
import bbcodeParser from '@onachi/bbcode-parser'
import bbcodeRehype from '@onachi/bbcode-rehype'
import rehypeStringify from 'rehype-stringify'

const processor = unified()
  .use(bbcodeParser, {
    customTags: {
      spoiler: (tagName, attributes, children) => ({
        type: 'spoiler',
        revealed: attributes.revealed === 'true',
        children
      }),
      youtube: (tagName, attributes) => ({
        type: 'video',
        provider: 'youtube',
        id: attributes.youtube || attributes.id
      })
    }
  })
  .use(bbcodeRehype, {
    // Custom element mapping for the custom tags
    elementMappings: {
      spoiler: 'details',
      video: 'iframe'
    }
  })
  .use(rehypeStringify)

const result = await processor.process('[spoiler]Hidden content[/spoiler]')
```

### Streaming Processing

```typescript
import { unified } from 'unified'
import bbcodeParser from '@onachi/bbcode-parser'
import bbcodeRehype from '@onachi/bbcode-rehype'
import rehypeStringify from 'rehype-stringify'
import { stream } from 'unified-stream'

const processor = unified()
  .use(bbcodeParser)
  .use(bbcodeRehype)
  .use(rehypeStringify)

process.stdin
  .pipe(stream(processor))
  .pipe(process.stdout)
```

### Transform Inspection

```typescript
import { unified } from 'unified'
import bbcodeParser from '@onachi/bbcode-parser'
import bbcodeRehype from '@onachi/bbcode-rehype'
import { inspect } from 'unist-util-inspect'

const processor = unified()
  .use(bbcodeParser)
  .use(() => (tree) => {
    console.log('BBCode AST:')
    console.log(inspect(tree))
    return tree
  })
  .use(bbcodeRehype)
  .use(() => (tree) => {
    console.log('HTML AST:')
    console.log(inspect(tree))
    return tree
  })

await processor.process('[b]Hello[/b] [i]World[/i]!')
```

## Integration with Unified Ecosystem

This plugin integrates seamlessly with the unified ecosystem:

### With Rehype Plugins

```typescript
import { unified } from 'unified'
import bbcodeParser from '@onachi/bbcode-parser'
import bbcodeRehype from '@onachi/bbcode-rehype'
import rehypeHighlight from 'rehype-highlight'
import rehypeSlug from 'rehype-slug'
import rehypeAutolinkHeadings from 'rehype-autolink-headings'
import rehypeStringify from 'rehype-stringify'

const processor = unified()
  .use(bbcodeParser)
  .use(bbcodeRehype)
  .use(rehypeHighlight)           // Syntax highlighting for code blocks
  .use(rehypeSlug)                // Add IDs to headings
  .use(rehypeAutolinkHeadings)    // Add links to headings
  .use(rehypeStringify)
```

### Building a Complete Content Pipeline

```typescript
import { unified } from 'unified'
import bbcodeParser from '@onachi/bbcode-parser'
import bbcodeRehype from '@onachi/bbcode-rehype'
import rehypeFormat from 'rehype-format'
import rehypeDocument from 'rehype-document'
import rehypeStringify from 'rehype-stringify'

const processor = unified()
  .use(bbcodeParser)
  .use(bbcodeRehype, {
    classNames: {
      quote: 'blockquote',
      code: 'code-block'
    }
  })
  .use(rehypeDocument, {
    title: 'BBCode Content',
    css: ['styles.css'],
    meta: [{ name: 'viewport', content: 'width=device-width, initial-scale=1' }]
  })
  .use(rehypeFormat)
  .use(rehypeStringify)

const result = await processor.process('[b]Hello[/b] [i]World[/i]!')
// Outputs complete HTML document with head, body, etc.
```

## Supported Transformations

This plugin supports all transformations handled by [@onachi/bbast-util-to-hast](https://www.npmjs.com/package/@onachi/bbast-util-to-hast):

### Formatting
- `[b]bold[/b]` → `<strong>` or `<b>`
- `[i]italic[/i]` → `<em>` or `<i>`
- `[u]underline[/u]` → `<u>`
- `[s]strikethrough[/s]` → `<s>` or `<del>`

### Colors and Styling
- `[color=red]text[/color]` → `<span style="color: red">`
- `[size=large]text[/size]` → `<span class="bb-size" data-size="large">`
- `[font=Arial]text[/font]` → `<span style="font-family: Arial">`

### Alignment
- `[center]text[/center]` → `<div class="bb-center" style="text-align: center">`
- `[left]text[/left]` → `<div class="bb-left" style="text-align: left">`
- `[right]text[/right]` → `<div class="bb-right" style="text-align: right">`

### Links and Media
- `[url=https://example.com]Link[/url]` → `<a href="https://example.com">Link</a>`
- `[img=https://example.com/image.jpg]` → `<img src="https://example.com/image.jpg" />`

### Blocks
- `[quote]text[/quote]` → `<blockquote>text</blockquote>`
- `[code]code[/code]` → `<code>code</code>`

### Lists
- `[list][li]item[/li][/list]` → `<ul><li>item</li></ul>`

For complete documentation of supported transformations, see [@onachi/bbast-util-to-hast](https://www.npmjs.com/package/@onachi/bbast-util-to-hast).

## Related

- [@onachi/bbast](https://www.npmjs.com/package/@onachi/bbast) — BBCode Abstract Syntax Tree format
- [@onachi/bbast-util-from-bbcode](https://www.npmjs.com/package/@onachi/bbast-util-from-bbcode) — Convert BBCode to bbast
- [@onachi/bbast-util-to-hast](https://www.npmjs.com/package/@onachi/bbast-util-to-hast) — Convert bbast to hast
- [@onachi/bbcode-parser](https://www.npmjs.com/package/@onachi/bbcode-parser) — Unified plugin to parse BBCode
- [unified](https://unifiedjs.com/) — Text processing framework
- [hast](https://github.com/syntax-tree/hast) — HTML Abstract Syntax Tree format
- [rehype](https://github.com/rehypejs/rehype) — HTML processor built on unified

## License

MIT
