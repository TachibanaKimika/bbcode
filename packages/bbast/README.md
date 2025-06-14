# bbast

BBCode Abstract Syntax Tree types and utilities based on [unist](https://github.com/syntax-tree/unist).

## Installation

```bash
npm install bbast
# or
pnpm add bbast
# or
yarn add bbast
```

## Usage

```typescript
import type { Root, BBContent, Text, Bold } from 'bbast'
import { isText, isBBTag, isParent } from 'bbast'

// Example AST for [b]Hello[/b] world
const ast: Root = {
  type: 'root',
  children: [
    {
      type: 'bold',
      children: [
        {
          type: 'text',
          value: 'Hello'
        }
      ]
    },
    {
      type: 'text',
      value: ' world'
    }
  ]
}

// Type guards
function processNode(node: BBContent) {
  if (isText(node)) {
    console.log('Text:', node.value)
  } else if (isBBTag(node)) {
    console.log('BBTag:', node.tagName)
  } else if (isParent(node)) {
    node.children.forEach(processNode)
  }
}
```

## API

### Node Types

#### Root Nodes
- `Root` - The root node of a BBCode document

#### Content Nodes
- `Text` - Plain text content
- `BBTag` - Generic BBCode tag with children
- `BBSelfClosingTag` - Self-closing BBCode tag
- `LineBreak` - Line break
- `Paragraph` - Paragraph container

#### Formatting Nodes
- `Bold` - Bold text `[b]`
- `Italic` - Italic text `[i]`
- `Underline` - Underlined text `[u]`
- `Strikethrough` - Strikethrough text `[s]`
- `Code` - Code text `[code]`
- `Color` - Colored text `[color]`
- `Size` - Sized text `[size]`
- `Font` - Font family `[font]`

#### Layout Nodes
- `Center` - Center alignment `[center]`
- `Left` - Left alignment `[left]`
- `Right` - Right alignment `[right]`

#### Block Nodes
- `Quote` - Quote block `[quote]`
- `List` - List container `[list]`
- `ListItem` - List item `[*]` or `[li]`
- `Table` - Table `[table]`
- `TableRow` - Table row `[tr]`
- `TableCell` - Table cell `[td]` or `[th]`

#### Media Nodes
- `Link` - Hyperlink `[url]`
- `Image` - Image `[img]`

### Union Types

- `BBContent` - Union of all node types
- `BBParentContent` - Union of all parent node types
- `BBLeafContent` - Union of all leaf node types

### Utility Functions

- `isParent(node)` - Check if node is a parent node
- `isLeaf(node)` - Check if node is a leaf node
- `isType(node, type)` - Check if node has specific type
- `isText(node)` - Type guard for text nodes
- `isBBTag(node)` - Type guard for BBTag nodes
- `isRoot(node)` - Type guard for root nodes

### Type Utilities

- `NodeByType<T>` - Extract nodes by type
- `BBData` - Extended unist Data interface
- `BBNode` - Base BBCode node interface
- `BBParent` - Base BBCode parent interface
- `BBLiteral` - Base BBCode literal interface

## Specification

This package follows the [unist](https://github.com/syntax-tree/unist) specification for syntax trees. Each node implements the base `Node` interface with additional BBCode-specific properties.

### Node Structure

All nodes have:
- `type`: String identifying the node type
- `data?`: Optional data object for additional information

Parent nodes additionally have:
- `children`: Array of child nodes

Literal nodes additionally have:
- `value`: String content of the node

### BBCode Extensions

BBCode nodes extend the base unist types with:
- Tag-specific properties (e.g., `url` for Link, `color` for Color)
- Attribute handling for complex tags
- Support for both container and self-closing tags

## License

MIT