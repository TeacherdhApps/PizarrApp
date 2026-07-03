import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import InteractiveArrow from '../components/InteractiveArrow';
import type { ArrowItem } from '../types';

describe('InteractiveArrow Component', () => {
  const constraintsRef = { current: document.createElement('div') };
  const mockArrow: ArrowItem = {
    id: 'arrow-1',
    x1: 10,
    y1: 20,
    x2: 30,
    y2: 40,
    scale: 1,
  };

  it('renders SVG lines and drag handles', () => {
    const { container } = render(
      <InteractiveArrow
        arrow={mockArrow}
        constraintsRef={constraintsRef}
        onUpdate={vi.fn()}
        onDelete={vi.fn()}
      />
    );

    // SVG elements should exist
    const svg = container.querySelector('svg');
    expect(svg).toBeInTheDocument();
    
    const lines = svg?.querySelectorAll('line');
    expect(lines).toHaveLength(2); // One thick invisible drag line, one visible solid line

    // Handles for point 1 and point 2
    const handles = container.querySelectorAll('.rounded-full');
    expect(handles).toHaveLength(2);
  });

  it('calls onDelete when delete button is hovered and clicked', () => {
    const onDeleteMock = vi.fn();
    const { container } = render(
      <InteractiveArrow
        arrow={mockArrow}
        constraintsRef={constraintsRef}
        onUpdate={vi.fn()}
        onDelete={onDeleteMock}
      />
    );

    // SVG element is hovered to trigger hover timer / state
    const svg = container.querySelector('svg') as SVGElement;
    fireEvent.mouseEnter(svg);

    // Find and click delete button
    const deleteBtn = screen.getByTitle('Eliminar línea');
    expect(deleteBtn).toBeInTheDocument();
    fireEvent.click(deleteBtn);

    expect(onDeleteMock).toHaveBeenCalledWith('arrow-1');
  });
});
