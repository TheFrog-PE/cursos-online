import { describe, it, expect } from 'vitest';
import { renderFormattedDescription } from '../../utils/markdownRenderer';

describe('renderFormattedDescription helper tests', () => {
  it('should return null for empty text', () => {
    expect(renderFormattedDescription('')).toBeNull();
  });

  it('should render normal paragraphs without formatting', () => {
    const res = renderFormattedDescription('Texto normal') as any[];
    expect(res).toBeDefined();
    expect(res[0].type).toBe('p');
    expect((res[0].props.children as any)[0]).toBe('Texto normal');
  });

  it('should parse bold syntax using **', () => {
    const res = renderFormattedDescription('Este texto es **importante** y destacado') as any[];
    expect(res).toBeDefined();
    expect(res[0].type).toBe('p');
    
    const children = res[0].props.children as any[];
    expect(children[0]).toBe('Este texto es ');
    expect(children[1].type).toBe('strong');
    expect(children[1].props.children).toBe('importante');
    expect(children[2]).toBe(' y destacado');
  });

  it('should parse italic syntax using *', () => {
    const res = renderFormattedDescription('Este texto es *en cursiva* y sutil') as any[];
    expect(res).toBeDefined();
    expect(res[0].type).toBe('p');

    const children = res[0].props.children as any[];
    expect(children[0]).toBe('Este texto es ');
    expect(children[1].type).toBe('em');
    expect(children[1].props.children).toBe('en cursiva');
    expect(children[2]).toBe(' y sutil');
  });

  it('should parse lists with bullet points (-)', () => {
    const markdown = `- Elemento uno\n- Elemento dos`;
    const res = renderFormattedDescription(markdown) as any[];
    expect(res).toBeDefined();
    expect(res[0].type).toBe('ul');
    
    const listItems = res[0].props.children as any[];
    expect(listItems.length).toBe(2);
    expect(listItems[0].type).toBe('li');
    expect(listItems[0].props.children[0]).toBe('Elemento uno');
    expect(listItems[1].type).toBe('li');
    expect(listItems[1].props.children[0]).toBe('Elemento dos');
  });
});
