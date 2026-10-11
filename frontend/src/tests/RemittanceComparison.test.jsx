import { afterEach, describe, expect, it } from 'vitest';
import { cleanup, render, screen, within } from '@testing-library/react';
import { renderToStaticMarkup } from 'react-dom/server';
import RemittanceComparison from '../components/RemittanceComparison';
import { getRemittanceComparison } from '../data/remittanceComparison';
import { renderRemittanceComparisonHtml } from '../../../seo/remittanceComparisonSeo';

afterEach(cleanup);
const normalized = (html) => {
  const node = document.createElement('div');
  node.innerHTML = html;
  const walker = document.createTreeWalker(node, NodeFilter.SHOW_TEXT);
  const texts = [];
  while (walker.nextNode()) {
    const text = walker.currentNode.textContent.replace(/\s+/g, ' ').trim();
    if (text) texts.push(text);
  }
  return texts;
};

describe('static remittance comparison', () => {
  for (const language of ['es', 'en']) it(`renders accessible, source-matched ${language} content without inputs`, () => {
    const model = getRemittanceComparison(language);
    const { container } = render(<RemittanceComparison language={language} />);
    const section = screen.getByRole('region', { name: model.title });
    expect(section).toHaveAttribute('id', model.id);
    expect(screen.getByText(model.exampleNote)).toBeInTheDocument();
    expect(screen.getByText(model.caution)).toBeInTheDocument();
    expect(container.querySelectorAll('[data-remittance-offer]')).toHaveLength(2);
    expect(container.querySelectorAll('input, button, form, iframe')).toHaveLength(0);
    for (const source of model.sources) {
      const link = within(section).getByRole('link', { name: source.label });
      expect(link).toHaveAttribute('href', source.href);
      expect(link).toHaveAttribute('rel', 'noopener noreferrer');
    }
    const markup = renderToStaticMarkup(<RemittanceComparison language={language} />);
    expect(normalized(markup)).toEqual(normalized(renderRemittanceComparisonHtml(language)));
    expect(section.className).toContain('scroll-mt-');
  });
  it('updates the existing section cleanly when language switches and switches back', () => {
    const es = getRemittanceComparison('es');
    const en = getRemittanceComparison('en');
    const { rerender, container } = render(<RemittanceComparison language="es" />);
    rerender(<RemittanceComparison language="en" />);
    expect(screen.queryByText(es.title)).not.toBeInTheDocument();
    expect(screen.getByRole('region', { name: en.title })).toBeInTheDocument();
    rerender(<RemittanceComparison language="es" />);
    expect(screen.queryByText(en.title)).not.toBeInTheDocument();
    expect(screen.getByRole('region', { name: es.title })).toBeInTheDocument();
    expect(container.querySelectorAll('#comparar-remesas')).toHaveLength(1);
    expect(container.querySelectorAll('a')).toHaveLength(3);
  });
});
