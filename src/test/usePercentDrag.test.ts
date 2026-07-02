import { describe, it, expect, vi } from 'vitest';
import { renderHook } from '@testing-library/react';
import { usePercentDrag } from '../hooks/usePercentDrag';

describe('usePercentDrag', () => {
  it('should initialize successfully', () => {
    const containerRef = { current: document.createElement('div') };
    const onMove = vi.fn();
    const onEnd = vi.fn();

    const { result } = renderHook(() =>
      usePercentDrag({
        containerRef,
        onMove,
        onEnd,
      })
    );

    expect(result.current.onPointerDown).toBeTypeOf('function');
  });
});
