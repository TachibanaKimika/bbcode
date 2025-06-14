# @onachi/bbast-util-from-bbcode

Utility to convert BBCode text to [bbast](https://github.com/your-org/bbast) syntax tree.

## Installation

```bash
npm install @onachi/bbast-util-from-bbcode
# or
pnpm add @onachi/bbast-util-from-bbcode
# or
yarn add @onachi/bbast-util-from-bbcode
```

## Usage

```typescript
import { fromBBCode } from '@onachi/bbast-util-from-bbcode'
// or
import fromBBCode from '@onachi/bbast-util-from-bbcode'

// Parse BBCode text
const ast = fromBBCode('[b]Hello[/b] [i]World[/i]!')

console.log(ast)
// {
//   type: 'root',
//   children: [
//     {
//       type: 'paragraph',
//       children: [
//         {
//           type: 'bold',
//           children: [{ type: 'text', value: 'Hello' }]
//         },
//         { type: 'text', value: ' ' },
//         {
//           type: 'italic', 
//           children: [{ type: 'text', value: 'World' }]
//         },
//         { type: 'text', value: '!' }
//       ]
//     }
//   ]
// }
```

## API

### `fromBBCode(input, options?)`

Convert BBCode text to bbast syntax tree.

#### Parameters

- `input` (`string`) - BBCode text to parse
- `options` (`ParseOptions`, optional) - Parser options

#### Returns

Returns a `Root` node representing the parsed BBCode as a bbast syntax tree.

### `ParseOptions`

Parser configuration options:

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

#### `paragraphs`

When `true` (default), wraps content in paragraph nodes. When `false`, returns content directly.

```typescript
// With paragraphs (default)
fromBBCode('Hello World')
// { type: 'root', children: [{ type: 'paragraph', children: [...] }] }

// Without paragraphs
fromBBCode('Hello World', { paragraphs: false })
// { type: 'root', children: [{ type: 'text', value: 'Hello World' }] }
```

#### `strict`

When `false` (default), unknown tags and malformed content are treated as text. When `true`, parsing fails on invalid content.

```typescript
// Non-strict (default) - unknown tags become text
fromBBCode('[unknown]content[/unknown]', { strict: false })

// Strict - unknown tags create generic BBTag nodes
fromBBCode('[unknown]content[/unknown]', { strict: true })
```

#### `customTags`

Define custom tag handlers for non-standard BBCode tags:

```typescript
const customTags = {
  spoiler: (tagName, attributes, children, content) => ({
    type: 'spoiler',
    hidden: true,
    children
  })
}

fromBBCode('[spoiler]Hidden content[/spoiler]', { customTags })
```

### `tokenize(input)`

Tokenize BBCode text into tokens for advanced processing.

#### Parameters

- `input` (`string`) - BBCode text to tokenize

#### Returns

Returns an array of `Token` objects.

```typescript
interface Token {
  type: 'text' | 'open_tag' | 'close_tag' | 'self_closing_tag'
  value: string
  tagName?: string
  attributes?: Record<string, string | boolean>
  position: { start: number; end: number }
}
```

## Supported BBCode Tags

### Formatting

- `[b]bold[/b]` → `{ type: 'bold', children: [...] }`
- `[i]italic[/i]` → `{ type: 'italic', children: [...] }`
- `[u]underline[/u]` → `{ type: 'underline', children: [...] }`
- `[s]strikethrough[/s]` → `{ type: 'strikethrough', children: [...] }`

### Colors and Styling

- `[color=red]text[/color]` → `{ type: 'color', color: 'red', children: [...] }`
- `[size=large]text[/size]` → `{ type: 'size', size: 'large', children: [...] }`
- `[font=Arial]text[/font]` → `{ type: 'font', family: 'Arial', children: [...] }`

### Alignment

- `[center]text[/center]` → `{ type: 'center', children: [...] }`
- `[left]text[/left]` → `{ type: 'left', children: [...] }`
- `[right]text[/right]` → `{ type: 'right', children: [...] }`

### Links and Media

- `[url=https://example.com]Link[/url]` → `{ type: 'link', url: '...', children: [...] }`
- `[img=https://example.com/image.jpg]` → `{ type: 'image', url: '...', alt: undefined }`

### Blocks

- `[quote]text[/quote]` → `{ type: 'quote', children: [...] }`
- `[code]code[/code]` → `{ type: 'code', children: [...] }`

### Lists

- `[list][li]item[/li][/list]` → `{ type: 'list', children: [{ type: 'listItem', children: [...] }] }`

### Generic Tags

Unknown tags become generic BBTag nodes:

```typescript
// [custom attr="value"]content[/custom]
{
  type: 'bbtag',
  tagName: 'custom',
  attributes: { attr: 'value' },
  children: [{ type: 'text', value: 'content' }]
}
```

## Examples

### Basic Formatting

```typescript
const ast = fromBBCode('[b]Bold[/b] and [i]italic[/i] text')
// Creates bold and italic nodes with text children
```

### Nested Tags

```typescript
const ast = fromBBCode('[b][i]Bold and italic[/i][/b]')
// Creates nested bold > italic > text structure
```

### Links

```typescript
const ast = fromBBCode('[url=https://example.com]Visit Example[/url]')
// Creates link node with URL and text content
```

### Complex Content

```typescript
const bbcode = `
[quote]
  [b]User says:[/b]
  Check out this [url=https://example.com]awesome site[/url]!
  
  [code]
  const example = 'Hello World';
  [/code]
[/quote]
`

const ast = fromBBCode(bbcode)
// Creates nested structure with quote > bold, link, code blocks
```

### Custom Tags

```typescript
const options = {
  customTags: {
    spoiler: (tagName, attributes, children) => ({
      type: 'spoiler',
      revealed: attributes.revealed === 'true',
      children
    }),
    
    youtube: (tagName, attributes) => ({
      type: 'video',
      provider: 'youtube',
      id: attributes.youtube || attributes.id,
      width: attributes.width,
      height: attributes.height
    })
  }
}

const ast = fromBBCode('[spoiler]Hidden content[/spoiler][youtube=dQw4w9WgXcQ]', options)
```

## License

MIT
