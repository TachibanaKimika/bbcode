import { describe, it, expect } from 'vitest'
import { 
  isParent, 
  isLeaf, 
  isText, 
  isBBTag, 
  isRoot, 
  isType,
  type Root,
  type Text,
  type Bold,
  type BBContent,
  type BBTag
} from '..'

describe('bbast types and utilities', () => {
  const textNode: Text = {
    type: 'text',
    value: 'Hello World'
  }

  const boldNode: Bold = {
    type: 'bold',
    children: [textNode]
  }

  const rootNode: Root = {
    type: 'root',
    children: [boldNode]
  }

  describe('type guards', () => {
    it('should identify text nodes', () => {
      expect(isText(textNode)).toBe(true)
      expect(isText(boldNode)).toBe(false)
      expect(isText(rootNode)).toBe(false)
    })

    it('should identify parent nodes', () => {
      expect(isParent(textNode)).toBe(false)
      expect(isParent(boldNode)).toBe(true)
      expect(isParent(rootNode)).toBe(true)
    })

    it('should identify leaf nodes', () => {
      expect(isLeaf(textNode)).toBe(true)
      expect(isLeaf(boldNode)).toBe(false)
      expect(isLeaf(rootNode)).toBe(false)
    })

    it('should identify root nodes', () => {
      expect(isRoot(textNode)).toBe(false)
      expect(isRoot(boldNode)).toBe(false)
      expect(isRoot(rootNode)).toBe(true)
    })

    it('should identify BBTag nodes', () => {
      const bbtagNode: BBTag = {
        type: 'bbtag',
        tagName: 'custom',
        children: []
      }
      
      expect(isBBTag(textNode)).toBe(false)
      expect(isBBTag(boldNode)).toBe(false)
      expect(isBBTag(bbtagNode)).toBe(true)
    })

    it('should identify nodes by type', () => {
      expect(isType(textNode, 'text')).toBe(true)
      expect(isType(textNode, 'bold')).toBe(false)
      expect(isType(boldNode, 'bold')).toBe(true)
      expect(isType(boldNode, 'text')).toBe(false)
      expect(isType(rootNode, 'root')).toBe(true)
    })
  })

  describe('AST structure', () => {
    it('should create valid AST structure', () => {
      expect(rootNode.type).toBe('root')
      expect(rootNode.children).toHaveLength(1)
      expect(rootNode.children[0]).toBe(boldNode)
      
      expect(boldNode.type).toBe('bold')
      expect(boldNode.children).toHaveLength(1)
      expect(boldNode.children[0]).toBe(textNode)
      
      expect(textNode.type).toBe('text')
      expect(textNode.value).toBe('Hello World')
    })

    it('should support complex nested structures', () => {
      const complexNode: Root = {
        type: 'root',
        children: [
          {
            type: 'paragraph',
            children: [
              {
                type: 'text',
                value: 'This is '
              },
              {
                type: 'bold',
                children: [
                  {
                    type: 'text',
                    value: 'bold'
                  }
                ]
              },
              {
                type: 'text',
                value: ' and '
              },
              {
                type: 'italic',
                children: [
                  {
                    type: 'text',
                    value: 'italic'
                  }
                ]
              },
              {
                type: 'text',
                value: ' text.'
              }
            ]
          }
        ]
      }

      expect(complexNode.children).toHaveLength(1)
      expect(isParent(complexNode.children[0]!)).toBe(true)
      
      const paragraph = complexNode.children[0]!
      if (isParent(paragraph)) {
        expect(paragraph.children).toHaveLength(5)
        expect(isText(paragraph.children[0]!)).toBe(true)
        expect(isType(paragraph.children[1]!, 'bold')).toBe(true)
        expect(isType(paragraph.children[3]!, 'italic')).toBe(true)
      }
    })
  })
})
