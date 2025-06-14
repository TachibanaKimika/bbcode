/**
 * @fileoverview BBCode Abstract Syntax Tree types based on unist
 */

import type { Node, Parent, Literal, Data } from 'unist'

// =============================================================================
// Base Types
// =============================================================================

/**
 * BBCode AST node base interface
 */
export interface BBNode extends Node {
  type: string
  data?: BBData | undefined
}

/**
 * BBCode data interface extending unist Data
 */
export interface BBData extends Data {
  [key: string]: unknown
}

/**
 * BBCode parent node interface
 */
export interface BBParent extends Parent {
  type: string
  children: BBContent[]
  data?: BBData | undefined
}

/**
 * BBCode literal node interface
 */
export interface BBLiteral extends Literal {
  type: string
  value: string
  data?: BBData | undefined
}

// =============================================================================
// Specific Node Types
// =============================================================================

/**
 * Root node containing the entire BBCode document
 */
export interface Root extends BBParent {
  type: 'root'
  children: BBContent[]
}

/**
 * Text node containing plain text content
 */
export interface Text extends BBLiteral {
  type: 'text'
  value: string
}

/**
 * BBCode tag node (e.g., [b], [url=...], etc.)
 */
export interface BBTag extends BBParent {
  type: 'bbtag'
  tagName: string
  attributes?: Record<string, string | boolean> | undefined
  children: BBContent[]
}

/**
 * Self-closing BBCode tag (e.g., [img]url[/img] or [br/])
 */
export interface BBSelfClosingTag extends BBNode {
  type: 'bbselftag'
  tagName: string
  attributes?: Record<string, string | boolean> | undefined
  value?: string | undefined
}

/**
 * Line break node
 */
export interface LineBreak extends BBNode {
  type: 'break'
}

/**
 * Paragraph node
 */
export interface Paragraph extends BBParent {
  type: 'paragraph'
  children: BBContent[]
}

// =============================================================================
// Common BBCode Tags
// =============================================================================

/**
 * Bold text tag [b]
 */
export interface Bold extends BBParent {
  type: 'bold'
  children: BBContent[]
}

/**
 * Italic text tag [i]
 */
export interface Italic extends BBParent {
  type: 'italic'
  children: BBContent[]
}

/**
 * Underline text tag [u]
 */
export interface Underline extends BBParent {
  type: 'underline'
  children: BBContent[]
}

/**
 * Strikethrough text tag [s]
 */
export interface Strikethrough extends BBParent {
  type: 'strikethrough'
  children: BBContent[]
}

/**
 * Code text tag [code]
 */
export interface Code extends BBParent {
  type: 'code'
  language?: string | undefined
  children: BBContent[]
}

/**
 * Quote block tag [quote]
 */
export interface Quote extends BBParent {
  type: 'quote'
  author?: string | undefined
  children: BBContent[]
}

/**
 * URL/Link tag [url]
 */
export interface Link extends BBParent {
  type: 'link'
  url: string
  title?: string | undefined
  children: BBContent[]
}

/**
 * Image tag [img]
 */
export interface Image extends BBNode {
  type: 'image'
  url: string
  alt?: string | undefined
  title?: string | undefined
  width?: number | string | undefined
  height?: number | string | undefined
}

/**
 * Color text tag [color]
 */
export interface Color extends BBParent {
  type: 'color'
  color: string
  children: BBContent[]
}

/**
 * Size text tag [size]
 */
export interface Size extends BBParent {
  type: 'size'
  size: string | number
  children: BBContent[]
}

/**
 * Font family tag [font]
 */
export interface Font extends BBParent {
  type: 'font'
  family: string
  children: BBContent[]
}

/**
 * Center alignment tag [center]
 */
export interface Center extends BBParent {
  type: 'center'
  children: BBContent[]
}

/**
 * Left alignment tag [left]
 */
export interface Left extends BBParent {
  type: 'left'
  children: BBContent[]
}

/**
 * Right alignment tag [right]
 */
export interface Right extends BBParent {
  type: 'right'
  children: BBContent[]
}

/**
 * List tag [list]
 */
export interface List extends BBParent {
  type: 'list'
  ordered?: boolean | undefined
  listType?: string | undefined
  children: ListItem[]
}

/**
 * List item tag [*] or [li]
 */
export interface ListItem extends BBParent {
  type: 'listItem'
  children: BBContent[]
}

/**
 * Table tag [table]
 */
export interface Table extends BBParent {
  type: 'table'
  children: TableRow[]
}

/**
 * Table row tag [tr]
 */
export interface TableRow extends BBParent {
  type: 'tableRow'
  children: TableCell[]
}

/**
 * Table cell tag [td] or [th]
 */
export interface TableCell extends BBParent {
  type: 'tableCell'
  header?: boolean | undefined
  colspan?: number | undefined
  rowspan?: number | undefined
  children: BBContent[]
}

// =============================================================================
// Union Types
// =============================================================================

/**
 * Union of all possible BBCode node types
 */
export type BBContent = 
  | Root
  | Text
  | BBTag
  | BBSelfClosingTag
  | LineBreak
  | Paragraph
  | Bold
  | Italic
  | Underline
  | Strikethrough
  | Code
  | Quote
  | Link
  | Image
  | Color
  | Size
  | Font
  | Center
  | Left
  | Right
  | List
  | ListItem
  | Table
  | TableRow
  | TableCell

/**
 * Union of all parent node types
 */
export type BBParentContent = 
  | Root
  | BBTag
  | Paragraph
  | Bold
  | Italic
  | Underline
  | Strikethrough
  | Code
  | Quote
  | Link
  | Color
  | Size
  | Font
  | Center
  | Left
  | Right
  | List
  | ListItem
  | Table
  | TableRow
  | TableCell

/**
 * Union of all literal/leaf node types
 */
export type BBLeafContent =
  | Text
  | BBSelfClosingTag
  | LineBreak
  | Image

// =============================================================================
// Utility Types
// =============================================================================

/**
 * Extract nodes by type
 */
export type NodeByType<T extends BBContent['type']> = Extract<BBContent, { type: T }>

/**
 * Check if a node is a parent node
 */
export function isParent(node: BBContent): node is BBParentContent {
  return 'children' in node && Array.isArray(node.children)
}

/**
 * Check if a node is a leaf/literal node
 */
export function isLeaf(node: BBContent): node is BBLeafContent {
  return !isParent(node)
}

/**
 * Check if a node has a specific type
 */
export function isType<T extends BBContent['type']>(
  node: BBContent,
  type: T
): node is NodeByType<T> {
  return node.type === type
}

/**
 * Type guard for text nodes
 */
export function isText(node: BBContent): node is Text {
  return node.type === 'text'
}

/**
 * Type guard for BBTag nodes
 */
export function isBBTag(node: BBContent): node is BBTag {
  return node.type === 'bbtag'
}

/**
 * Type guard for root nodes
 */
export function isRoot(node: BBContent): node is Root {
  return node.type === 'root'
}
