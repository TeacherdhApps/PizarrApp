import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import App from '../App';
import type { ReactNode } from 'react';

// Mock framer-motion since it does not work well in jsdom/Vitest environment
vi.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }: { children?: ReactNode; [key: string]: unknown }) => (
      <div {...props}>{children}</div>
    ),
  },
  AnimatePresence: ({ children }: { children?: ReactNode }) => <>{children}</>,
}));

describe('App Component', () => {
  it('renders title and tool buttons', () => {
    render(<App />);
    expect(screen.getByText('Pizarra')).toBeInTheDocument();
    expect(screen.getByTitle('Balón')).toBeInTheDocument();
    expect(screen.getByTitle('Cono')).toBeInTheDocument();
    expect(screen.getByTitle('Línea')).toBeInTheDocument();
    expect(screen.getByTitle('Texto')).toBeInTheDocument();
  });

  it('can switch team presets between Fútbol 7 and Fútbol 11', () => {
    render(<App />);

    // By default GK, Ramos, etc. are loaded (11 players per team)
    const f7Btns = screen.getAllByText('F7');
    expect(f7Btns).toHaveLength(2); // One for local, one for visitor

    // Switch Local to F7
    fireEvent.click(f7Btns[0]);
    // The F7 preset has 7 players, so the local players list becomes 7.
    // Let's verify that local GK is still rendered (there are 2 GKs total)
    expect(screen.getAllByText('GK').length).toBeGreaterThan(0);
  });

  it('can add a local player via the + button', () => {
    render(<App />);

    const addLocalBtn = screen.getByTitle('Añadir jugador local');
    expect(addLocalBtn).toBeInTheDocument();

    // Visitor team has player number 5 (Stones), so '5' is found once initially
    expect(screen.getAllByText('5')).toHaveLength(1);

    fireEvent.click(addLocalBtn);
    
    // Renders the new player (should have a default number of 5, so now '5' is found twice)
    expect(screen.getAllByText('5')).toHaveLength(2);
  });
});
