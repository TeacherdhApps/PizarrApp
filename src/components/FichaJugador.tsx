import { useState, useRef } from 'react';
import { createPortal } from 'react-dom';
import { usePercentDrag } from '../hooks/usePercentDrag';

export interface FichaJugadorProps {
  /** Shirt number shown on the token */
  numero: number;
  /** Player name displayed below the number */
  nombre: string;
  /** Background colour — any valid CSS colour */
  color: string;
  /** Current X position in percentage (0-100) of the field container width */
  x: number;
  /** Current Y position in percentage (0-100) of the field container height */
  y: number;
  /** Ref to the drag-constraint container (the Cancha wrapper) */
  constraintsRef: React.RefObject<HTMLDivElement | null>;
  /** Called when the user finishes dragging, with updated % coordinates */
  onDragEnd?: (x: number, y: number) => void;
  /** Called when the delete button is clicked */
  onDelete?: (numero: number) => void;
  /** Called when the player name is edited */
  onNameChange?: (newName: string) => void;
  /** Called when the player number is edited */
  onNumberChange?: (newNumber: number) => void;
  /** Whether we are in mobile layout (vertical pitch) */
  isMobile?: boolean;
}

/**
 * FichaJugador — A draggable player token.
 *
 * Renders a t-shirt SVG (back view) with the player's number and name.
 * Uses pointer events for drag so the token positions correctly
 * with percentage-based coordinates without any accumulated offsets.
 * On mobile, a single tap opens a bottom sheet context menu for editing and deletion.
 */
export default function FichaJugador({
  numero,
  nombre,
  color,
  x,
  y,
  constraintsRef,
  onDragEnd,
  onDelete,
  onNameChange,
  onNumberChange,
  isMobile = false,
}: FichaJugadorProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [hovered, setHovered] = useState(false);
  const [editing, setEditing] = useState(false);
  const [editingNumber, setEditingNumber] = useState(false);
  
  // Track if a drag operation actually occurred
  const hasDraggedRef = useRef(false);

  // Mobile sheet states
  const [showMobileSheet, setShowMobileSheet] = useState(false);
  const [tempNombre, setTempNombre] = useState(nombre);
  const [tempNumero, setTempNumero] = useState(numero.toString());

  const handleOpenSheet = () => {
    setTempNombre(nombre);
    setTempNumero(numero.toString());
    setShowMobileSheet(true);
  };

  const handleApplyChanges = () => {
    const trimmed = tempNombre.trim();
    if (trimmed && trimmed !== nombre) {
      onNameChange?.(trimmed);
    }
    const parsed = parseInt(tempNumero, 10);
    if (!isNaN(parsed) && parsed !== numero && parsed >= 0) {
      onNumberChange?.(parsed);
    }
    setShowMobileSheet(false);
  };

  const handleDelete = () => {
    setShowMobileSheet(false);
    onDelete?.(numero);
  };

  const { onPointerDown } = usePercentDrag({
    containerRef: constraintsRef,
    onMove: (nx, ny) => {
      hasDraggedRef.current = true;
      setIsDragging(true);
      onDragEnd?.(nx, ny);
    },
    onEnd: (nx, ny) => {
      setIsDragging(false);
      onDragEnd?.(nx, ny);
    },
  });

  const handleFinishEdit = (value: string) => {
    setEditing(false);
    const trimmed = value.trim();
    if (trimmed && trimmed !== nombre) {
      onNameChange?.(trimmed);
    }
  };

  const handleFinishEditNumber = (value: string) => {
    setEditingNumber(false);
    const parsed = parseInt(value, 10);
    if (!isNaN(parsed) && parsed !== numero && parsed >= 0) {
      onNumberChange?.(parsed);
    }
  };

  const renderMobileSheet = () => {
    if (!showMobileSheet) return null;

    return createPortal(
      <div 
        className="fixed inset-0 z-[200] flex items-end justify-center"
        onPointerDown={(e) => e.stopPropagation()}
      >
        {/* Backdrop overlay */}
        <div 
          className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity duration-300 animate-in fade-in"
          onClick={handleApplyChanges}
        />

        {/* Bottom Sheet Modal */}
        <div 
          className="relative w-full max-w-md bg-surface-800 border-t border-white/10 rounded-t-3xl p-6 pb-8 z-10 flex flex-col gap-4 shadow-2xl animate-in slide-in-from-bottom duration-300"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Top handle bar */}
          <div className="w-12 h-1 bg-white/20 rounded-full mx-auto mb-2" />

          {/* Header */}
          <div className="flex items-center gap-4">
            <div 
              className="relative w-12 h-12 flex items-center justify-center rounded-xl border border-white/10 shadow-inner"
              style={{ backgroundColor: color }}
            >
              <span className="text-white font-black text-xl">{tempNumero}</span>
            </div>
            <div className="flex flex-col">
              <span className="text-xs text-text-secondary font-bold uppercase tracking-wider">Detalles del Jugador</span>
              <span className="text-base font-bold text-text-primary">{tempNombre || 'Jugador'}</span>
            </div>
          </div>

          <hr className="border-white/5" />

          {/* Form fields */}
          <div className="flex flex-col gap-3">
            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] font-bold uppercase tracking-wider text-text-muted">Nombre</label>
              <input
                type="text"
                value={tempNombre}
                onChange={(e) => setTempNombre(e.target.value)}
                className="w-full px-3.5 py-3 rounded-xl bg-surface-900 text-text-primary text-sm font-semibold border border-border focus:ring-1 focus:ring-accent-500/30 outline-none transition-all select-text"
                placeholder="Nombre del jugador"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] font-bold uppercase tracking-wider text-text-muted">Número de camiseta</label>
              <input
                type="number"
                pattern="[0-9]*"
                inputMode="numeric"
                value={tempNumero}
                onChange={(e) => setTempNumero(e.target.value)}
                className="w-full px-3.5 py-3 rounded-xl bg-surface-900 text-text-primary text-sm font-semibold border border-border focus:ring-1 focus:ring-accent-500/30 outline-none transition-all select-text"
                placeholder="Número"
              />
            </div>
          </div>

          <div className="flex flex-col gap-2 mt-2">
            <button
              onClick={handleApplyChanges}
              className="w-full py-3.5 rounded-xl bg-accent-500 hover:bg-accent-400 text-white text-xs font-bold transition-all duration-200 active:scale-98 shadow-lg shadow-accent-500/20 cursor-pointer"
            >
              Guardar Cambios
            </button>
            
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={handleDelete}
                className="py-3 rounded-xl bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20 text-xs font-bold transition-all duration-200 active:scale-98 cursor-pointer"
              >
                Eliminar Jugador
              </button>
              <button
                onClick={() => setShowMobileSheet(false)}
                className="py-3 rounded-xl bg-surface-700 hover:bg-surface-600 text-text-secondary text-xs font-bold transition-all duration-200 active:scale-98 cursor-pointer"
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      </div>,
      document.body
    );
  };

  return (
    <>
      <div
        onPointerDown={(e) => {
          hasDraggedRef.current = false;
          if (!editing && !editingNumber && !showMobileSheet) {
            onPointerDown(e);
          }
        }}
        onClick={(e) => {
          e.stopPropagation();
          if (isMobile && !hasDraggedRef.current) {
            handleOpenSheet();
          }
        }}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        onDoubleClick={(e) => {
          if (isMobile) return;
          e.stopPropagation();
          const target = e.target as HTMLElement;
          if (target.closest('.player-name-label')) {
            setEditing(true);
          } else {
            setEditingNumber(true);
          }
        }}
        className="absolute flex flex-col items-center gap-0.5 select-none touch-none"
        style={{
          left: `${x}%`,
          top: `${y}%`,
          transform: 'translate(-50%, -50%)',
          cursor: editing ? 'auto' : isDragging ? 'grabbing' : 'grab',
          zIndex: isDragging ? 50 : hovered ? 40 : 10,
          transition: isDragging ? 'none' : 'filter 0.15s ease',
          filter: isDragging ? 'drop-shadow(0 4px 12px rgba(0,0,0,0.4))' : 'none',
          scale: isDragging ? '1.15' : '1',
        }}
      >
        {/* ── T-shirt SVG (football jersey back view) ─────────────── */}
        <div
          className="relative"
          style={{
            width: isMobile ? 'clamp(30px, 8vw, 44px)' : 'clamp(34px, 4vw, 56px)',
            height: isMobile ? 'clamp(32px, 8.5vw, 46px)' : 'clamp(36px, 4.2vw, 58px)',
            filter: 'drop-shadow(0 2px 5px rgba(0,0,0,0.4))',
          }}
        >
          {editingNumber && !isMobile && (
            <input
              type="text"
              inputMode="numeric"
              pattern="[0-9]*"
              autoFocus
              defaultValue={numero}
              onBlur={(e) => handleFinishEditNumber(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleFinishEditNumber((e.target as HTMLInputElement).value);
                if (e.key === 'Escape') setEditingNumber(false);
              }}
              onPointerDown={(e) => e.stopPropagation()}
              onClick={(e) => e.stopPropagation()}
              className="absolute inset-0 m-auto w-8 h-8 rounded bg-black/85 text-white font-bold text-center border border-accent-400/40 outline-none z-50 flex items-center justify-center text-sm select-text"
            />
          )}
          {/* Edit number button */}
          {!isMobile && hovered && !editingNumber && !editing && (
            <button
              onPointerDown={(e) => e.stopPropagation()}
              onClick={(e) => {
                e.stopPropagation();
                setEditingNumber(true);
              }}
              className="absolute -top-1 -left-1 z-50 w-4 h-4 rounded-full
                         bg-accent-500 hover:bg-accent-400 text-white text-[8px]
                         flex items-center justify-center font-bold leading-none
                         shadow-md cursor-pointer transition-colors"
              title="Editar número"
            >
              #
            </button>
          )}
          {/* Delete button */}
          {!isMobile && hovered && !editing && (
            <button
              onPointerDown={(e) => e.stopPropagation()}
              onClick={(e) => {
                e.stopPropagation();
                onDelete?.(numero);
              }}
              className="absolute -top-1 -right-1 z-50 w-4 h-4 rounded-full
                         bg-red-500 hover:bg-red-400 text-white text-[9px]
                         flex items-center justify-center leading-none
                         shadow-md cursor-pointer transition-colors"
            >
              ×
            </button>
          )}

          <svg
            viewBox="0 0 64 68"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="w-full h-full"
          >
            {/* Shirt body — back view silhouette */}
            <path
              d={`
                M22 4
                C24 2, 40 2, 42 4
                L48 3 L56 14 L56 24 L48 21
                L48 62 C48 64, 46 66, 44 66
                L20 66 C18 66, 16 64, 16 62
                L16 21 L8 24 L8 14 L16 3
                Z
              `}
              fill={color}
              stroke="rgba(255,255,255,0.45)"
              strokeWidth="1.5"
              strokeLinejoin="round"
            />
            {/* Collar */}
            <path
              d="M24 4 C28 7, 36 7, 40 4"
              fill="none"
              stroke="rgba(255,255,255,0.6)"
              strokeWidth="2"
              strokeLinecap="round"
            />
            {/* Subtle body shading (left side) */}
            <path
              d="M16 21 L16 62 C16 64, 18 66, 20 66 L24 66 L24 21 Z"
              fill="rgba(0,0,0,0.08)"
            />
            {/* Sleeve seam lines */}
            <line x1="16" y1="21" x2="22" y2="5" stroke="rgba(255,255,255,0.18)" strokeWidth="0.8" />
            <line x1="48" y1="21" x2="42" y2="5" stroke="rgba(255,255,255,0.18)" strokeWidth="0.8" />
            {/* Number text on back */}
            {!editingNumber && (
              <text
                x="32"
                y="44"
                textAnchor="middle"
                fill="white"
                fontSize="22"
                fontWeight="bold"
                fontFamily="system-ui, sans-serif"
                style={{ textShadow: '0 1px 2px rgba(0,0,0,0.3)' }}
              >
                {numero}
              </text>
            )}
          </svg>
        </div>

        {/* ── Name label (editable on double-click) ────────────────── */}
        {editing && !isMobile ? (
          <input
            autoFocus
            defaultValue={nombre}
            onBlur={(e) => handleFinishEdit(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleFinishEdit((e.target as HTMLInputElement).value);
            }}
            onPointerDown={(e) => e.stopPropagation()}
            onClick={(e) => e.stopPropagation()}
            className="px-1 py-0 rounded bg-black/70 text-white font-semibold text-center
                       border border-white/30 outline-none select-text"
            style={{
              fontSize: 'clamp(7px, 0.8vw, 11px)',
              width: 'clamp(40px, 4vw, 64px)',
            }}
          />
        ) : (
          <span
            onPointerDown={(e) => e.stopPropagation()}
            className="player-name-label font-semibold text-white text-center leading-tight whitespace-nowrap drop-shadow-md cursor-pointer"
            style={{ fontSize: isMobile ? 'clamp(7px, 2.2vw, 10px)' : 'clamp(7px, 0.8vw, 11px)' }}
          >
            {nombre}
          </span>
        )}
      </div>

      {/* Render the mobile contextual bottom sheet via React Portal */}
      {renderMobileSheet()}
    </>
  );
}
