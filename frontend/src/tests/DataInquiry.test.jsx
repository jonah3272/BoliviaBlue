import { beforeEach, afterEach, describe, it, expect, vi } from 'vitest';
import { render, cleanup, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import DataInquiry from '../components/DataInquiry';
import { DATA_INQUIRY_PATH, getDataInquiry } from '../data/dataInquiry';
import { trackCommercialAccessClicked } from '../utils/analyticsEvents';

vi.mock('../utils/analyticsEvents', () => ({ trackCommercialAccessClicked: vi.fn() }));

const renderInquiry = (language = 'es', href = '/contacto') => render(
  <MemoryRouter initialEntries={[href]}><DataInquiry language={language} /></MemoryRouter>
);
let scroll;
let fetchMock;
beforeEach(() => {
  vi.clearAllMocks();
  scroll = vi.fn();
  Element.prototype.scrollIntoView = scroll;
  fetchMock = vi.fn();
  vi.stubGlobal('fetch', fetchMock);
});
afterEach(() => { cleanup(); vi.unstubAllGlobals(); });

for (const language of ['es', 'en']) describe(`data inquiry (${language})`, () => {
  const inquiry = getDataInquiry(language);
  it('prepares an encoded blank inquiry to the public inbox without submitting it', () => {
    const { container } = renderInquiry(language, inquiry.href);
    const mail = screen.getByRole('link', { name: inquiry.prepareLabel });
    const url = new URL(mail.href);
    expect(url.protocol).toBe('mailto:');
    expect(url.pathname).toBe('info@boliviablue.com');
    expect(url.searchParams.get('subject')).toBe(inquiry.subject);
    expect(url.searchParams.get('body')).toBe(inquiry.body);
    expect(screen.getByText(inquiry.limitation)).toBeInTheDocument();
    expect(container.querySelector('form')).toBeNull();
    expect(container.querySelector('input')).toBeNull();
    expect(container.querySelector('textarea')).toHaveAttribute('readonly');
    mail.addEventListener('click', (event) => event.preventDefault());
    fireEvent.click(mail);
    expect(scroll).toHaveBeenCalledWith({ block: 'start' });
    expect(trackCommercialAccessClicked).toHaveBeenCalledTimes(1);
    expect(trackCommercialAccessClicked).toHaveBeenCalledWith({ language, destination: DATA_INQUIRY_PATH, link_label: 'data_inquiry_prepare_email' });
    expect(fetchMock).not.toHaveBeenCalled();
    expect(screen.getByRole('status')).toBeEmptyDOMElement();
  });
  it('copies recipient, subject and blank fields and reports only a local copy', async () => {
    const writeText = vi.fn().mockResolvedValue(undefined);
    Object.defineProperty(navigator, 'clipboard', { configurable: true, value: { writeText } });
    renderInquiry(language);
    fireEvent.click(screen.getByRole('button', { name: inquiry.copyLabel }));
    expect(screen.getByRole('button', { name: inquiry.copyingLabel })).toBeDisabled();
    await waitFor(() => expect(screen.getByRole('status')).toHaveTextContent(inquiry.copied));
    expect(writeText).toHaveBeenCalledTimes(1);
    expect(writeText).toHaveBeenCalledWith(inquiry.fullText);
    expect(inquiry.fullText).toContain('info@boliviablue.com');
    expect(inquiry.fullText).toContain(inquiry.subject);
    expect(inquiry.fullText).toContain(inquiry.body);
    expect(trackCommercialAccessClicked).toHaveBeenCalledTimes(1);
    expect(trackCommercialAccessClicked).toHaveBeenCalledWith({ language, destination: DATA_INQUIRY_PATH, link_label: 'data_inquiry_copy' });
    expect(fetchMock).not.toHaveBeenCalled();
  });
  for (const missing of [false, true]) it(`offers focused selectable text when clipboard is ${missing ? 'missing' : 'denied'} and can retry`, async () => {
    const writeText = vi.fn().mockRejectedValue(new Error('Clipboard unavailable'));
    Object.defineProperty(navigator, 'clipboard', { configurable: true, value: missing ? undefined : { writeText } });
    const { container } = renderInquiry(language);
    fireEvent.click(screen.getByRole('button', { name: inquiry.copyLabel }));
    await waitFor(() => expect(screen.getByRole('status')).toHaveTextContent(inquiry.copyFailed));
    expect(container.querySelector('details')).toHaveAttribute('open');
    const text = screen.getByRole('textbox', { name: inquiry.templateLabel });
    expect(text).toHaveValue(inquiry.fullText);
    expect(text).toHaveFocus();
    expect(text.selectionStart).toBe(0);
    expect(text.selectionEnd).toBe(inquiry.fullText.length);
    const retry = vi.fn().mockResolvedValue(undefined);
    Object.defineProperty(navigator, 'clipboard', { configurable: true, value: { writeText: retry } });
    fireEvent.click(screen.getByRole('button', { name: inquiry.copyLabel }));
    await waitFor(() => expect(screen.getByRole('status')).toHaveTextContent(inquiry.copied));
    expect(retry).toHaveBeenCalledWith(inquiry.fullText);
    expect(fetchMock).not.toHaveBeenCalled();
  });
});
