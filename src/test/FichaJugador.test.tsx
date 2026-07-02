import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import FichaJugador from '../components/FichaJugador';
import { createRef } from 'react';

describe('FichaJugador', () => {
  it('renders player number and name', () => {
    const constraintsRef = createRef<HTMLDivElement>();
    render(
      <FichaJugador
        numero={10}
        nombre="Messi"
        color="#000000"
        x={50}
        y={50}
        constraintsRef={constraintsRef}
      />
    );

    expect(screen.getByText('10')).toBeInTheDocument();
    expect(screen.getByText('Messi')).toBeInTheDocument();
  });

  it('shows edit input on double click and calls onNameChange on Enter', () => {
    const constraintsRef = createRef<HTMLDivElement>();
    const onNameChange = vi.fn();
    
    render(
      <FichaJugador
        numero={10}
        nombre="Messi"
        color="#000000"
        x={50}
        y={50}
        constraintsRef={constraintsRef}
        onNameChange={onNameChange}
      />
    );

    const nameSpan = screen.getByText('Messi');
    fireEvent.doubleClick(nameSpan);

    const input = screen.getByRole('textbox') as HTMLInputElement;
    expect(input).toBeInTheDocument();
    expect(input.value).toBe('Messi');

    fireEvent.change(input, { target: { value: 'L. Messi' } });
    fireEvent.keyDown(input, { key: 'Enter', code: 'Enter' });

    expect(onNameChange).toHaveBeenCalledWith('L. Messi');
  });

  it('stops pointerdown event propagation on name span', () => {
    const constraintsRef = createRef<HTMLDivElement>();
    render(
      <FichaJugador
        numero={10}
        nombre="Messi"
        color="#000000"
        x={50}
        y={50}
        constraintsRef={constraintsRef}
      />
    );

    const nameSpan = screen.getByText('Messi');
    const pointerDownEvent = new MouseEvent('pointerdown', { bubbles: true });
    const stopPropagationSpy = vi.spyOn(pointerDownEvent, 'stopPropagation');

    nameSpan.dispatchEvent(pointerDownEvent);
    expect(stopPropagationSpy).toHaveBeenCalled();
  });
});
