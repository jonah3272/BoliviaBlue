import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import RateCards from '../components/RateCards';

// Mock the API module
vi.mock('../utils/api', () => ({
  fetchBlueRate: vi.fn()
}));

import { fetchBlueRate } from '../utils/api';

describe('RateCards', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders loading state initially', () => {
    fetchBlueRate.mockImplementation(() => new Promise(() => {}));
    render(<RateCards />);
    
    expect(screen.getAllByText('COMPRAR').length).toBeGreaterThan(0);
    expect(screen.getAllByText('VENDER').length).toBeGreaterThan(0);
  });

  it('renders rate data when loaded successfully', async () => {
    const mockData = {
      buy_bob_per_usd: 10.05,
      sell_bob_per_usd: 9.96,
      updated_at_iso: '2025-11-11T12:00:00Z',
      is_stale: false
    };
    
    fetchBlueRate.mockResolvedValue(mockData);
    
    render(<RateCards />);
    
    await waitFor(() => {
      expect(screen.getByText('10.05')).toBeInTheDocument();
      expect(screen.getByText('9.96')).toBeInTheDocument();
    });
  });

  it('shows stale badge when data is old', async () => {
    const mockData = {
      buy_bob_per_usd: 10.05,
      sell_bob_per_usd: 9.96,
      updated_at_iso: '2025-11-11T12:00:00Z',
      is_stale: true
    };
    
    fetchBlueRate.mockResolvedValue(mockData);
    
    render(<RateCards />);
    
    await waitFor(() => {
      expect(screen.getAllByText('Desactualizado').length).toBe(2);
    });
  });

  it('handles error state gracefully', async () => {
    fetchBlueRate.mockRejectedValue(new Error('Network error'));
    
    render(<RateCards />);
    
    await waitFor(() => {
      expect(screen.getAllByText('Error al cargar').length).toBe(2);
    });
  });
});

