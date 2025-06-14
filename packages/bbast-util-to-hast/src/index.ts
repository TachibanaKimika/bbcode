/**
 * @fileoverview Convert bbast syntax tree to hast (HTML AST)
 */

import type {
  Root as BBRoot,
  BBContent,
  Text,
  BBTag,
  Paragraph,
  Bold,
  Italic,
  Underline,
  Strikethrough,
  Code,
  Quote,
  Link,
  Image,
  Color,
  Size,
  Font,
  Center,
  Left,
  Right,
  List,
  ListItem,
  Table,
  TableRow,
  TableCell
} from '@onachi/bbast'

import type {
  Root as HastRoot,
  Element,
  Text as HastText,
  Content as HastContent,
  Properties
} from 'hast'

// =============================================================================
// Types
// =============================================================================

/**
 * Transform options
 */
export interface ToHastOptions {
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

/**
 * Element mappings for BBCode tags to HTML elements
 */
export interface ElementMappings {
  bold: string
  italic: string
  underline: string
  strikethrough: string
  code: string
  quote: string
  link: string
  image: string
  color: string
  size: string
  font: string
  center: string
  left: string
  right: string
  list: string
  listItem: string
  table: string
  tableRow: string
  tableCell: string
  paragraph: string
  break: string
}

/**
 * Class names for styled elements
 */
export interface ClassNames {
  bold: string
  italic: string
  underline: string
  strikethrough: string
  code: string
  quote: string
  color: string
  size: string
  font: string
  center: string
  left: string
  right: string
  table: string
  tableRow: string
  tableCell: string
  list: string
}

// =============================================================================
// Default configurations
// =============================================================================

const defaultElementMappings: ElementMappings = {
  bold: 'strong',
  italic: 'em',
  underline: 'u',
  strikethrough: 's',
  code: 'code',
  quote: 'blockquote',
  link: 'a',
  image: 'img',
  color: 'span',
  size: 'span',
  font: 'span',
  center: 'div',
  left: 'div',
  right: 'div',
  list: 'ul',
  listItem: 'li',
  table: 'table',
  tableRow: 'tr',
  tableCell: 'td',
  paragraph: 'p',
  break: 'br'
}

const defaultClassNames: ClassNames = {
  bold: 'bb-bold',
  italic: 'bb-italic',
  underline: 'bb-underline',
  strikethrough: 'bb-strikethrough',
  code: 'bb-code',
  quote: 'bb-quote',
  color: 'bb-color',
  size: 'bb-size',
  font: 'bb-font',
  center: 'bb-center',
  left: 'bb-left',
  right: 'bb-right',
  table: 'bb-table',
  tableRow: 'bb-table-row',
  tableCell: 'bb-table-cell',
  list: 'bb-list',
}

// =============================================================================
// Main transform function
// =============================================================================

/**
 * Transform bbast to hast
 */
export function toHast(tree: BBRoot, options: ToHastOptions = {}): HastRoot {
  const opts = {
    paragraphs: true,
    preserveDataAttributes: true,
    elementMappings: { ...defaultElementMappings, ...options.elementMappings },
    classNames: { ...defaultClassNames, ...options.classNames },
    defaultImageAttributes: {},
    ...options
  }

  return {
    type: 'root',
    children: transformChildren(tree.children, opts)
  }
}

// =============================================================================
// Transform functions
// =============================================================================

/**
 * Transform children nodes
 */
function transformChildren(children: BBContent[], options: Required<ToHastOptions>): Element['children'] {
  const result: Element['children'] = []
  
  for (const child of children) {
    const transformed = transformNode(child, options)
    if (transformed) {
      if (Array.isArray(transformed)) {
        result.push(...(transformed.filter(node => 
          node.type === 'text' || node.type === 'element'
        ) as Element['children']))
      } else if (transformed.type === 'text' || transformed.type === 'element') {
        result.push(transformed as Element['children'][number])
      }
    }
  }
  
  return result
}

/**
 * Transform a single node
 */
function transformNode(node: BBContent, options: Required<ToHastOptions>): HastContent | HastContent[] | null {
  switch (node.type) {
    case 'root':
      return transformChildren(node.children, options)
    
    case 'text':
      return transformText(node)
    
    case 'break':
      return transformLineBreak(options)
    
    case 'paragraph':
      return transformParagraph(node, options)
    
    case 'bold':
      return transformBold(node, options)
    
    case 'italic':
      return transformItalic(node, options)
    
    case 'underline':
      return transformUnderline(node, options)
    
    case 'strikethrough':
      return transformStrikethrough(node, options)
    
    case 'code':
      return transformCode(node, options)
    
    case 'quote':
      return transformQuote(node, options)
    
    case 'link':
      return transformLink(node, options)
    
    case 'image':
      return transformImage(node, options)
    
    case 'color':
      return transformColor(node, options)
    
    case 'size':
      return transformSize(node, options)
    
    case 'font':
      return transformFont(node, options)
    
    case 'center':
      return transformCenter(node, options)
    
    case 'left':
      return transformLeft(node, options)
    
    case 'right':
      return transformRight(node, options)
    
    case 'list':
      return transformList(node, options)
    
    case 'listItem':
      return transformListItem(node, options)
    
    case 'table':
      return transformTable(node, options)
    
    case 'tableRow':
      return transformTableRow(node, options)
    
    case 'tableCell':
      return transformTableCell(node, options)
    
    case 'bbtag':
      return transformBBTag(node, options)
    
    default:
      // 未知类型，尝试作为通用元素处理
      return null
  }
}

// =============================================================================
// Specific transform functions
// =============================================================================

function transformText(node: Text): HastText {
  return {
    type: 'text',
    value: node.value
  }
}

function transformLineBreak(options: Required<ToHastOptions>): Element {
  return {
    type: 'element',
    tagName: options.elementMappings.break || 'br',
    properties: {},
    children: []
  }
}

function transformParagraph(node: Paragraph, options: Required<ToHastOptions>): Element {
  return {
    type: 'element',
    tagName: options.elementMappings.paragraph || 'p',
    properties: {},
    children: transformChildren(node.children, options)
  }
}

function transformBold(node: Bold, options: Required<ToHastOptions>): Element {
  return {
    type: 'element',
    tagName: options.elementMappings.bold || 'strong',
    properties: {
      className: [options.classNames.bold || 'bb-bold']
    },
    children: transformChildren(node.children, options)
  }
}

function transformItalic(node: Italic, options: Required<ToHastOptions>): Element {
  return {
    type: 'element',
    tagName: options.elementMappings.italic || 'em',
    properties: {
      className: [options.classNames.italic || 'bb-italic']
    },
    children: transformChildren(node.children, options)
  }
}

function transformUnderline(node: Underline, options: Required<ToHastOptions>): Element {
  return {
    type: 'element',
    tagName: options.elementMappings.underline || 'u',
    properties: {
      className: [options.classNames.underline || 'bb-underline']
    },
    children: transformChildren(node.children, options)
  }
}

function transformStrikethrough(node: Strikethrough, options: Required<ToHastOptions>): Element {
  return {
    type: 'element',
    tagName: options.elementMappings.strikethrough || 's',
    properties: {
      className: [options.classNames.strikethrough || 'bb-strikethrough']
    },
    children: transformChildren(node.children, options)
  }
}

function transformCode(node: Code, options: Required<ToHastOptions>): Element {
  const properties: Properties = {
    className: [options.classNames.code || 'bb-code']
  }
  
  if (node.language) {
    properties['dataLanguage'] = node.language
  }
  
  return {
    type: 'element',
    tagName: options.elementMappings.code || 'code',
    properties,
    children: transformChildren(node.children, options)
  }
}

function transformQuote(node: Quote, options: Required<ToHastOptions>): Element {
  const properties: Properties = {
    className: [options.classNames.quote || 'bb-quote']
  }
  
  if (node.author) {
    properties['dataAuthor'] = node.author
  }
  
  return {
    type: 'element',
    tagName: options.elementMappings.quote || 'blockquote',
    properties,
    children: transformChildren(node.children, options)
  }
}

function transformLink(node: Link, options: Required<ToHastOptions>): Element {
  const properties: Properties = {
    href: node.url
  }
  
  if (node.title) {
    properties['title'] = node.title
  }
  
  return {
    type: 'element',
    tagName: options.elementMappings.link || 'a',
    properties,
    children: transformChildren(node.children, options)
  }
}

function transformImage(node: Image, options: Required<ToHastOptions>): Element {
  const properties: Properties = {
    src: node.url,
    ...options.defaultImageAttributes
  }
  
  if (node.alt) {
    properties['alt'] = node.alt
  }
  
  if (node.title) {
    properties['title'] = node.title
  }
  
  if (node.width) {
    properties['width'] = node.width
  }
  
  if (node.height) {
    properties['height'] = node.height
  }
  
  return {
    type: 'element',
    tagName: options.elementMappings.image || 'img',
    properties,
    children: []
  }
}

function transformColor(node: Color, options: Required<ToHastOptions>): Element {
  return {
    type: 'element',
    tagName: options.elementMappings.color || 'span',
    properties: {
      className: [options.classNames.color || 'bb-color'],
      style: `color: ${node.color}`
    },
    children: transformChildren(node.children, options)
  }
}

function transformSize(node: Size, options: Required<ToHastOptions>): Element {
  const size = /^\d+$/.test(String(node.size)) ? `${node.size}px` : node.size
  
  return {
    type: 'element',
    tagName: options.elementMappings.size || 'span',
    properties: {
      className: [options.classNames.size || 'bb-size'],
      style: `font-size: ${size}`
    },
    children: transformChildren(node.children, options)
  }
}

function transformFont(node: Font, options: Required<ToHastOptions>): Element {
  return {
    type: 'element',
    tagName: options.elementMappings.font || 'span',
    properties: {
      className: [options.classNames.font || 'bb-font'],
      style: `font-family: ${node.family}`
    },
    children: transformChildren(node.children, options)
  }
}

function transformCenter(node: Center, options: Required<ToHastOptions>): Element {
  return {
    type: 'element',
    tagName: options.elementMappings.center || 'div',
    properties: {
      className: [options.classNames.center || 'bb-center'],
      style: 'text-align: center'
    },
    children: transformChildren(node.children, options)
  }
}

function transformLeft(node: Left, options: Required<ToHastOptions>): Element {
  return {
    type: 'element',
    tagName: options.elementMappings.left || 'div',
    properties: {
      className: [options.classNames.left || 'bb-left'],
      style: 'text-align: left'
    },
    children: transformChildren(node.children, options)
  }
}

function transformRight(node: Right, options: Required<ToHastOptions>): Element {
  return {
    type: 'element',
    tagName: options.elementMappings.right || 'div',
    properties: {
      className: [options.classNames.right || 'bb-right'],
      style: 'text-align: right'
    },
    children: transformChildren(node.children, options)
  }
}

function transformList(node: List, options: Required<ToHastOptions>): Element {
  const tagName = node.ordered ? 'ol' : (options.elementMappings.list || 'ul')
  const properties: Properties = {
    className: [options.classNames.list || 'bb-list']
  }
  
  if (node.listType) {
    properties['dataListType'] = node.listType
  }
  
  return {
    type: 'element',
    tagName,
    properties,
    children: transformChildren(node.children, options)
  }
}

function transformListItem(node: ListItem, options: Required<ToHastOptions>): Element {
  return {
    type: 'element',
    tagName: options.elementMappings.listItem || 'li',
    properties: {},
    children: transformChildren(node.children, options)
  }
}

function transformTable(node: Table, options: Required<ToHastOptions>): Element {
  return {
    type: 'element',
    tagName: options.elementMappings.table || 'table',
    properties: {
      className: [options.classNames.table || 'bb-table']
    },
    children: transformChildren(node.children, options)
  }
}

function transformTableRow(node: TableRow, options: Required<ToHastOptions>): Element {
  return {
    type: 'element',
    tagName: options.elementMappings.tableRow || 'tr',
    properties: {
      className: [options.classNames.tableRow || 'bb-table-row']
    },
    children: transformChildren(node.children, options)
  }
}

function transformTableCell(node: TableCell, options: Required<ToHastOptions>): Element {
  const tagName = node.header ? 'th' : (options.elementMappings.tableCell || 'td')
  const properties: Properties = {
    className: [options.classNames.tableCell || 'bb-table-cell']
  }
  
  if (node.colspan && node.colspan > 1) {
    properties['colSpan'] = node.colspan
  }
  
  if (node.rowspan && node.rowspan > 1) {
    properties['rowSpan'] = node.rowspan
  }
  
  return {
    type: 'element',
    tagName,
    properties,
    children: transformChildren(node.children, options)
  }
}

function transformBBTag(node: BBTag, options: Required<ToHastOptions>): Element {
  // 通用 BBCode 标签处理
  const properties: Properties = {
    className: [`bb-${node.tagName}`]
  }
  
  if (node.attributes && options.preserveDataAttributes) {
    for (const [key, value] of Object.entries(node.attributes)) {
      properties[`data-${key}`] = value
    }
  }
  
  return {
    type: 'element',
    tagName: 'div',
    properties,
    children: transformChildren(node.children, options)
  }
}

// =============================================================================
// Utility functions
// =============================================================================

/**
 * Create a simple text node
 */
export function text(value: string): HastText {
  return {
    type: 'text',
    value
  }
}

/**
 * Create an element node
 */
export function element(
  tagName: string,
  properties: Properties = {},
  children: Element['children'] = []
): Element {
  return {
    type: 'element',
    tagName,
    properties,
    children
  }
}
