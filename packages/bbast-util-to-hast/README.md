# @onachi/bbast-util-to-hast

Utility to convert [bbast](https://github.com/your-org/bbast) syntax tree to [hast](https://github.com/syntax-tree/hast) (HTML Abstract Syntax Tree).

## Installation

```bash
npm install @onachi/bbast-util-to-hast
# or
pnpm add @onachi/bbast-util-to-hast
# or
yarn add @onachi/bbast-util-to-hast
```

## Usage

```typescript
import { toHast } from '@onachi/bbast-util-to-hast'
import { fromBBCode } from '@onachi/bbast-util-from-bbcode'
import { toHtml } from 'hast-util-to-html'

// Convert BBCode to bbast, then to hast, then to HTML
const bbast = fromBBCode('[b]Hello[/b] [i]World[/i]!')
const hast = toHast(bbast)
const html = toHtml(hast)

console.log(html)
// <p><strong>Hello</strong> <em>World</em>!</p>
```

## API

### `toHast(bbast, options?)`

Convert bbast syntax tree to hast.

#### Parameters

- `bbast` (`Root`) - bbast syntax tree to convert
- `options` (`ToHastOptions`, optional) - Conversion options

#### Returns

Returns a `Root` node representing the converted HTML as a hast syntax tree.

### `ToHastOptions`

Conversion configuration options:

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

#### `paragraphs`

When `true` (default), wraps content in paragraph elements. When `false`, omits paragraph wrappers.

```typescript
// With paragraphs (default)
toHast(bbast)
// Creates <p> elements for text blocks

// Without paragraphs  
toHast(bbast, { paragraphs: false })
// No paragraph wrappers
```

#### `elementMappings`

Customize which HTML elements are used for BBCode tags:

```typescript
const options = {
  elementMappings: {
    bold: 'b',        // Use <b> instead of <strong>
    italic: 'i',      // Use <i> instead of <em>
    quote: 'div'      // Use <div> instead of <blockquote>
  }
}

toHast(bbast, options)
```

#### `classNames`

Add custom CSS classes to generated elements:

```typescript
const options = {
  classNames: {
    bold: 'my-bold',
    italic: 'my-italic',
    quote: 'my-quote'
  }
}

toHast(bbast, options)
// <strong class="my-bold">text</strong>
```

#### `preserveDataAttributes`

When `true` (default), preserves BBCode attributes as HTML data attributes:

```typescript
// BBCode: [quote author="John"]Hello[/quote]
// HTML: <blockquote data-author="John">Hello</blockquote>
```

#### `defaultImageAttributes`

Set default attributes for image elements:

```typescript
const options = {
  defaultImageAttributes: {
    loading: 'lazy',
    decoding: 'async'
  }
}
```

### `ElementMappings`

Default HTML element mappings for BBCode tags:

```typescript
interface ElementMappings {
  bold: 'strong'          // [b] → <strong>
  italic: 'em'            // [i] → <em>
  underline: 'u'          // [u] → <u>
  strikethrough: 's'      // [s] → <s>
  code: 'code'            // [code] → <code>
  quote: 'blockquote'     // [quote] → <blockquote>
  link: 'a'               // [url] → <a>
  image: 'img'            // [img] → <img>
  color: 'span'           // [color] → <span>
  size: 'span'            // [size] → <span>
  font: 'span'            // [font] → <span>
  center: 'div'           // [center] → <div>
  left: 'div'             // [left] → <div>
  right: 'div'            // [right] → <div>
  list: 'ul'              // [list] → <ul>
  listItem: 'li'          // [li] → <li>
  table: 'table'          // [table] → <table>
  tableRow: 'tr'          // [tr] → <tr>
  tableCell: 'td'         // [td] → <td>
  paragraph: 'p'          // paragraph → <p>
  break: 'br'             // line break → <br>
}
```

## Supported Transformations

### Formatting

- `{ type: 'bold' }` → `<strong>` or `<b>`
- `{ type: 'italic' }` → `<em>` or `<i>`
- `{ type: 'underline' }` → `<u>`
- `{ type: 'strikethrough' }` → `<s>` or `<del>`

### Colors and Styling

- `{ type: 'color', color: 'red' }` → `<span style="color: red">`
- `{ type: 'size', size: 'large' }` → `<span class="bb-size" data-size="large">`
- `{ type: 'font', family: 'Arial' }` → `<span style="font-family: Arial">`

### Alignment

- `{ type: 'center' }` → `<div class="bb-center" style="text-align: center">`
- `{ type: 'left' }` → `<div class="bb-left" style="text-align: left">`
- `{ type: 'right' }` → `<div class="bb-right" style="text-align: right">`

### Links and Media

- `{ type: 'link', url: '...' }` → `<a href="...">` 
- `{ type: 'image', url: '...' }` → `<img src="..." />`

### Blocks

- `{ type: 'quote' }` → `<blockquote>`
- `{ type: 'code' }` → `<code>` or `<pre><code>`
- `{ type: 'paragraph' }` → `<p>`

### Lists

- `{ type: 'list' }` → `<ul>` or `<ol>`
- `{ type: 'listItem' }` → `<li>`

### Tables

- `{ type: 'table' }` → `<table>`
- `{ type: 'tableRow' }` → `<tr>`
- `{ type: 'tableCell' }` → `<td>` or `<th>`

### Generic Tags

- `{ type: 'bbtag', tagName: 'custom' }` → `<div class="bb-custom" data-tag="custom">`

## Examples

### Basic Formatting

```typescript
import { toHast } from '@onachi/bbast-util-to-hast'
import { fromBBCode } from '@onachi/bbast-util-from-bbcode'

const bbast = fromBBCode('[b]Bold[/b] and [i]italic[/i] text')
const hast = toHast(bbast)
// Converts to: <p><strong>Bold</strong> and <em>italic</em> text</p>
```

### Links and Images

```typescript
const bbast = fromBBCode('[url=https://example.com]Visit Example[/url]')
const hast = toHast(bbast)
// Converts to: <p><a href="https://example.com">Visit Example</a></p>

const bbast2 = fromBBCode('[img=https://example.com/image.jpg]')
const hast2 = toHast(bbast2)
// Converts to: <p><img src="https://example.com/image.jpg" /></p>
```

### Custom Element Mappings

```typescript
const options = {
  elementMappings: {
    bold: 'b',
    italic: 'i',
    quote: 'div'
  },
  classNames: {
    quote: 'custom-quote'
  }
}

const bbast = fromBBCode('[quote][b]Important[/b] note[/quote]')
const hast = toHast(bbast, options)
// Converts to: <div class="custom-quote"><b>Important</b> note</div>
```

### Complex Content

```typescript
const bbcode = `
[quote author="John"]
  [b]User says:[/b]
  Check out this [url=https://example.com]awesome site[/url]!
  
  [code]
  const example = 'Hello World';
  [/code]
[/quote]
`

const bbast = fromBBCode(bbcode)
const hast = toHast(bbast)
// Converts to nested HTML structure with blockquote, strong, a, and code elements
```

### Working with hast-util-to-html

```typescript
import { toHast } from '@onachi/bbast-util-to-hast'
import { fromBBCode } from '@onachi/bbast-util-from-bbcode'
import { toHtml } from 'hast-util-to-html'

const bbcode = '[b]Hello[/b] [color=red]World[/color]!'
const bbast = fromBBCode(bbcode)
const hast = toHast(bbast)
const html = toHtml(hast)

console.log(html)
// <p><strong>Hello</strong> <span style="color: red">World</span>!</p>
```

### Custom Image Attributes

```typescript
const options = {
  defaultImageAttributes: {
    loading: 'lazy',
    decoding: 'async',
    class: 'responsive-image'
  }
}

const bbast = fromBBCode('[img=photo.jpg]')
const hast = toHast(bbast, options)
// <img src="photo.jpg" loading="lazy" decoding="async" class="responsive-image" />
```

## License

MIT
