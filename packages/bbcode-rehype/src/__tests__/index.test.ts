import { describe, it, expect } from 'vitest'
import { unified } from 'unified'
import { fromBBCode } from '@onachi/bbast-util-from-bbcode'
import bbcodeRehype from '..'
import type { Root as BBRoot } from '@onachi/bbast'
import type { Root as HastRoot, Element } from 'hast'

describe('bbcode-rehype', () => {
  const processor = unified().use(bbcodeRehype)

  describe('plugin integration', () => {
    it('should be a valid unified plugin', () => {
      expect(typeof bbcodeRehype).toBe('function')
      expect(bbcodeRehype.length).toBe(1) // accepts ToHastOptions
    })

    it('should transform bbast to hast through processor', () => {
      const bbast: BBRoot = {
        type: 'root',
        children: [
          {
            type: 'text',
            value: 'Hello world'
          }
        ]
      }

      const result = processor.runSync(bbast) as HastRoot
      
      expect(result).toEqual({
        type: 'root',
        children: [
          {
            type: 'text',
            value: 'Hello world'
          }
        ]
      })
    })
  })

  describe('basic transformations', () => {
    it('transforms empty root', () => {
      const bbast: BBRoot = {
        type: 'root',
        children: []
      }

      const result = processor.runSync(bbast) as HastRoot
      
      expect(result).toEqual({
        type: 'root',
        children: []
      })
    })

    it('transforms simple text', () => {
      const bbast: BBRoot = {
        type: 'root',
        children: [
          {
            type: 'text',
            value: 'Hello world'
          }
        ]
      }

      const result = processor.runSync(bbast) as HastRoot
      
      expect(result).toEqual({
        type: 'root',
        children: [
          {
            type: 'text',
            value: 'Hello world'
          }
        ]
      })
    })

    it('transforms line breaks', () => {
      const bbast: BBRoot = {
        type: 'root',
        children: [
          {
            type: 'text',
            value: 'Line 1'
          },
          {
            type: 'break'
          },
          {
            type: 'text',
            value: 'Line 2'
          }
        ]
      }

      const result = processor.runSync(bbast) as HastRoot
      
      expect(result.children[1]).toEqual({
        type: 'element',
        tagName: 'br',
        properties: {},
        children: []
      })
    })

    it('transforms paragraphs', () => {
      const bbast: BBRoot = {
        type: 'root',
        children: [
          {
            type: 'paragraph',
            children: [
              {
                type: 'text',
                value: 'A paragraph'
              }
            ]
          }
        ]
      }

      const result = processor.runSync(bbast) as HastRoot
      
      expect(result.children[0]).toEqual({
        type: 'element',
        tagName: 'p',
        properties: {},
        children: [
          {
            type: 'text',
            value: 'A paragraph'
          }
        ]
      })
    })
  })

  describe('text formatting', () => {
    it('transforms bold text', () => {
      const bbast: BBRoot = {
        type: 'root',
        children: [
          {
            type: 'bold',
            children: [
              {
                type: 'text',
                value: 'Bold text'
              }
            ]
          }
        ]
      }

      const result = processor.runSync(bbast) as HastRoot
      
      expect(result.children[0]).toEqual({
        type: 'element',
        tagName: 'strong',
        properties: {
          className: ['bb-bold']
        },
        children: [
          {
            type: 'text',
            value: 'Bold text'
          }
        ]
      })
    })

    it('transforms italic text', () => {
      const bbast: BBRoot = {
        type: 'root',
        children: [
          {
            type: 'italic',
            children: [
              {
                type: 'text',
                value: 'Italic text'
              }
            ]
          }
        ]
      }

      const result = processor.runSync(bbast) as HastRoot
      
      expect(result.children[0]).toEqual({
        type: 'element',
        tagName: 'em',
        properties: {
          className: ['bb-italic']
        },
        children: [
          {
            type: 'text',
            value: 'Italic text'
          }
        ]
      })
    })

    it('transforms underlined text', () => {
      const bbast: BBRoot = {
        type: 'root',
        children: [
          {
            type: 'underline',
            children: [
              {
                type: 'text',
                value: 'Underlined text'
              }
            ]
          }
        ]
      }

      const result = processor.runSync(bbast) as HastRoot
      
      expect(result.children[0]).toEqual({
        type: 'element',
        tagName: 'u',
        properties: {
          className: ['bb-underline']
        },
        children: [
          {
            type: 'text',
            value: 'Underlined text'
          }
        ]
      })
    })

    it('transforms strikethrough text', () => {
      const bbast: BBRoot = {
        type: 'root',
        children: [
          {
            type: 'strikethrough',
            children: [
              {
                type: 'text',
                value: 'Strikethrough text'
              }
            ]
          }
        ]
      }

      const result = processor.runSync(bbast) as HastRoot
      
      expect(result.children[0]).toEqual({
        type: 'element',
        tagName: 's',
        properties: {
          className: ['bb-strikethrough']
        },
        children: [
          {
            type: 'text',
            value: 'Strikethrough text'
          }
        ]
      })
    })

    it('transforms nested formatting', () => {
      const bbast: BBRoot = {
        type: 'root',
        children: [
          {
            type: 'bold',
            children: [
              {
                type: 'italic',
                children: [
                  {
                    type: 'text',
                    value: 'Bold and italic'
                  }
                ]
              }
            ]
          }
        ]
      }

      const result = processor.runSync(bbast) as HastRoot
      const element = result.children[0] as Element
      
      expect(element.tagName).toBe('strong')
      expect(element.properties?.className).toEqual(['bb-bold'])
      
      const nestedElement = element.children[0] as Element
      expect(nestedElement.tagName).toBe('em')
      expect(nestedElement.properties?.className).toEqual(['bb-italic'])
      expect(nestedElement.children[0]).toEqual({
        type: 'text',
        value: 'Bold and italic'
      })
    })
  })

  describe('links and media', () => {
    it('transforms simple URLs', () => {
      const bbast: BBRoot = {
        type: 'root',
        children: [
          {
            type: 'link',
            url: 'https://example.com',
            children: [
              {
                type: 'text',
                value: 'Example'
              }
            ]
          }
        ]
      }

      const result = processor.runSync(bbast) as HastRoot
      
      expect(result.children[0]).toEqual({
        type: 'element',
        tagName: 'a',
        properties: {
          href: 'https://example.com',
        },
        children: [
          {
            type: 'text',
            value: 'Example'
          }
        ]
      })
    })

    it('transforms images', () => {
      const bbast: BBRoot = {
        type: 'root',
        children: [
          {
            type: 'image',
            url: 'https://example.com/image.jpg',
            alt: 'Example image'
          }
        ]
      }

      const result = processor.runSync(bbast) as HastRoot
      
      expect(result.children[0]).toEqual({
        type: 'element',
        tagName: 'img',
        properties: {
          src: 'https://example.com/image.jpg',
          alt: 'Example image',
        },
        children: []
      })
    })

    it('transforms images without alt text', () => {
      const bbast: BBRoot = {
        type: 'root',
        children: [
          {
            type: 'image',
            url: 'https://example.com/image.jpg'
          }
        ]
      }

      const result = processor.runSync(bbast) as HastRoot
      
      expect(result.children[0]).toEqual({
        type: 'element',
        tagName: 'img',
        properties: {
          src: 'https://example.com/image.jpg',
        },
        children: []
      })
    })
  })

  describe('lists', () => {
    it('transforms unordered lists', () => {
      const bbast: BBRoot = {
        type: 'root',
        children: [
          {
            type: 'list',
            ordered: false,
            children: [
              {
                type: 'listItem',
                children: [
                  {
                    type: 'text',
                    value: 'First item'
                  }
                ]
              },
              {
                type: 'listItem',
                children: [
                  {
                    type: 'text',
                    value: 'Second item'
                  }
                ]
              }
            ]
          }
        ]
      }

      const result = processor.runSync(bbast) as HastRoot
      const listElement = result.children[0] as Element
      
      expect(listElement.tagName).toBe('ul')
      expect(listElement.properties?.className).toEqual(['bb-list'])
      expect(listElement.children).toHaveLength(2)
      
      const firstItem = listElement.children[0] as Element
      expect(firstItem.tagName).toBe('li')
    })

    it('transforms ordered lists', () => {
      const bbast: BBRoot = {
        type: 'root',
        children: [
          {
            type: 'list',
            ordered: true,
            children: [
              {
                type: 'listItem',
                children: [
                  {
                    type: 'text',
                    value: 'First item'
                  }
                ]
              }
            ]
          }
        ]
      }

      const result = processor.runSync(bbast) as HastRoot
      const listElement = result.children[0] as Element
      
      expect(listElement.tagName).toBe('ol')
      expect(listElement.properties?.className).toEqual(['bb-list'])
    })
  })

  describe('text styling', () => {
    it('transforms colored text', () => {
      const bbast: BBRoot = {
        type: 'root',
        children: [
          {
            type: 'color',
            color: 'red',
            children: [
              {
                type: 'text',
                value: 'Red text'
              }
            ]
          }
        ]
      }

      const result = processor.runSync(bbast) as HastRoot
      
      expect(result.children[0]).toEqual({
        type: 'element',
        tagName: 'span',
        properties: {
          style: 'color: red',
          className: ['bb-color']
        },
        children: [
          {
            type: 'text',
            value: 'Red text'
          }
        ]
      })
    })

    it('transforms sized text', () => {
      const bbast: BBRoot = {
        type: 'root',
        children: [
          {
            type: 'size',
            size: 14,
            children: [
              {
                type: 'text',
                value: 'Sized text'
              }
            ]
          }
        ]
      }

      const result = processor.runSync(bbast) as HastRoot
      
      expect(result.children[0]).toEqual({
        type: 'element',
        tagName: 'span',
        properties: {
          style: 'font-size: 14px',
          className: ['bb-size']
        },
        children: [
          {
            type: 'text',
            value: 'Sized text'
          }
        ]
      })
    })
  })

  describe('code and quotes', () => {
    it('transforms inline code', () => {
      const bbast: BBRoot = {
        type: 'root',
        children: [
          {
            type: 'code',
            children: [
              {
                type: 'text',
                value: 'console.log("hello")'
              }
            ]
          }
        ]
      }

      const result = processor.runSync(bbast) as HastRoot
      
      expect(result.children[0]).toEqual({
        type: 'element',
        tagName: 'code',
        properties: {
          className: ['bb-code']
        },
        children: [
          {
            type: 'text',
            value: 'console.log("hello")'
          }
        ]
      })
    })

    it('transforms quotes', () => {
      const bbast: BBRoot = {
        type: 'root',
        children: [
          {
            type: 'quote',
            children: [
              {
                type: 'text',
                value: 'This is a quote'
              }
            ]
          }
        ]
      }

      const result = processor.runSync(bbast) as HastRoot
      
      expect(result.children[0]).toEqual({
        type: 'element',
        tagName: 'blockquote',
        properties: {
          className: ['bb-quote']
        },
        children: [
          {
            type: 'text',
            value: 'This is a quote'
          }
        ]
      })
    })

    it('transforms quotes with attribution', () => {
      const bbast: BBRoot = {
        type: 'root',
        children: [
          {
            type: 'quote',
            author: 'John Doe',
            children: [
              {
                type: 'text',
                value: 'This is a quote'
              }
            ]
          }
        ]
      }

      const result = processor.runSync(bbast) as HastRoot
      const quoteElement = result.children[0] as Element
      
      expect(quoteElement.tagName).toBe('blockquote')
      expect(quoteElement.properties?.className).toEqual(['bb-quote'])
      expect(quoteElement.properties?.dataAuthor).toBe('John Doe')
    })
  })

  describe('integration with bbast-util-from-bbcode', () => {
    it('works with parsed BBCode', () => {
      const bbcodeText = '[b]Bold[/b] and [i]italic[/i] text'
      const bbast = fromBBCode(bbcodeText, { paragraphs: false })
      
      const result = processor.runSync(bbast) as HastRoot
      
      expect(result.children).toHaveLength(4)
      
      const boldElement = result.children[0] as Element
      expect(boldElement.tagName).toBe('strong')
      expect(boldElement.properties?.className).toEqual(['bb-bold'])
      
      const textNode = result.children[1]
      expect(textNode.type).toBe('text')
      expect(textNode.value).toBe(' and ')
      
      const italicElement = result.children[2] as Element
      expect(italicElement.tagName).toBe('em')
      expect(italicElement.properties?.className).toEqual(['bb-italic'])
    })

    it('works with complex BBCode structures', () => {
      const bbcodeText = `[quote=Author]
[b]Important:[/b] This is a [color=red]red[/color] warning.
[list]
[*]Item 1
[*]Item 2
[/list]
[/quote]`
      
      const bbast = fromBBCode(bbcodeText, { paragraphs: false })
      const result = processor.runSync(bbast) as HastRoot
      
      // Should contain the quote block
      const hasQuote = result.children.some(child => 
        child.type === 'element' && (child as Element).tagName === 'blockquote'
      )
      expect(hasQuote).toBe(true)
    })

    it('works with nested formatting', () => {
      const bbcodeText = '[b][i][u]Triple nested[/u][/i][/b]'
      const bbast = fromBBCode(bbcodeText, { paragraphs: false })
      
      const result = processor.runSync(bbast) as HastRoot
      
      const boldElement = result.children[0] as Element
      expect(boldElement.tagName).toBe('strong')
      
      const italicElement = boldElement.children[0] as Element
      expect(italicElement.tagName).toBe('em')
      
      const underlineElement = italicElement.children[0] as Element
      expect(underlineElement.tagName).toBe('u')
      
      expect(underlineElement.children[0]).toEqual({
        type: 'text',
        value: 'Triple nested'
      })
    })

    it('works with URL links', () => {
      const bbcodeText = '[url=https://example.com]Click here[/url]'
      const bbast = fromBBCode(bbcodeText, { paragraphs: false })
      
      const result = processor.runSync(bbast) as HastRoot
      
      const linkElement = result.children[0] as Element
      expect(linkElement.tagName).toBe('a')
      expect(linkElement.properties?.href).toBe('https://example.com')
      expect(linkElement.children[0]).toEqual({
        type: 'text',
        value: 'Click here'
      })
    })
  })

  describe('error handling', () => {
    it('handles unknown node types gracefully', () => {
      const bbast: BBRoot = {
        type: 'root',
        children: [
          {
            type: 'unknown' as any,
            value: 'Unknown content'
          }
        ]
      }

      expect(() => {
        processor.runSync(bbast)
      }).not.toThrow()
    })

    it('handles empty children arrays', () => {
      const bbast: BBRoot = {
        type: 'root',
        children: [
          {
            type: 'bold',
            children: []
          }
        ]
      }

      const result = processor.runSync(bbast) as HastRoot
      
      expect(result.children[0]).toEqual({
        type: 'element',
        tagName: 'strong',
        properties: {
          className: ['bb-bold']
        },
        children: []
      })
    })

    it('handles malformed AST gracefully', () => {
      const bbast: BBRoot = {
        type: 'root',
        children: [
          {
            type: 'text'
            // missing value property
          } as any
        ]
      }

      expect(() => {
        processor.runSync(bbast)
      }).not.toThrow()
    })
  })
})