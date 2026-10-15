import { afterEach, describe, expect, it, vi } from 'vitest';
import { cleanup, render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import ApiDocs from '../pages/ApiDocs';
import { getApiDocumentation } from '../data/apiDocumentation';
import { trackApiDocsViewed } from '../utils/analyticsEvents';
const state = vi.hoisted(() => ({ language: 'es' }));
vi.mock('../contexts/LanguageContext', () => ({ useLanguage: () => state }));
vi.mock('../hooks/useAdsenseReady', () => ({ useAdsenseReady: () => {} }));
vi.mock('../components/Header', () => ({ default: () => null }));
vi.mock('../components/Footer', () => ({ default: () => null }));
vi.mock('../components/Navigation', () => ({ default: () => null }));
vi.mock('../components/Breadcrumbs', () => ({ default: () => null }));
vi.mock('../components/PageMeta', () => ({ default: ({ title, description, structuredData }) => <script data-testid="meta" type="application/json">{JSON.stringify({ title, description, structuredData })}</script> }));
vi.mock('../utils/analyticsEvents', () => ({ trackApiDocsViewed: vi.fn(), trackCommercialAccessClicked: vi.fn() }));
afterEach(() => { cleanup(); vi.clearAllMocks(); });
const view = () => <MemoryRouter><ApiDocs /></MemoryRouter>;
for (const language of ['es', 'en']) describe(`API documentation (${language})`, () => {
  it('renders the same notes and endpoint contracts as initial HTML, and labels old examples as illustrative', () => {
    state.language = language;
    const page = getApiDocumentation(language);
    const { container } = render(view());
    for (const note of [page.copy.introduction, ...page.notes, page.copy.additionalAccess]) expect(screen.getByText(note)).toBeInTheDocument();
    for (const endpoint of page.endpoints) {
      expect(screen.getByText(endpoint.path)).toBeInTheDocument();
      expect(screen.getAllByText(endpoint.description).length).toBeGreaterThan(0);
      const response = typeof endpoint.response === 'string' ? endpoint.response : JSON.stringify(endpoint.response, null, 2);
      expect([...container.querySelectorAll('pre')].some((pre) => pre.textContent === response)).toBe(true);
      expect([...container.querySelectorAll('pre')].some((pre) => pre.textContent === JSON.stringify(endpoint.example.response, null, 2))).toBe(true);
    }
    expect(screen.getAllByText(page.copy.exampleNotice)).toHaveLength(4);
    expect(screen.getByText('JavaScript (Fetch)')).toBeInTheDocument();
    expect(screen.getByText('Python (requests)')).toBeInTheDocument();
    expect(screen.getAllByRole('heading', { level: 1 })).toHaveLength(1);
    expect(JSON.parse(screen.getByTestId('meta').textContent)).toEqual({ title: page.copy.title, description: page.copy.description, structuredData: [page.apiSchema] });
    expect(trackApiDocsViewed).toHaveBeenCalledTimes(1);
  });
});
it('language changes replace the reference text without duplicate analytics or stale copy', () => {
  state.language = 'es';
  const { rerender } = render(view());
  state.language = 'en';
  rerender(view());
  expect(screen.getByText(getApiDocumentation('en').copy.units)).toBeInTheDocument();
  expect(screen.queryByText(getApiDocumentation('es').copy.units)).not.toBeInTheDocument();
  expect(trackApiDocsViewed).toHaveBeenCalledTimes(1);
});
