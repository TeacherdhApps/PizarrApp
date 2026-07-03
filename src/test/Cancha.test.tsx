import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import Cancha from '../components/Cancha';

describe('Cancha Component', () => {
  it('renders standard horizontal pitch field lines', () => {
    const { container } = render(<Cancha />);
    // Target the first child of the root element (which is the grass div)
    const root = container.firstChild as HTMLElement;
    const grass = root.firstChild as HTMLElement;
    
    expect(grass.style.background).toContain('linear-gradient(160deg');
    
    // Check center spot exists
    const spot = container.querySelector('.bg-white\\/90');
    expect(spot).toBeInTheDocument();
  });

  it('renders vertical pitch when isVertical is true', () => {
    const { container } = render(<Cancha isVertical={true} />);
    // Target the first child of the root element (which is the grass div)
    const root = container.firstChild as HTMLElement;
    const grass = root.firstChild as HTMLElement;
    
    expect(grass.style.background).toContain('linear-gradient(250deg');
  });

  it('renders children elements inside Cancha', () => {
    render(
      <Cancha>
        <div data-testid="player-token">Player</div>
      </Cancha>
    );
    expect(screen.getByTestId('player-token')).toBeInTheDocument();
  });
});
