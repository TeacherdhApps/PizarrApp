import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import App from '../App';

describe('App Component', () => {
  const setMobileMode = (isMobile: boolean) => {
    // Override window.innerWidth
    Object.defineProperty(window, 'innerWidth', {
      writable: true,
      configurable: true,
      value: isMobile ? 375 : 1024,
    });
    // Override matchMedia
    vi.stubGlobal('matchMedia', vi.fn().mockImplementation((query: string) => ({
      matches: isMobile,
      media: query,
      onchange: null,
      addListener: vi.fn(),
      removeListener: vi.fn(),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    })));
  };

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  describe('Mobile Layout', () => {
    beforeEach(() => {
      setMobileMode(true);
    });

    it('renders title and tool buttons', async () => {
      render(<App />);
      
      // Check that header/footer title contains "PizarrApp"
      expect(screen.getByText(/PizarrApp/)).toBeInTheDocument();
      
      // Expand the floating menu first
      const expandBtn = await screen.findByTitle('Expandir menú');
      expect(expandBtn).toBeInTheDocument();
      fireEvent.pointerDown(expandBtn);
      fireEvent.pointerUp(expandBtn);

      // Open the Extras dropdown first
      const extrasBtn = await screen.findByTitle('Extras');
      expect(extrasBtn).toBeInTheDocument();
      fireEvent.click(extrasBtn);

      // Verify the extras dropdown items are now in the DOM
      expect(screen.getByText('Balón')).toBeInTheDocument();
      expect(screen.getByText('Cono')).toBeInTheDocument();
      expect(screen.getByText('Línea')).toBeInTheDocument();
      expect(screen.getByText('Texto')).toBeInTheDocument();
    });

    it('can switch team presets between Fútbol 7 and Fútbol 11', async () => {
      render(<App />);

      // Expand the floating menu first
      const expandBtn = await screen.findByTitle('Expandir menú');
      expect(expandBtn).toBeInTheDocument();
      fireEvent.pointerDown(expandBtn);
      fireEvent.pointerUp(expandBtn);

      // Open the Team Configuration panel first
      const configBtn = await screen.findByTitle('Alineaciones');
      expect(configBtn).toBeInTheDocument();
      fireEvent.click(configBtn);

      // By default GK, Ramos, etc. are loaded (11 players per team)
      const f7Btns = screen.getAllByText('F7');
      expect(f7Btns).toHaveLength(2); // One for local, one for visitor

      // Switch Local to F7
      fireEvent.click(f7Btns[0]);
      
      // Verify local GK is still rendered (there are 2 GKs total)
      expect(screen.getAllByText('GK').length).toBeGreaterThan(0);
    });

    it('can add a local player via the + button', async () => {
      render(<App />);

      // Expand the floating menu first
      const expandBtn = await screen.findByTitle('Expandir menú');
      expect(expandBtn).toBeInTheDocument();
      fireEvent.pointerDown(expandBtn);
      fireEvent.pointerUp(expandBtn);

      // Open the Team Configuration panel first
      const configBtn = await screen.findByTitle('Alineaciones');
      expect(configBtn).toBeInTheDocument();
      fireEvent.click(configBtn);

      const addLocalBtn = screen.getByTitle('Añadir jugador local');
      expect(addLocalBtn).toBeInTheDocument();

      // Visitor team has player number 5 (Stones), so '5' is found once initially
      expect(screen.getAllByText('5')).toHaveLength(1);

      fireEvent.click(addLocalBtn);
      
      // Renders the new player (should have a default number of 5, so now '5' is found twice)
      expect(screen.getAllByText('5')).toHaveLength(2);
    });
  });

  describe('Desktop Layout', () => {
    beforeEach(() => {
      setMobileMode(false);
    });

    it('renders sidebar, title and status', () => {
      render(<App />);
      
      // Check that header/sidebar title contains "PizarrApp"
      expect(screen.getAllByText(/PizarrApp/)[0]).toBeInTheDocument();
      
      // Verify the sidebar elements section is present and contains elements
      expect(screen.getByText('Elementos')).toBeInTheDocument();
      expect(screen.getByText('Balón')).toBeInTheDocument();
      expect(screen.getByText('Cono')).toBeInTheDocument();
      expect(screen.getByText('Línea')).toBeInTheDocument();
      expect(screen.getByText('Texto')).toBeInTheDocument();
    });

    it('can switch team presets between Fútbol 7 and Fútbol 11 in desktop sidebar', async () => {
      render(<App />);

      // Verify the sidebar title for formations is present
      const alignmentHeader = screen.getByText('Alineaciones');
      expect(alignmentHeader).toBeInTheDocument();

      // Find the F7 buttons in the sidebar
      const f7Btns = screen.getAllByText('F7');
      expect(f7Btns).toHaveLength(2); // One local, one visitor

      // Switch Local to F7
      fireEvent.click(f7Btns[0]);
      
      // Verify local GK is still rendered
      expect(screen.getAllByText('GK').length).toBeGreaterThan(0);
    });

    it('can add a local player via the + button in desktop sidebar', async () => {
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
});
