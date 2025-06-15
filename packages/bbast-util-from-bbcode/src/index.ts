/**
 * @fileoverview Convert BBCode text to bbast syntax tree
 */

import type {
  Root,
  BBContent
} from '@onachi/bbast'

import type { Position, Point } from 'unist'

// =============================================================================
// Types
// =============================================================================

/**
 * Parser options
 */
export interface ParseOptions {
  /** Whether to create paragraph nodes for text blocks (default: true) */
  paragraphs?: boolean
  /** Whether to preserve line breaks (default: true) */
  preserveLineBreaks?: boolean
  /** Custom tag handlers */
  customTags?: Record<string, TagHandler>
  /** Whether to be strict about tag matching (default: false) */
  strict?: boolean
}

/**
 * Custom tag handler function
 */
export type TagHandler = (
  tagName: string,
  attributes: Record<string, string | boolean>,
  children: BBContent[],
  content: string
) => BBContent

/**
 * Token types for lexical analysis
 */
export interface Token {
  type: 'text' | 'open_tag' | 'close_tag' | 'self_closing_tag'
  value: string
  tagName?: string
  attributes?: Record<string, string | boolean>
  position: { start: number; end: number }
  sourcePosition?: Position
}

// =============================================================================
// Lexer
// =============================================================================

/**
 * Tokenize BBCode text into tokens
 */
export function tokenize(input: string): Token[] {
  const tokens: Token[] = []
  let position = 0

  while (position < input.length) {
    const char = input[position]

    if (char === '[') {
      // Try to parse a tag
      const tagMatch = parseTag(input, position)
      if (tagMatch) {
        // Add source position to token
        tagMatch.token.sourcePosition = createPosition(input, tagMatch.token.position.start, tagMatch.token.position.end)
        tokens.push(tagMatch.token)
        position = tagMatch.nextPosition
      } else {
        // Not a valid tag, treat as text
        const textMatch = parseText(input, position)
        textMatch.token.sourcePosition = createPosition(input, textMatch.token.position.start, textMatch.token.position.end)
        tokens.push(textMatch.token)
        position = textMatch.nextPosition
      }
    } else {
      // Parse text until next tag
      const textMatch = parseText(input, position)
      textMatch.token.sourcePosition = createPosition(input, textMatch.token.position.start, textMatch.token.position.end)
      tokens.push(textMatch.token)
      position = textMatch.nextPosition
    }
  }

  return tokens
}

/**
 * Parse a tag starting at the given position
 */
function parseTag(input: string, start: number): { token: Token; nextPosition: number } | null {
  if (input[start] !== '[') return null

  let position = start + 1
  let tagContent = ''

  // Find the closing ]
  while (position < input.length && input[position] !== ']') {
    tagContent += input[position]
    position++
  }

  if (position >= input.length || input[position] !== ']') {
    // No closing ], not a valid tag
    return null
  }

  position++ // Skip the closing ]

  // Check if this looks like a valid tag format
  // Tags should not contain [ characters (which would indicate nested tags)
  if (tagContent.includes('[')) {
    // This is likely an invalid tag containing nested content, return null
    return null
  }

  // Parse tag content
  const isClosingTag = tagContent.startsWith('/')
  if (isClosingTag) {
    const tagName = tagContent.slice(1).trim()
    return {
      token: {
        type: 'close_tag',
        value: `[${tagContent}]`,
        tagName,
        position: { start, end: position }
      },
      nextPosition: position
    }
  }

  // Parse opening tag with possible attributes
  const { tagName, attributes } = parseTagAttributes(tagContent)

  return {
    token: {
      type: 'open_tag',
      value: `[${tagContent}]`,
      tagName,
      attributes,
      position: { start, end: position }
    },
    nextPosition: position
  }
}

/**
 * Parse tag name and attributes from tag content
 */
function parseTagAttributes(content: string): {
  tagName: string
  attributes: Record<string, string | boolean>
} {
  const trimmed = content.trim()
  const spaceIndex = trimmed.indexOf(' ')
  const equalIndex = trimmed.indexOf('=')

  if (spaceIndex === -1 && equalIndex === -1) {
    // Simple tag like "b" or "i"
    return { tagName: trimmed, attributes: {} }
  }

  let tagName: string
  let attributeString: string

  if (equalIndex !== -1 && (spaceIndex === -1 || equalIndex < spaceIndex)) {
    // Tag with = but no space, like "url=http://example.com"
    const parts = trimmed.split('=', 2)
    tagName = parts[0]!.trim()
    attributeString = parts[1]!.trim()
    
    // For simple value assignment, use the tag name as attribute key
    return {
      tagName,
      attributes: { [tagName]: attributeString.replace(/^["']|["']$/g, '') }
    }
  } else {
    // Tag with spaces, parse more complex attributes
    tagName = trimmed.split(/\s+/)[0]!
    attributeString = trimmed.slice(tagName.length).trim()
    
    return {
      tagName,
      attributes: parseAttributes(attributeString)
    }
  }
}

/**
 * Parse attribute string into key-value pairs
 */
function parseAttributes(attributeString: string): Record<string, string | boolean> {
  const attributes: Record<string, string | boolean> = {}
  
  if (!attributeString) return attributes

  // Simple regex to match key="value" or key=value or just key
  const attrRegex = /(\w+)(?:=(?:"([^"]*)"|'([^']*)'|([^\s]*)))?/g
  let match

  while ((match = attrRegex.exec(attributeString)) !== null) {
    const key = match[1]!
    const value = match[2] || match[3] || match[4]
    attributes[key] = value !== undefined ? value : true
  }

  return attributes
}

/**
 * Parse text until the next tag
 */
function parseText(input: string, start: number): { token: Token; nextPosition: number } {
  let position = start
  let text = ''

  while (position < input.length && input[position] !== '[') {
    text += input[position]
    position++
  }

  // If we started with [ but it's not a valid tag, include the [
  if (text === '' && position < input.length) {
    text = input[position]!
    position++
  }

  return {
    token: {
      type: 'text',
      value: text,
      position: { start, end: position }
    },
    nextPosition: position
  }
}

/**
 * Re-tokenize text to find embedded tags
 */
function retokenizeText(text: string, originalPosition: { start: number; end: number }, _options: Required<ParseOptions>): Token[] {
  // Only retokenize if the text contains potential tag markers
  if (!text.includes('[') || !text.includes(']')) {
    return [{
      type: 'text' as const,
      value: text,
      position: originalPosition
    }]
  }

  // Simple approach: re-tokenize the text content to look for embedded tags
  const subTokens = tokenize(text)
  
  // Adjust positions based on original position
  const adjustedTokens = subTokens.map(token => ({
    ...token,
    position: {
      start: originalPosition.start + token.position.start,
      end: originalPosition.start + token.position.end
    }
  }))

  return adjustedTokens
}

// =============================================================================
// Position utilities
// =============================================================================

/**
 * Convert character offset to line/column position
 */
function offsetToPosition(input: string, offset: number): Point {
  let line = 1
  let column = 1
  
  for (let i = 0; i < offset && i < input.length; i++) {
    if (input[i] === '\n') {
      line++
      column = 1
    } else {
      column++
    }
  }
  
  return { line, column, offset }
}

/**
 * Create position object from start and end offsets
 */
function createPosition(input: string, start: number, end: number): Position {
  return {
    start: offsetToPosition(input, start),
    end: offsetToPosition(input, end)
  }
}

// =============================================================================
// Parser
// =============================================================================

/**
 * Convert BBCode text to bbast syntax tree
 */
export function fromBBCode(input: string, options: ParseOptions = {}): Root {
  const opts: Required<ParseOptions> = {
    paragraphs: true,
    preserveLineBreaks: true,
    customTags: {},
    strict: false,
    ...options
  }

  const tokens = tokenize(input)
  const children = parseTokens(tokens, opts)

  const root: Root = {
    type: 'root',
    children: opts.paragraphs ? wrapInParagraphs(children, opts) : children
  }

  // Add position for the entire document
  if (input.length > 0) {
    root.position = createPosition(input, 0, input.length)
  }

  return root
}

/**
 * Parse tokens into BBContent nodes
 */
function parseTokens(tokens: Token[], options: Required<ParseOptions>): BBContent[] {
  const stack: Array<{ node: BBContent; children: BBContent[]; startToken?: Token }> = []
  const result: BBContent[] = []

  for (let i = 0; i < tokens.length; i++) {
    const token = tokens[i]!

    switch (token.type) {
      case 'text': {
        // Check if this text contains potential tags that weren't parsed
        const reparsedTokens = retokenizeText(token.value, token.position, options)
        if (reparsedTokens.length > 1) {
          // If we found embedded tags, parse them recursively
          const reparsedNodes = parseTokens(reparsedTokens, options)
          reparsedNodes.forEach(node => addToCurrentLevel(node))
        } else {
          const textNode = createTextNode(token.value, options, token)
          if (textNode) {
            addToCurrentLevel(textNode)
          }
        }
        break
      }

      case 'open_tag': {
        if (token.tagName) {
          const node = createTagNode(token.tagName, token.attributes || {}, options, token)
          
          if (node) {
            stack.push({ node, children: [], startToken: token })
          } else if (!options.strict) {
            // Treat as text if tag not recognized and not in strict mode
            const textNode = createTextNode(token.value, options, token)
            if (textNode) {
              addToCurrentLevel(textNode)
            }
          }
        }
        break
      }

      case 'close_tag': {
        if (stack.length > 0) {
          const current = stack.pop()!
          const { node, startToken } = current
          
          if ('children' in node && Array.isArray(node.children)) {
            node.children = current.children
          }
          
          // Set position from start token to current token
          if (startToken && token.sourcePosition && startToken.sourcePosition) {
            node.position = {
              start: startToken.sourcePosition.start,
              end: token.sourcePosition.end
            }
          }
          
          addToCurrentLevel(node)
        } else if (!options.strict) {
          // Unmatched closing tag, treat as text
          const textNode = createTextNode(token.value, options, token)
          if (textNode) {
            addToCurrentLevel(textNode)
          }
        }
        break
      }
    }
  }

  // Handle unclosed tags
  while (stack.length > 0) {
    const current = stack.pop()!
    const { node } = current
    
    if ('children' in node && Array.isArray(node.children)) {
      node.children = current.children
    }
    
    // For unclosed tags, use position from start token only
    if (current.startToken?.sourcePosition) {
      node.position = {
        start: current.startToken.sourcePosition.start,
        end: current.startToken.sourcePosition.end
      }
    }
    
    addToCurrentLevel(node)
  }

  function addToCurrentLevel(node: BBContent) {
    if (stack.length > 0) {
      stack[stack.length - 1]!.children.push(node)
    } else {
      result.push(node)
    }
  }

  return result
}

/**
 * Create a text node, handling line breaks
 */
function createTextNode(text: string, options: Required<ParseOptions>, token?: Token): BBContent | null {
  if (!text) return null

  const textNode: BBContent = { type: 'text', value: text }
  
  // Add position if available
  if (token?.sourcePosition) {
    textNode.position = token.sourcePosition
  }

  if (options.preserveLineBreaks) {
    // Split on line breaks and create separate nodes
    const parts = text.split(/\r?\n/)
    if (parts.length === 1) {
      return textNode
    }

    // This is complex, for now just return a simple text node
    // In a real implementation, you might want to handle this differently
    return textNode
  }

  return textNode
}

/**
 * Create a tag node based on tag name and attributes
 */
function createTagNode(
  tagName: string,
  attributes: Record<string, string | boolean>,
  options: Required<ParseOptions>,
  token?: Token
): BBContent | null {
  const lowerTagName = tagName.toLowerCase()

  // Check custom tags first
  if (options.customTags[lowerTagName]) {
    // Custom tags will be handled after parsing children
    const node: BBContent = {
      type: 'bbtag',
      tagName: lowerTagName,
      attributes,
      children: []
    }
    
    // Add position if available
    if (token?.sourcePosition) {
      node.position = token.sourcePosition
    }
    
    return node
  }

  let node: BBContent | null = null

  // Built-in tags
  switch (lowerTagName) {
    case 'b':
    case 'bold':
      node = { type: 'bold', children: [] }
      break

    case 'i':
    case 'italic':
      node = { type: 'italic', children: [] }
      break

    case 'u':
    case 'underline':
      node = { type: 'underline', children: [] }
      break

    case 's':
    case 'strike':
    case 'strikethrough':
      node = { type: 'strikethrough', children: [] }
      break

    case 'code':
      node = {
        type: 'code',
        language: typeof attributes['language'] === 'string' ? attributes['language'] : undefined,
        children: []
      }
      break

    case 'quote':
      node = {
        type: 'quote',
        author: typeof attributes['author'] === 'string' ? attributes['author'] : undefined,
        children: []
      }
      break

    case 'url':
    case 'link':
      const url = typeof attributes['url'] === 'string' ? attributes['url'] 
                : typeof attributes[lowerTagName] === 'string' ? attributes[lowerTagName] as string
                : '#'
      node = {
        type: 'link',
        url,
        title: typeof attributes['title'] === 'string' ? attributes['title'] : undefined,
        children: []
      }
      break

    case 'img':
    case 'image':
      const imgUrl = typeof attributes['src'] === 'string' ? attributes['src']
                   : typeof attributes[lowerTagName] === 'string' ? attributes[lowerTagName] as string
                   : ''
      node = {
        type: 'image',
        url: imgUrl,
        alt: typeof attributes['alt'] === 'string' ? attributes['alt'] : undefined,
        title: typeof attributes['title'] === 'string' ? attributes['title'] : undefined
      }
      break

    case 'color':
      const color = typeof attributes['color'] === 'string' ? attributes['color']
                  : typeof attributes[lowerTagName] === 'string' ? attributes[lowerTagName] as string
                  : 'black'
      node = {
        type: 'color',
        color,
        children: []
      }
      break

    case 'size':
      const size = attributes['size'] || attributes[lowerTagName] || 'medium'
      node = {
        type: 'size',
        size: typeof size === 'string' ? size : String(size),
        children: []
      }
      break

    case 'font':
      const family = typeof attributes['family'] === 'string' ? attributes['family']
                   : typeof attributes[lowerTagName] === 'string' ? attributes[lowerTagName] as string
                   : 'serif'
      node = {
        type: 'font',
        family,
        children: []
      }
      break

    case 'center':
      node = { type: 'center', children: [] }
      break

    case 'left':
      node = { type: 'left', children: [] }
      break

    case 'right':
      node = { type: 'right', children: [] }
      break

    case 'list':
      node = {
        type: 'list',
        ordered: attributes['type'] === '1' || attributes['ordered'] === true,
        children: []
      }
      break

    case 'li':
    case '*':
      node = { type: 'listItem', children: [] }
      break

    default:
      // Unknown tag, return null to treat as text
      return null
  }

  // Add position if available and node was created
  if (node && token?.sourcePosition) {
    node.position = token.sourcePosition
  }

  return node
}

/**
 * Wrap content in paragraph nodes
 */
function wrapInParagraphs(children: BBContent[], _options: Required<ParseOptions>): BBContent[] {
  // Simple implementation - just wrap all content in a single paragraph
  // A more sophisticated implementation would group text and inline elements
  if (children.length === 0) return []

  return [{
    type: 'paragraph',
    children
  }]
}

// =============================================================================
// Exports
// =============================================================================

export { fromBBCode as default }
