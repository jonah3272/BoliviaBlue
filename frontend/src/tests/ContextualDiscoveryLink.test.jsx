import { afterEach, describe, expect, it } from 'vitest';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { MemoryRouter, useLocation } from 'react-router-dom';
import ContextualDiscoveryLink from '../components/ContextualDiscoveryLink';
import { getContextualDiscovery } from '../data/contextualDiscovery';
import { renderContextualDiscoveryLink } from '../../../seo/contextualDiscoverySeo';

afterEach(cleanup);
const Location = () => { const value = useLocation(); return <output>{value.pathname + value.search + value.hash}</output>; };

for (const language of ['es', 'en']) describe(`contextual discovery (${language})`, () => {
  for (const [key, link] of Object.entries(getContextualDiscovery(language))) {
    it(`${key}: matches initial HTML text/destination and navigates using its intended mode`, () => {
      const { container } = render(<MemoryRouter initialEntries={['/calculadora']}><ContextualDiscoveryLink link={link} /><Location /></MemoryRouter>);
      const initial = new DOMParser().parseFromString(renderContextualDiscoveryLink(link), 'text/html');
      const paragraph = container.querySelector('[data-contextual-discovery]');
      expect(paragraph.textContent).toBe(initial.querySelector('p').textContent);
      expect(screen.getByRole('link', { name: link.label })).toHaveAttribute('href', link.href);
      expect(paragraph.querySelectorAll('a')).toHaveLength(1);
      let preventedByRouter;
      const preventNativeNavigation = event => { preventedByRouter = event.defaultPrevented; event.preventDefault(); };
      document.addEventListener('click', preventNativeNavigation, { once: true });
      fireEvent.click(screen.getByRole('link'));
      expect(preventedByRouter).toBe(!link.fullNavigation);
      expect(container.querySelector('output')).toHaveTextContent(link.fullNavigation ? '/calculadora' : link.href);
    });
  }
});
