import { describe, it, expect } from 'vitest'
import { fromBBCode, tokenize, type ParseOptions } from '..'

describe('bbast-util-from-bbcode', () => {
  describe('tokenize', () => {
    it('should tokenize simple text', () => {
      const tokens = tokenize('Hello World')
      expect(tokens).toEqual([
        {
          type: 'text',
          value: 'Hello World',
          position: { start: 0, end: 11 },
          sourcePosition: {
            start: { line: 1, column: 1, offset: 0 },
            end: { line: 1, column: 12, offset: 11 }
          }
        }
      ])
    })

    it('should tokenize simple tags', () => {
      const tokens = tokenize('[b]bold[/b]')
      expect(tokens).toEqual([
        {
          type: 'open_tag',
          value: '[b]',
          tagName: 'b',
          attributes: {},
          position: { start: 0, end: 3 },
          sourcePosition: {
            start: { line: 1, column: 1, offset: 0 },
            end: { line: 1, column: 4, offset: 3 }
          }
        },
        {
          type: 'text',
          value: 'bold',
          position: { start: 3, end: 7 },
          sourcePosition: {
            start: { line: 1, column: 4, offset: 3 },
            end: { line: 1, column: 8, offset: 7 }
          }
        },
        {
          type: 'close_tag',
          value: '[/b]',
          tagName: 'b',
          position: { start: 7, end: 11 },
          sourcePosition: {
            start: { line: 1, column: 8, offset: 7 },
            end: { line: 1, column: 12, offset: 11 }
          }
        }
      ])
    })

    it('should tokenize tags with attributes', () => {
      const tokens = tokenize('[url=http://example.com]link[/url]')
      expect(tokens).toHaveLength(3)
      expect(tokens[0]?.type).toBe('open_tag')
      expect(tokens[0]?.tagName).toBe('url')
      expect(tokens[0]?.attributes).toEqual({ url: 'http://example.com' })
    })

    it('should handle invalid tags as text', () => {
      const tokens = tokenize('[invalid tag')
      expect(tokens).toEqual([
        {
          type: 'text',
          value: '[',
          position: { start: 0, end: 1 },
          sourcePosition: {
            start: { line: 1, column: 1, offset: 0 },
            end: { line: 1, column: 2, offset: 1 }
          }
        },
        {
          type: 'text',
          value: 'invalid tag',
          position: { start: 1, end: 12 },
          sourcePosition: {
            start: { line: 1, column: 2, offset: 1 },
            end: { line: 1, column: 13, offset: 12 }
          }
        }
      ])
    })

    describe('position information', () => {
      it('should include position information in tokens', () => {
        const tokens = tokenize('[b]text[/b]')
        
        expect(tokens[0]?.sourcePosition).toBeDefined()
        expect(tokens[0]?.sourcePosition?.start).toEqual({ line: 1, column: 1, offset: 0 })
        expect(tokens[0]?.sourcePosition?.end).toEqual({ line: 1, column: 4, offset: 3 })
        
        expect(tokens[1]?.sourcePosition).toBeDefined()
        expect(tokens[1]?.sourcePosition?.start).toEqual({ line: 1, column: 4, offset: 3 })
        expect(tokens[1]?.sourcePosition?.end).toEqual({ line: 1, column: 8, offset: 7 })
        
        expect(tokens[2]?.sourcePosition).toBeDefined()
        expect(tokens[2]?.sourcePosition?.start).toEqual({ line: 1, column: 8, offset: 7 })
        expect(tokens[2]?.sourcePosition?.end).toEqual({ line: 1, column: 12, offset: 11 })
      })

      it('should include position information in AST nodes', () => {
        const ast = fromBBCode('[b]bold text[/b]', { paragraphs: false })
        
        // Root should have position
        expect(ast.position).toBeDefined()
        expect(ast.position?.start).toEqual({ line: 1, column: 1, offset: 0 })
        expect(ast.position?.end).toEqual({ line: 1, column: 17, offset: 16 })
        
        // Bold node should have position
        const boldNode = ast.children[0]
        expect(boldNode?.position).toBeDefined()
        expect(boldNode?.position?.start).toEqual({ line: 1, column: 1, offset: 0 })
        expect(boldNode?.position?.end).toEqual({ line: 1, column: 17, offset: 16 })
        
        // Text node should have position
        if (boldNode && 'children' in boldNode) {
          const textNode = boldNode.children[0]
          expect(textNode?.position).toBeDefined()
          expect(textNode?.position?.start).toEqual({ line: 1, column: 4, offset: 3 })
          expect(textNode?.position?.end).toEqual({ line: 1, column: 13, offset: 12 })
        }
      })

      it('should handle multiline content correctly', () => {
        const multilineInput = `[b]line1
line2[/b]`
        const ast = fromBBCode(multilineInput, { paragraphs: false })
        
        expect(ast.position?.start).toEqual({ line: 1, column: 1, offset: 0 })
        expect(ast.position?.end).toEqual({ line: 2, column: 10, offset: 18 })
        
        const boldNode = ast.children[0]
        if (boldNode && 'children' in boldNode) {
          const textNode = boldNode.children[0]
          expect(textNode?.position?.start).toEqual({ line: 1, column: 4, offset: 3 })
          expect(textNode?.position?.end).toEqual({ line: 2, column: 6, offset: 14 })
        }
      })

      it('should handle nested tags with correct positions', () => {
        const ast = fromBBCode('[b][i]nested[/i][/b]', { paragraphs: false })
        
        const boldNode = ast.children[0]
        expect(boldNode?.position?.start).toEqual({ line: 1, column: 1, offset: 0 })
        expect(boldNode?.position?.end).toEqual({ line: 1, column: 21, offset: 20 })
        
        if (boldNode && 'children' in boldNode) {
          const italicNode = boldNode.children[0]
          expect(italicNode?.position?.start).toEqual({ line: 1, column: 4, offset: 3 })
          expect(italicNode?.position?.end).toEqual({ line: 1, column: 17, offset: 16 })
        }
      })
    })
  })

  describe('fromBBCode', () => {
    it('should parse simple text', () => {
      const ast = fromBBCode('Hello World')
      expect(ast).toEqual({
        type: 'root',
        children: [{
          type: 'paragraph',
          children: [{
            type: 'text',
            value: 'Hello World',
            position: {
              start: { line: 1, column: 1, offset: 0 },
              end: { line: 1, column: 12, offset: 11 }
            }
          }]
        }],
        position: {
          start: { line: 1, column: 1, offset: 0 },
          end: { line: 1, column: 12, offset: 11 }
        }
      })
    })

    it('should parse bold text', () => {
      const ast = fromBBCode('[b]bold text[/b]')
      expect(ast.children).toHaveLength(1)
      
      const paragraph = ast.children[0]
      expect(paragraph?.type).toBe('paragraph')
      
      if (paragraph && 'children' in paragraph) {
        expect(paragraph.children).toHaveLength(1)
        const bold = paragraph.children[0]
        expect(bold?.type).toBe('bold')
        expect(bold?.position).toBeDefined()
        
        if (bold && 'children' in bold) {
          expect(bold.children).toEqual([
            { 
              type: 'text', 
              value: 'bold text',
              position: {
                start: { line: 1, column: 4, offset: 3 },
                end: { line: 1, column: 13, offset: 12 }
              }
            }
          ])
        }
      }
    })

    it('should parse italic text', () => {
      const ast = fromBBCode('[i]italic text[/i]')
      const paragraph = ast.children[0]
      
      if (paragraph && 'children' in paragraph) {
        const italic = paragraph.children[0]
        expect(italic?.type).toBe('italic')
        expect(italic?.position).toBeDefined()
        
        if (italic && 'children' in italic) {
          expect(italic.children[0]?.type).toBe('text')
          expect(italic.children[0]?.position).toBeDefined()
        }
      }
    })

    it('should parse underline text', () => {
      const ast = fromBBCode('[u]underline text[/u]')
      const paragraph = ast.children[0]
      
      if (paragraph && 'children' in paragraph) {
        const underline = paragraph.children[0]
        expect(underline?.type).toBe('underline')
        expect(underline?.position).toBeDefined()
        
        if (underline && 'children' in underline) {
          expect(underline.children[0]?.type).toBe('text')
          expect(underline.children[0]?.position).toBeDefined()
        }
      }
    })

    it('should parse strikethrough text', () => {
      const ast = fromBBCode('[s]strikethrough text[/s]')
      const paragraph = ast.children[0]
      
      if (paragraph && 'children' in paragraph) {
        const strike = paragraph.children[0]
        expect(strike?.type).toBe('strikethrough')
        expect(strike?.position).toBeDefined()
        
        if (strike && 'children' in strike) {
          expect(strike.children[0]?.type).toBe('text')
          expect(strike.children[0]?.position).toBeDefined()
        }
      }
    })

    it('should parse nested tags', () => {
      const ast = fromBBCode('[b][i]bold and italic[/i][/b]')
      const paragraph = ast.children[0]
      
      if (paragraph && 'children' in paragraph) {
        const bold = paragraph.children[0]
        expect(bold?.type).toBe('bold')
        expect(bold?.position).toBeDefined()
        
        if (bold && 'children' in bold) {
          expect(bold.children).toHaveLength(1)
          const italic = bold.children[0]
          expect(italic?.type).toBe('italic')
          expect(italic?.position).toBeDefined()
          
          if (italic && 'children' in italic) {
            expect(italic.children[0]?.type).toBe('text')
            expect(italic.children[0]?.position).toBeDefined()
          }
        }
      }
    })

    it('should parse links', () => {
      const ast = fromBBCode('[url=https://example.com]Example[/url]')
      const paragraph = ast.children[0]
      
      if (paragraph && 'children' in paragraph) {
        const link = paragraph.children[0]
        expect(link?.type).toBe('link')
        expect(link?.position).toBeDefined()
        
        if (link && 'url' in link) {
          expect(link.url).toBe('https://example.com')
          
          if ('children' in link) {
            expect(link.children[0]?.type).toBe('text')
            expect(link.children[0]?.position).toBeDefined()
          }
        }
      }
    })

    it('should parse images', () => {
      const ast = fromBBCode('[img=https://example.com/image.jpg]')
      const paragraph = ast.children[0]
      
      if (paragraph && 'children' in paragraph) {
        const image = paragraph.children[0]
        expect(image?.type).toBe('image')
        expect(image?.position).toBeDefined()
        
        if (image && 'url' in image) {
          expect(image.url).toBe('https://example.com/image.jpg')
        }
      }
    })

    it('should parse quotes', () => {
      const ast = fromBBCode('[quote]This is a quote[/quote]')
      const paragraph = ast.children[0]
      
      if (paragraph && 'children' in paragraph) {
        const quote = paragraph.children[0]
        expect(quote?.type).toBe('quote')
        expect(quote?.position).toBeDefined()
        
        if (quote && 'children' in quote) {
          expect(quote.children[0]?.type).toBe('text')
          expect(quote.children[0]?.position).toBeDefined()
        }
      }
    })

    it('should parse code blocks', () => {
      const ast = fromBBCode('[code]const x = 1;[/code]')
      const paragraph = ast.children[0]
      
      if (paragraph && 'children' in paragraph) {
        const code = paragraph.children[0]
        expect(code?.type).toBe('code')
        expect(code?.position).toBeDefined()
        
        if (code && 'children' in code) {
          expect(code.children[0]?.type).toBe('text')
          expect(code.children[0]?.position).toBeDefined()
        }
      }
    })

    it('should parse color tags', () => {
      const ast = fromBBCode('[color=red]Red text[/color]')
      const paragraph = ast.children[0]
      
      if (paragraph && 'children' in paragraph) {
        const color = paragraph.children[0]
        expect(color?.type).toBe('color')
        expect(color?.position).toBeDefined()
        
        if (color && 'color' in color) {
          expect(color.color).toBe('red')
          
          if ('children' in color) {
            expect(color.children[0]?.type).toBe('text')
            expect(color.children[0]?.position).toBeDefined()
          }
        }
      }
    })

    it('should parse size tags', () => {
      const ast = fromBBCode('[size=large]Large text[/size]')
      const paragraph = ast.children[0]
      
      if (paragraph && 'children' in paragraph) {
        const size = paragraph.children[0]
        expect(size?.type).toBe('size')
        expect(size?.position).toBeDefined()
        
        if (size && 'size' in size) {
          expect(size.size).toBe('large')
          
          if ('children' in size) {
            expect(size.children[0]?.type).toBe('text')
            expect(size.children[0]?.position).toBeDefined()
          }
        }
      }
    })

    it('should handle mixed content', () => {
      const ast = fromBBCode('Normal text [b]bold[/b] and [i]italic[/i] text.')
      const paragraph = ast.children[0]
      
      if (paragraph && 'children' in paragraph) {
        expect(paragraph.children).toHaveLength(5)
        expect(paragraph.children[0]?.type).toBe('text')
        expect(paragraph.children[1]?.type).toBe('bold')
        expect(paragraph.children[2]?.type).toBe('text')
        expect(paragraph.children[3]?.type).toBe('italic')
        expect(paragraph.children[4]?.type).toBe('text')
      }
    })

    it('should handle unclosed tags gracefully', () => {
      const ast = fromBBCode('[b]unclosed bold text')
      const paragraph = ast.children[0]
      
      if (paragraph && 'children' in paragraph) {
        expect(paragraph.children).toHaveLength(1)
        const bold = paragraph.children[0]
        expect(bold?.type).toBe('bold')
        expect(bold?.position).toBeDefined()
        
        if (bold && 'children' in bold) {
          expect(bold.children[0]?.type).toBe('text')
          expect(bold.children[0]?.position).toBeDefined()
        }
      }
    })

    it('should handle options correctly', () => {
      const options: ParseOptions = {
        paragraphs: false,
        strict: false
      }
      
      const ast = fromBBCode('[b]bold[/b]', options)
      expect(ast.children).toHaveLength(1)
      expect(ast.children[0]?.type).toBe('bold')
      expect(ast.children[0]?.position).toBeDefined()
    })

    it('should create generic BBTag for unknown tags', () => {
      const ast = fromBBCode('[unknown]content[/unknown]', { paragraphs: false })
      expect(ast.children).toHaveLength(1)
      
      const unknown = ast.children[0]
      expect(unknown?.type).toBe('bbtag')
      expect(unknown?.position).toBeDefined()
      
      if (unknown && 'tagName' in unknown) {
        expect(unknown.tagName).toBe('unknown')
        
        if ('children' in unknown) {
          expect(unknown.children[0]?.type).toBe('text')
          expect(unknown.children[0]?.position).toBeDefined()
        }
      }
    })
  })
})
