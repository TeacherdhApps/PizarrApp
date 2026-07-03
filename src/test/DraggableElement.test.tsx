import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import DraggableElement from '../components/DraggableElement';
import type { FieldElement } from '../types';

describe('DraggableElement Component', () => {
  const constraintsRef = { current: document.createElement('div') };

  it('renders ball element with ⚽ emoji', () => {
    const element: FieldElement = { id: 'el-1', type: 'ball', x: 20, y: 30 };
    render(
      <DraggableElement
        element={element}
        constraintsRef={constraintsRef}
        onDragEnd={vi.fn()}
        onDelete={vi.fn()}
      />
    );
    expect(screen.getByText('⚽')).toBeInTheDocument();
  });

  it('renders cone element with orange shapes', () => {
    const element: FieldElement = { id: 'el-2', type: 'cone', x: 40, y: 50 };
    const { container } = render(
      <DraggableElement
        element={element}
        constraintsRef={constraintsRef}
        onDragEnd={vi.fn()}
        onDelete={vi.fn()}
      />
    );
    const svg = container.querySelector('svg');
    expect(svg).toBeInTheDocument();
  });

  it('renders text label and edits value on double click', () => {
    const element: FieldElement = { id: 'el-3', type: 'text', text: 'Táctica de Presión', x: 50, y: 50 };
    const onTextChangeMock = vi.fn();
    
    render(
      <DraggableElement
        element={element}
        constraintsRef={constraintsRef}
        onDragEnd={vi.fn()}
        onDelete={vi.fn()}
        onTextChange={onTextChangeMock}
      />
    );
    
    const textNode = screen.getByText('Táctica de Presión');
    expect(textNode).toBeInTheDocument();

    // Double click to trigger edit mode
    fireEvent.doubleClick(textNode);
    
    const input = screen.getByRole('textbox');
    expect(input).toBeInTheDocument();
    expect((input as HTMLInputElement).value).toBe('Táctica de Presión');

    // Change value and blur to finish edit
    fireEvent.change(input, { target: { value: 'Nueva Estrategia' } });
    fireEvent.blur(input);

    expect(onTextChangeMock).toHaveBeenCalledWith('el-3', 'Nueva Estrategia');
  });

  it('calls onDelete when the delete button is clicked', () => {
    const element: FieldElement = { id: 'el-1', type: 'ball', x: 20, y: 30 };
    const onDeleteMock = vi.fn();
    
    const { container } = render(
      <DraggableElement
        element={element}
        constraintsRef={constraintsRef}
        onDragEnd={vi.fn()}
        onDelete={onDeleteMock}
      />
    );

    // Hover to reveal delete button (in jsdom we can just query the button since it renders conditionally when hovered or we can trigger mouseenter)
    const wrapper = container.firstChild as HTMLElement;
    fireEvent.mouseEnter(wrapper);

    const deleteBtn = screen.getByText('×');
    expect(deleteBtn).toBeInTheDocument();
    fireEvent.click(deleteBtn);

    expect(onDeleteMock).toHaveBeenCalledWith('el-1');
  });
});
