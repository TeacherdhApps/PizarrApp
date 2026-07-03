import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import Toolbar from '../components/Toolbar';

describe('Toolbar Component', () => {
  it('renders extras toggle button', () => {
    render(<Toolbar onAdd={vi.fn()} />);
    const btn = screen.getByTitle('Extras');
    expect(btn).toBeInTheDocument();
    expect(screen.getByText('Extras')).toBeInTheDocument();
  });

  it('opens dropdown and triggers onAdd when item is clicked', () => {
    const onAddMock = vi.fn();
    render(<Toolbar onAdd={onAddMock} />);
    
    // Dropdown should be closed initially
    expect(screen.queryByText('Elementos adicionales')).not.toBeInTheDocument();

    // Open dropdown
    const btn = screen.getByTitle('Extras');
    fireEvent.click(btn);

    expect(screen.getByText('Elementos adicionales')).toBeInTheDocument();
    expect(screen.getByText('Balón')).toBeInTheDocument();
    expect(screen.getByText('Cono')).toBeInTheDocument();
    expect(screen.getByText('Línea')).toBeInTheDocument();
    expect(screen.getByText('Texto')).toBeInTheDocument();

    // Click "Balón"
    fireEvent.click(screen.getByText('Balón'));
    expect(onAddMock).toHaveBeenCalledWith('ball');

    // Dropdown should close after select
    expect(screen.queryByText('Elementos adicionales')).not.toBeInTheDocument();
  });

  it('renders clean button and calls onClearExtras when clicked', () => {
    const onClearExtrasMock = vi.fn();
    render(<Toolbar onAdd={vi.fn()} onClearExtras={onClearExtrasMock} />);

    // Open dropdown
    const btn = screen.getByTitle('Extras');
    fireEvent.click(btn);

    const clearBtn = screen.getByText('Limpiar campo');
    expect(clearBtn).toBeInTheDocument();

    fireEvent.click(clearBtn);
    expect(onClearExtrasMock).toHaveBeenCalled();
  });
});
