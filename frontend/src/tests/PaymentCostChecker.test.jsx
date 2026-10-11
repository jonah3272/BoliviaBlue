import React from 'react';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import PaymentCostChecker from '../components/PaymentCostChecker';
import { PaymentCostEmbed } from '../embeds/paymentCostEmbed';

const field = (id) => document.getElementById(`payment-cost-${id}`);
const enter = (values) => Object.entries(values).forEach(([key, value]) => fireEvent.change(field(key), { target: { value } }));
const compare = () => fireEvent.submit(screen.getByRole('form'));
afterEach(() => { cleanup(); vi.restoreAllMocks(); });

describe('shared payment checker in the standalone embed', () => {
  it.each(['es', 'en'])('starts blank in %s and exposes units, fee groups, source and limits', (language) => {
    render(<PaymentCostEmbed initialLanguage={language} />);
    for (const name of ['bobPrice', 'usdPrice', 'rate']) expect(field(name)).toHaveValue('');
    for (const name of ['bobPercent', 'bobFixed', 'usdPercent', 'usdFixed']) expect(field(name)).toHaveValue('0');
    expect(document.querySelectorAll('fieldset')).toHaveLength(2);
    expect(document.querySelector('[aria-invalid="true"]')).toBeNull();
    expect(document.querySelector('[data-payment-cost-results]')).toBeNull();
    expect(screen.getByRole('link', { name: /Bolivia Blue ·/ })).toHaveAttribute('href', expect.stringContaining('#payment-cost-comparison'));
    expect(screen.getByText(/BOB por USD|BOB per USD/)).toBeVisible();
    expect(document.body).toHaveTextContent(language === 'en' ? 'don’t add that fee again' : 'no la agregues otra vez');
    expect(document.documentElement.lang).toBe(language === 'en' ? 'en' : 'es-BO');
  });

  it('uses the shared exact arithmetic, clears stale results and resets', () => {
    render(<PaymentCostEmbed initialLanguage="en" />);
    fireEvent.click(screen.getByRole('button', { name: 'Try a hypothetical example' }));
    expect(document.querySelector('[data-scenario-label]')).toHaveTextContent('Hypothetical example');
    expect(document.querySelector('[data-cost-summary]')).toHaveTextContent('USD 1.50 less');
    expect(document.querySelector('[data-cost-value="bob-total"]')).toHaveTextContent('53.50');
    enter({ rate: '12.36' });
    expect(document.querySelector('[data-cost-summary]')).toHaveTextContent('Same estimated cost');
    expect(document.querySelector('[data-scenario-label]')).toHaveTextContent('Your edited scenario');
    enter({ rate: '0' });
    expect(document.querySelector('[data-payment-cost-results]')).toBeNull();
    expect(field('rate')).toHaveAttribute('aria-invalid', 'true');
    expect(field('rate').getAttribute('aria-describedby')).toContain('payment-cost-rate-error');
    fireEvent.click(screen.getByRole('button', { name: 'Clear inputs' }));
    expect(field('rate')).toHaveValue('');
    expect(field('bobFixed')).toHaveValue('0');
    expect(document.querySelector('[aria-invalid="true"]')).toBeNull();
    expect(document.querySelector('[data-scenario-label]')).toBeNull();
  });

  it('accepts comma decimals, separate route fees and language changes without losing input', () => {
    render(<PaymentCostEmbed initialLanguage="en" />);
    enter({ bobPrice: '1200', usdPrice: '100', rate: '12,5', bobPercent: '1,5', bobFixed: '1', usdPercent: '2', usdFixed: '0.50' });
    compare();
    expect(document.querySelector('[data-cost-value="bob-total"]')).toHaveTextContent('98.44');
    expect(document.querySelector('[data-cost-value="usd-total"]')).toHaveTextContent('102.50');
    expect(document.querySelector('[data-cost-summary]')).toHaveTextContent('USD 4.06 less');
    fireEvent.click(screen.getByRole('button', { name: 'Español' }));
    expect(field('rate')).toHaveValue('12,5');
    expect(document.querySelector('[data-cost-summary]')).toHaveTextContent('USD 4,06 menos');
    expect(document.documentElement.lang).toBe('es-BO');
    expect(screen.getByRole('link', { name: /Bolivia Blue ·/ })).toHaveAttribute('href', expect.stringContaining('/guia-dinero-bolivia#'));
  });

  it('validates missing and malformed values without a stale winner', () => {
    render(<PaymentCostEmbed initialLanguage="en" />);
    compare();
    expect(document.querySelectorAll('[aria-invalid="true"]')).toHaveLength(3);
    enter({ bobPrice: '500.05', usdPrice: '50', rate: '10' });
    expect(document.querySelector('[data-cost-summary]')).toHaveTextContent('USD 0.01 less');
    enter({ bobPrice: '1.200,50' });
    expect(document.querySelector('[data-payment-cost-results]')).toBeNull();
    expect(field('bobPrice')).toHaveAttribute('aria-invalid', 'true');
    enter({ bobPrice: '500.04', bobPercent: '' });
    expect(document.querySelector('[data-cost-summary]')).toHaveTextContent('Same estimated cost');
  });

  it('shows the same results as the guide component with no network or storage calls', () => {
    const fetch = vi.spyOn(globalThis, 'fetch').mockRejectedValue(new Error('Unexpected network'));
    const storage = vi.spyOn(Storage.prototype, 'setItem');
    const message = vi.spyOn(window, 'postMessage');
    const first = render(<PaymentCostChecker language="en" />);
    fireEvent.click(screen.getByRole('button', { name: 'Try a hypothetical example' }));
    const guideResult = document.querySelector('[data-payment-cost-results]').textContent;
    first.unmount();
    render(<PaymentCostEmbed initialLanguage="en" />);
    fireEvent.click(screen.getByRole('button', { name: 'Try a hypothetical example' }));
    expect(document.querySelector('[data-payment-cost-results]').textContent).toBe(guideResult);
    expect(fetch).not.toHaveBeenCalled();
    expect(storage).not.toHaveBeenCalled();
    expect(message).not.toHaveBeenCalled();
  });
});
