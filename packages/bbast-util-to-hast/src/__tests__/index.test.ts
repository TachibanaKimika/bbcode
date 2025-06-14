import { describe, it, expect } from 'vitest'
import type { Root as BBRoot } from '@onachi/bbast'
import { toHast, text, element } from '..'

describe('bbast-util-to-hast', () => {
  describe('basic transformations', () => {
    it('transforms empty root', () => {
      const input: BBRoot = {
        type: 'root',
        children: []
      }

      const result = toHast(input)
      
      expect(result).toEqual({
        type: 'root',
        children: []
      })
    })

    it('transforms simple text', () => {
      const input: BBRoot = {
        type: 'root',
        children: [
          {
            type: 'text',
            value: 'Hello world'
          }
        ]
      }

      const result = toHast(input)
      
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

    it('transforms line break', () => {
      const input: BBRoot = {
        type: 'root',
        children: [
          {
            type: 'break'
          }
        ]
      }

      const result = toHast(input)
      
      expect(result.children[0]).toEqual({
        type: 'element',
        tagName: 'br',
        properties: {},
        children: []
      })
    })

    it('transforms paragraph', () => {
      const input: BBRoot = {
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

      const result = toHast(input)
      
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
      const input: BBRoot = {
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

      const result = toHast(input)
      
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
      const input: BBRoot = {
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

      const result = toHast(input)
      
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
      const input: BBRoot = {
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

      const result = toHast(input)
      
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
      const input: BBRoot = {
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

      const result = toHast(input)
      
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
      const input: BBRoot = {
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

      const result = toHast(input)
      
      expect(result.children[0]).toEqual({
        type: 'element',
        tagName: 'strong',
        properties: {
          className: ['bb-bold']
        },
        children: [
          {
            type: 'element',
            tagName: 'em',
            properties: {
              className: ['bb-italic']
            },
            children: [
              {
                type: 'text',
                value: 'Bold and italic'
              }
            ]
          }
        ]
      })
    })
  })

  describe('code and quotes', () => {
    it('transforms code without language', () => {
      const input: BBRoot = {
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

      const result = toHast(input)
      
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

    it('transforms code with language', () => {
      const input: BBRoot = {
        type: 'root',
        children: [
          {
            type: 'code',
            language: 'javascript',
            children: [
              {
                type: 'text',
                value: 'console.log("hello")'
              }
            ]
          }
        ]
      }

      const result = toHast(input)
      
      expect(result.children[0]).toEqual({
        type: 'element',
        tagName: 'code',
        properties: {
          className: ['bb-code'],
          dataLanguage: 'javascript'
        },
        children: [
          {
            type: 'text',
            value: 'console.log("hello")'
          }
        ]
      })
    })

    it('transforms quote without author', () => {
      const input: BBRoot = {
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

      const result = toHast(input)
      
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

    it('transforms quote with author', () => {
      const input: BBRoot = {
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

      const result = toHast(input)
      
      expect(result.children[0]).toEqual({
        type: 'element',
        tagName: 'blockquote',
        properties: {
          className: ['bb-quote'],
          dataAuthor: 'John Doe'
        },
        children: [
          {
            type: 'text',
            value: 'This is a quote'
          }
        ]
      })
    })
  })

  describe('links and images', () => {
    it('transforms link without title', () => {
      const input: BBRoot = {
        type: 'root',
        children: [
          {
            type: 'link',
            url: 'https://example.com',
            children: [
              {
                type: 'text',
                value: 'Click here'
              }
            ]
          }
        ]
      }

      const result = toHast(input)
      
      expect(result.children[0]).toEqual({
        type: 'element',
        tagName: 'a',
        properties: {
          href: 'https://example.com'
        },
        children: [
          {
            type: 'text',
            value: 'Click here'
          }
        ]
      })
    })

    it('transforms link with title', () => {
      const input: BBRoot = {
        type: 'root',
        children: [
          {
            type: 'link',
            url: 'https://example.com',
            title: 'Example Website',
            children: [
              {
                type: 'text',
                value: 'Click here'
              }
            ]
          }
        ]
      }

      const result = toHast(input)
      
      expect(result.children[0]).toEqual({
        type: 'element',
        tagName: 'a',
        properties: {
          href: 'https://example.com',
          title: 'Example Website'
        },
        children: [
          {
            type: 'text',
            value: 'Click here'
          }
        ]
      })
    })

    it('transforms image with minimal properties', () => {
      const input: BBRoot = {
        type: 'root',
        children: [
          {
            type: 'image',
            url: 'https://example.com/image.jpg'
          }
        ]
      }

      const result = toHast(input)
      
      expect(result.children[0]).toEqual({
        type: 'element',
        tagName: 'img',
        properties: {
          src: 'https://example.com/image.jpg'
        },
        children: []
      })
    })

    it('transforms image with all properties', () => {
      const input: BBRoot = {
        type: 'root',
        children: [
          {
            type: 'image',
            url: 'https://example.com/image.jpg',
            alt: 'Example image',
            title: 'An example',
            width: 300,
            height: 200
          }
        ]
      }

      const result = toHast(input)
      
      expect(result.children[0]).toEqual({
        type: 'element',
        tagName: 'img',
        properties: {
          src: 'https://example.com/image.jpg',
          alt: 'Example image',
          title: 'An example',
          width: 300,
          height: 200
        },
        children: []
      })
    })
  })

  describe('styling', () => {
    it('transforms color', () => {
      const input: BBRoot = {
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

      const result = toHast(input)
      
      expect(result.children[0]).toEqual({
        type: 'element',
        tagName: 'span',
        properties: {
          className: ['bb-color'],
          style: 'color: red'
        },
        children: [
          {
            type: 'text',
            value: 'Red text'
          }
        ]
      })
    })

    it('transforms size with number', () => {
      const input: BBRoot = {
        type: 'root',
        children: [
          {
            type: 'size',
            size: 16,
            children: [
              {
                type: 'text',
                value: 'Sized text'
              }
            ]
          }
        ]
      }

      const result = toHast(input)
      
      expect(result.children[0]).toEqual({
        type: 'element',
        tagName: 'span',
        properties: {
          className: ['bb-size'],
          style: 'font-size: 16px'
        },
        children: [
          {
            type: 'text',
            value: 'Sized text'
          }
        ]
      })
    })

    it('transforms size with string', () => {
      const input: BBRoot = {
        type: 'root',
        children: [
          {
            type: 'size',
            size: '1.5em',
            children: [
              {
                type: 'text',
                value: 'Sized text'
              }
            ]
          }
        ]
      }

      const result = toHast(input)
      
      expect(result.children[0]).toEqual({
        type: 'element',
        tagName: 'span',
        properties: {
          className: ['bb-size'],
          style: 'font-size: 1.5em'
        },
        children: [
          {
            type: 'text',
            value: 'Sized text'
          }
        ]
      })
    })

    it('transforms font', () => {
      const input: BBRoot = {
        type: 'root',
        children: [
          {
            type: 'font',
            family: 'Arial, sans-serif',
            children: [
              {
                type: 'text',
                value: 'Font text'
              }
            ]
          }
        ]
      }

      const result = toHast(input)
      
      expect(result.children[0]).toEqual({
        type: 'element',
        tagName: 'span',
        properties: {
          className: ['bb-font'],
          style: 'font-family: Arial, sans-serif'
        },
        children: [
          {
            type: 'text',
            value: 'Font text'
          }
        ]
      })
    })
  })

  describe('alignment', () => {
    it('transforms center alignment', () => {
      const input: BBRoot = {
        type: 'root',
        children: [
          {
            type: 'center',
            children: [
              {
                type: 'text',
                value: 'Centered text'
              }
            ]
          }
        ]
      }

      const result = toHast(input)
      
      expect(result.children[0]).toEqual({
        type: 'element',
        tagName: 'div',
        properties: {
          className: ['bb-center'],
          style: 'text-align: center'
        },
        children: [
          {
            type: 'text',
            value: 'Centered text'
          }
        ]
      })
    })

    it('transforms left alignment', () => {
      const input: BBRoot = {
        type: 'root',
        children: [
          {
            type: 'left',
            children: [
              {
                type: 'text',
                value: 'Left-aligned text'
              }
            ]
          }
        ]
      }

      const result = toHast(input)
      
      expect(result.children[0]).toEqual({
        type: 'element',
        tagName: 'div',
        properties: {
          className: ['bb-left'],
          style: 'text-align: left'
        },
        children: [
          {
            type: 'text',
            value: 'Left-aligned text'
          }
        ]
      })
    })

    it('transforms right alignment', () => {
      const input: BBRoot = {
        type: 'root',
        children: [
          {
            type: 'right',
            children: [
              {
                type: 'text',
                value: 'Right-aligned text'
              }
            ]
          }
        ]
      }

      const result = toHast(input)
      
      expect(result.children[0]).toEqual({
        type: 'element',
        tagName: 'div',
        properties: {
          className: ['bb-right'],
          style: 'text-align: right'
        },
        children: [
          {
            type: 'text',
            value: 'Right-aligned text'
          }
        ]
      })
    })
  })

  describe('lists', () => {
    it('transforms unordered list', () => {
      const input: BBRoot = {
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
                    value: 'Item 1'
                  }
                ]
              },
              {
                type: 'listItem',
                children: [
                  {
                    type: 'text',
                    value: 'Item 2'
                  }
                ]
              }
            ]
          }
        ]
      }

      const result = toHast(input)
      
      expect(result.children[0]).toEqual({
        type: 'element',
        tagName: 'ul',
        properties: {
          className: ['bb-list']
        },
        children: [
          {
            type: 'element',
            tagName: 'li',
            properties: {},
            children: [
              {
                type: 'text',
                value: 'Item 1'
              }
            ]
          },
          {
            type: 'element',
            tagName: 'li',
            properties: {},
            children: [
              {
                type: 'text',
                value: 'Item 2'
              }
            ]
          }
        ]
      })
    })

    it('transforms ordered list', () => {
      const input: BBRoot = {
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
                    value: 'Item 1'
                  }
                ]
              }
            ]
          }
        ]
      }

      const result = toHast(input)
      
      expect(result.children[0]).toEqual({
        type: 'element',
        tagName: 'ol',
        properties: {
          className: ['bb-list']
        },
        children: [
          {
            type: 'element',
            tagName: 'li',
            properties: {},
            children: [
              {
                type: 'text',
                value: 'Item 1'
              }
            ]
          }
        ]
      })
    })

    it('transforms list with type', () => {
      const input: BBRoot = {
        type: 'root',
        children: [
          {
            type: 'list',
            ordered: false,
            listType: 'disc',
            children: [
              {
                type: 'listItem',
                children: [
                  {
                    type: 'text',
                    value: 'Item 1'
                  }
                ]
              }
            ]
          }
        ]
      }

      const result = toHast(input)
      
      expect(result.children[0]).toEqual({
        type: 'element',
        tagName: 'ul',
        properties: {
          className: ['bb-list'],
          dataListType: 'disc'
        },
        children: [
          {
            type: 'element',
            tagName: 'li',
            properties: {},
            children: [
              {
                type: 'text',
                value: 'Item 1'
              }
            ]
          }
        ]
      })
    })
  })

  describe('tables', () => {
    it('transforms simple table', () => {
      const input: BBRoot = {
        type: 'root',
        children: [
          {
            type: 'table',
            children: [
              {
                type: 'tableRow',
                children: [
                  {
                    type: 'tableCell',
                    header: true,
                    children: [
                      {
                        type: 'text',
                        value: 'Header 1'
                      }
                    ]
                  },
                  {
                    type: 'tableCell',
                    header: true,
                    children: [
                      {
                        type: 'text',
                        value: 'Header 2'
                      }
                    ]
                  }
                ]
              },
              {
                type: 'tableRow',
                children: [
                  {
                    type: 'tableCell',
                    children: [
                      {
                        type: 'text',
                        value: 'Cell 1'
                      }
                    ]
                  },
                  {
                    type: 'tableCell',
                    children: [
                      {
                        type: 'text',
                        value: 'Cell 2'
                      }
                    ]
                  }
                ]
              }
            ]
          }
        ]
      }

      const result = toHast(input)
      
      expect(result.children[0]).toEqual({
        type: 'element',
        tagName: 'table',
        properties: {
          className: ['bb-table']
        },
        children: [
          {
            type: 'element',
            tagName: 'tr',
            properties: {
              className: ['bb-table-row']
            },
            children: [
              {
                type: 'element',
                tagName: 'th',
                properties: {
                  className: ['bb-table-cell']
                },
                children: [
                  {
                    type: 'text',
                    value: 'Header 1'
                  }
                ]
              },
              {
                type: 'element',
                tagName: 'th',
                properties: {
                  className: ['bb-table-cell']
                },
                children: [
                  {
                    type: 'text',
                    value: 'Header 2'
                  }
                ]
              }
            ]
          },
          {
            type: 'element',
            tagName: 'tr',
            properties: {
              className: ['bb-table-row']
            },
            children: [
              {
                type: 'element',
                tagName: 'td',
                properties: {
                  className: ['bb-table-cell']
                },
                children: [
                  {
                    type: 'text',
                    value: 'Cell 1'
                  }
                ]
              },
              {
                type: 'element',
                tagName: 'td',
                properties: {
                  className: ['bb-table-cell']
                },
                children: [
                  {
                    type: 'text',
                    value: 'Cell 2'
                  }
                ]
              }
            ]
          }
        ]
      })
    })

    it('transforms table cell with colspan and rowspan', () => {
      const input: BBRoot = {
        type: 'root',
        children: [
          {
            type: 'table',
            children: [
              {
                type: 'tableRow',
                children: [
                  {
                    type: 'tableCell',
                    colspan: 2,
                    rowspan: 3,
                    children: [
                      {
                        type: 'text',
                        value: 'Spanning cell'
                      }
                    ]
                  }
                ]
              }
            ]
          }
        ]
      }

      const result = toHast(input)
      
      const cell = (result.children[0] as any).children[0].children[0]
      expect(cell.properties).toEqual({
        className: ['bb-table-cell'],
        colSpan: 2,
        rowSpan: 3
      })
    })
  })

  describe('custom BBCode tags', () => {
    it('transforms generic bbtag', () => {
      const input: BBRoot = {
        type: 'root',
        children: [
          {
            type: 'bbtag',
            tagName: 'custom',
            attributes: {
              attr1: 'value1',
              attr2: 'value2'
            },
            children: [
              {
                type: 'text',
                value: 'Custom content'
              }
            ]
          }
        ]
      }

      const result = toHast(input)
      
      expect(result.children[0]).toEqual({
        type: 'element',
        tagName: 'div',
        properties: {
          className: ['bb-custom'],
          'data-attr1': 'value1',
          'data-attr2': 'value2'
        },
        children: [
          {
            type: 'text',
            value: 'Custom content'
          }
        ]
      })
    })

    it('transforms bbtag without attributes', () => {
      const input: BBRoot = {
        type: 'root',
        children: [
          {
            type: 'bbtag',
            tagName: 'simple',
            children: [
              {
                type: 'text',
                value: 'Simple content'
              }
            ]
          }
        ]
      }

      const result = toHast(input)
      
      expect(result.children[0]).toEqual({
        type: 'element',
        tagName: 'div',
        properties: {
          className: ['bb-simple']
        },
        children: [
          {
            type: 'text',
            value: 'Simple content'
          }
        ]
      })
    })
  })

  describe('options', () => {
    it('uses custom element mappings', () => {
      const input: BBRoot = {
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

      const result = toHast(input, {
        elementMappings: {
          bold: 'b'
        }
      })
      
      expect(result.children[0]).toEqual({
        type: 'element',
        tagName: 'b',
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

    it('uses custom class names', () => {
      const input: BBRoot = {
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

      const result = toHast(input, {
        classNames: {
          bold: 'custom-bold'
        }
      })
      
      expect(result.children[0]).toEqual({
        type: 'element',
        tagName: 'strong',
        properties: {
          className: ['custom-bold']
        },
        children: [
          {
            type: 'text',
            value: 'Bold text'
          }
        ]
      })
    })

    it('uses default image attributes', () => {
      const input: BBRoot = {
        type: 'root',
        children: [
          {
            type: 'image',
            url: 'https://example.com/image.jpg'
          }
        ]
      }

      const result = toHast(input, {
        defaultImageAttributes: {
          loading: 'lazy',
          decoding: 'async'
        }
      })
      
      expect(result.children[0]).toEqual({
        type: 'element',
        tagName: 'img',
        properties: {
          src: 'https://example.com/image.jpg',
          loading: 'lazy',
          decoding: 'async'
        },
        children: []
      })
    })

    it('respects preserveDataAttributes option', () => {
      const input: BBRoot = {
        type: 'root',
        children: [
          {
            type: 'bbtag',
            tagName: 'custom',
            attributes: {
              attr1: 'value1'
            },
            children: [
              {
                type: 'text',
                value: 'Content'
              }
            ]
          }
        ]
      }

      const result = toHast(input, {
        preserveDataAttributes: false
      })
      
      expect(result.children[0]).toEqual({
        type: 'element',
        tagName: 'div',
        properties: {
          className: ['bb-custom']
        },
        children: [
          {
            type: 'text',
            value: 'Content'
          }
        ]
      })
    })
  })

  describe('utility functions', () => {
    it('creates text nodes', () => {
      const textNode = text('Hello world')
      
      expect(textNode).toEqual({
        type: 'text',
        value: 'Hello world'
      })
    })

    it('creates element nodes', () => {
      const elementNode = element('div', { className: ['test'] }, [
        text('Hello')
      ])
      
      expect(elementNode).toEqual({
        type: 'element',
        tagName: 'div',
        properties: { className: ['test'] },
        children: [
          {
            type: 'text',
            value: 'Hello'
          }
        ]
      })
    })

    it('creates element nodes with defaults', () => {
      const elementNode = element('span')
      
      expect(elementNode).toEqual({
        type: 'element',
        tagName: 'span',
        properties: {},
        children: []
      })
    })
  })

  describe('edge cases', () => {
    it('handles unknown node types gracefully', () => {
      const input: BBRoot = {
        type: 'root',
        children: [
          {
            type: 'unknown' as any,
            value: 'unknown content'
          }
        ]
      }

      const result = toHast(input)
      
      expect(result).toEqual({
        type: 'root',
        children: []
      })
    })

    it('handles empty children arrays', () => {
      const input: BBRoot = {
        type: 'root',
        children: [
          {
            type: 'bold',
            children: []
          }
        ]
      }

      const result = toHast(input)
      
      expect(result.children[0]).toEqual({
        type: 'element',
        tagName: 'strong',
        properties: {
          className: ['bb-bold']
        },
        children: []
      })
    })

    it('handles deeply nested structures', () => {
      const input: BBRoot = {
        type: 'root',
        children: [
          {
            type: 'bold',
            children: [
              {
                type: 'italic',
                children: [
                  {
                    type: 'underline',
                    children: [
                      {
                        type: 'text',
                        value: 'Deeply nested'
                      }
                    ]
                  }
                ]
              }
            ]
          }
        ]
      }

      const result = toHast(input)
      
      // Just check that it transforms without error and has the expected structure
      expect(result.children).toHaveLength(1)
      expect((result.children[0] as any).tagName).toBe('strong')
      expect((result.children[0] as any).children).toHaveLength(1)
      expect((result.children[0] as any).children[0].tagName).toBe('em')
    })
  })
})
