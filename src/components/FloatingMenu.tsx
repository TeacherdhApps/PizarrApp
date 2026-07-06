import React, { useState, useEffect, useRef } from 'react';
import { 
  Sparkles, 
  Users, 
  Save, 
  RotateCcw, 
  Download, 
  Link2, 
  GripVertical, 
  Triangle, 
  Minus, 
  Type, 
  Trash2, 
  Icon
} from 'lucide-react';
import { soccerBall } from '@lucide/lab';
import type { ElementType } from '../types';

interface FloatingMenuProps {
  onAddTool: (type: ElementType | 'arrow') => void;
  onClearExtras?: () => void;
  onGuardar: () => void;
  onReiniciar: () => void;
  generateShareLink: () => void;

  isTeamConfigOpen: boolean;
  setIsTeamConfigOpen: (open: boolean) => void;
  teamConfigContent: React.ReactNode;

  isExportOpen: boolean;
  setIsExportOpen: (open: boolean) => void;
  exportContent: React.ReactNode;

  isShareOpen: boolean;
  setIsShareOpen: (open: boolean) => void;
  shareContent: React.ReactNode;
}

export default function FloatingMenu({
  onAddTool,
  onClearExtras,
  onGuardar,
  onReiniciar,
  generateShareLink,
  isTeamConfigOpen,
  setIsTeamConfigOpen,
  teamConfigContent,
  isExportOpen,
  setIsExportOpen,
  exportContent,
  isShareOpen,
  setIsShareOpen,
  shareContent
}: FloatingMenuProps) {
  const [isMounted, setIsMounted] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [isExtrasOpen, setIsExtrasOpen] = useState(false);
  const [position, setPosition] = useState({ x: 0, y: 0 });

  const containerRef = useRef<HTMLDivElement>(null);
  const isDraggingRef = useRef(false);
  const dragStartRef = useRef({ x: 0, y: 0 });
  const clickStartRef = useRef({ x: 0, y: 0 });

  useEffect(() => {
    // Initial position on mount (bottom right of the window)
    const initialX = window.innerWidth - 80;
    const initialY = window.innerHeight - 150;
    setPosition({ x: initialX, y: initialY });
    setIsMounted(true);
  }, []);

  useEffect(() => {
    const handleResize = () => {
      setPosition((prev) => {
        const maxX = window.innerWidth - 72;
        const maxY = window.innerHeight - 72;
        return {
          x: Math.max(16, Math.min(maxX, prev.x)),
          y: Math.max(16, Math.min(maxY, prev.y)),
        };
      });
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  if (!isMounted) return null;

  const closeAll = () => {
    setIsExtrasOpen(false);
    setIsTeamConfigOpen(false);
    setIsExportOpen(false);
    setIsShareOpen(false);
  };

  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    if (e.button !== 0) return; // Left click only

    const target = e.target as HTMLElement;
    // Don't drag if clicking buttons, inputs, etc.
    if (target.closest('button') || target.closest('input') || target.closest('select') || target.closest('a')) {
      return;
    }

    isDraggingRef.current = true;
    clickStartRef.current = { x: e.clientX, y: e.clientY };
    dragStartRef.current = { x: e.clientX - position.x, y: e.clientY - position.y };

    if (containerRef.current) {
      containerRef.current.setPointerCapture(e.pointerId);
    }
    e.stopPropagation();
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!isDraggingRef.current) return;

    const newX = e.clientX - dragStartRef.current.x;
    const newY = e.clientY - dragStartRef.current.y;

    // Clamp coordinates to screen dimensions
    const width = containerRef.current?.offsetWidth || 56;
    const height = containerRef.current?.offsetHeight || 56;
    
    const maxX = window.innerWidth - width - 16;
    const maxY = window.innerHeight - height - 16;

    setPosition({
      x: Math.max(16, Math.min(maxX, newX)),
      y: Math.max(16, Math.min(maxY, newY)),
    });
  };

  const handlePointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!isDraggingRef.current) return;

    isDraggingRef.current = false;
    if (containerRef.current) {
      try {
        containerRef.current.releasePointerCapture(e.pointerId);
      } catch (err) {
        // Ignored
      }
    }

    const dx = e.clientX - clickStartRef.current.x;
    const dy = e.clientY - clickStartRef.current.y;
    const distance = Math.sqrt(dx * dx + dy * dy);

    // If dragged less than 6px, treat it as a click toggle
    if (distance < 6) {
      setIsExpanded((prev) => !prev);
      if (isExpanded) {
        closeAll();
      }
    }
  };

  const handleTogglePanel = (panel: 'extras' | 'teams' | 'export' | 'share') => {
    if (panel === 'extras') {
      setIsExtrasOpen(!isExtrasOpen);
      setIsTeamConfigOpen(false);
      setIsExportOpen(false);
      setIsShareOpen(false);
    } else if (panel === 'teams') {
      setIsTeamConfigOpen(!isTeamConfigOpen);
      setIsExtrasOpen(false);
      setIsExportOpen(false);
      setIsShareOpen(false);
    } else if (panel === 'export') {
      setIsExportOpen(!isExportOpen);
      setIsExtrasOpen(false);
      setIsTeamConfigOpen(false);
      setIsShareOpen(false);
    } else if (panel === 'share') {
      setIsExtrasOpen(false);
      setIsTeamConfigOpen(false);
      setIsExportOpen(false);
      if (!isShareOpen) {
        generateShareLink();
      } else {
        setIsShareOpen(false);
      }
    }
  };

  const handleSelectExtra = (type: ElementType | 'arrow') => {
    onAddTool(type);
    setIsExtrasOpen(false);
  };

  const handleClearExtras = () => {
    onClearExtras?.();
    setIsExtrasOpen(false);
  };

  const isTopHalf = position.y < window.innerHeight / 2;
  const isLeftHalf = position.x < window.innerWidth / 2;

  const popoverPositionClass = `${
    isTopHalf ? 'top-[calc(100%+12px)]' : 'bottom-[calc(100%+12px)]'
  } ${
    isLeftHalf ? 'left-0' : 'right-0'
  }`;

  const extrasItems = [
    {
      type: 'ball' as const,
      label: 'Balón',
      desc: 'Añadir balón al campo',
      icon: <Icon iconNode={soccerBall} size={18} strokeWidth={2} className="text-emerald-400" />,
    },
    {
      type: 'cone' as const,
      label: 'Cono',
      desc: 'Cono de entrenamiento',
      icon: <Triangle size={18} strokeWidth={2} className="text-orange-400 fill-orange-400/20" />,
    },
    {
      type: 'arrow' as const,
      label: 'Línea',
      desc: 'Flecha táctica interactiva',
      icon: <Minus size={18} strokeWidth={2.5} className="text-yellow-400" />,
    },
    {
      type: 'text' as const,
      label: 'Texto',
      desc: 'Etiqueta de texto libre',
      icon: <Type size={18} strokeWidth={2} className="text-cyan-400" />,
    },
  ];

  const anyPanelOpen = isExtrasOpen || isTeamConfigOpen || isExportOpen || isShareOpen;

  return (
    <>
      {/* Global backdrop click catcher when any panel is open */}
      {anyPanelOpen && (
        <div 
          className="fixed inset-0 z-[80]" 
          onClick={closeAll} 
        />
      )}

      <div
        ref={containerRef}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        style={{
          left: position.x,
          top: position.y,
          touchAction: 'none',
        }}
        className={`fixed z-[95] transition-shadow duration-200 select-none ${
          isExpanded 
            ? 'p-2 rounded-2xl bg-surface-800/90 border border-border backdrop-blur-md shadow-2xl flex items-center gap-2 animate-in fade-in zoom-in-95 duration-150' 
            : 'w-14 h-14 rounded-full bg-gradient-to-br from-accent-500 to-accent-600 border border-accent-400/30 shadow-[0_4px_20px_rgba(99,102,241,0.4)] flex items-center justify-center cursor-grab active:cursor-grabbing hover:scale-105 active:scale-95 transition-all duration-150'
        }`}
      >
        {!isExpanded ? (
          <div className="pointer-events-none flex items-center justify-center">
            <Icon iconNode={soccerBall} size={28} strokeWidth={2} className="text-white animate-pulse" />
          </div>
        ) : (
          <>
            {/* Grip handle for dragging */}
            <div className="flex items-center justify-center px-1 py-2 cursor-grab active:cursor-grabbing text-text-muted hover:text-text-secondary shrink-0">
              <GripVertical size={16} />
            </div>

            {/* Quick Collapse Button */}
            <button
              onClick={() => { setIsExpanded(false); closeAll(); }}
              className="flex items-center justify-center w-8 h-8 rounded-xl bg-surface-700/60 text-text-secondary hover:text-text-primary border border-border cursor-pointer transition-colors"
              title="Colapsar menú"
            >
              <Icon iconNode={soccerBall} size={18} strokeWidth={2} className="text-accent-400" />
            </button>

            {/* divider */}
            <div className="w-px h-6 bg-white/10 shrink-0" />

            {/* Actions list */}
            <div className="flex items-center gap-1.5 animate-in fade-in slide-in-from-left-2 duration-150">
              {/* Extras menu */}
              <div className="relative">
                <button
                  onClick={() => handleTogglePanel('extras')}
                  className={`flex items-center justify-center w-9 h-9 rounded-xl border transition-all cursor-pointer active:scale-90 ${
                    isExtrasOpen
                      ? 'bg-accent-500/20 text-accent-400 border-accent-500/30 font-semibold'
                      : 'bg-surface-700/60 text-text-secondary border-border hover:bg-surface-700 hover:text-text-primary'
                  }`}
                  title="Extras"
                >
                  <Sparkles size={16} className={isExtrasOpen ? 'text-accent-400' : 'text-text-secondary'} />
                </button>
                
                {isExtrasOpen && (
                  <div className={`z-[100] border border-border bg-surface-700 p-2 shadow-2xl rounded-xl animate-in fade-in duration-150 md:absolute md:w-56 ${popoverPositionClass} popover-mobile`}>
                    <h3 className="text-[10px] font-bold uppercase tracking-wider text-text-secondary px-2.5 py-1.5 border-b border-white/5 mb-1.5">
                      Elementos adicionales
                    </h3>
                    <div className="space-y-0.5">
                      {extrasItems.map((item) => (
                        <button
                          key={item.type}
                          onClick={() => handleSelectExtra(item.type)}
                          className="w-full flex items-center gap-3 px-2.5 py-2 rounded-lg text-left hover:bg-surface-600 transition-colors cursor-pointer group"
                        >
                          <div className="w-8 h-8 rounded-lg bg-surface-800 flex items-center justify-center border border-border group-hover:border-white/10 shrink-0">
                            {item.icon}
                          </div>
                          <div className="flex flex-col min-w-0">
                            <span className="text-xs font-semibold text-text-primary leading-tight">{item.label}</span>
                            <span className="text-[9px] text-text-muted leading-tight truncate">{item.desc}</span>
                          </div>
                        </button>
                      ))}
                    </div>
                    {onClearExtras && (
                      <>
                        <div className="h-px bg-white/5 my-1.5" />
                        <button
                          onClick={handleClearExtras}
                          className="w-full flex items-center gap-3 px-2.5 py-2 rounded-lg text-left hover:bg-red-500/10 text-red-400 transition-colors cursor-pointer group"
                        >
                          <div className="w-8 h-8 rounded-lg bg-red-500/5 flex items-center justify-center border border-red-500/10 group-hover:border-red-500/20 shrink-0">
                            <Trash2 size={16} strokeWidth={2} className="text-red-400" />
                          </div>
                          <div className="flex flex-col min-w-0">
                            <span className="text-xs font-semibold leading-tight">Limpiar campo</span>
                            <span className="text-[9px] opacity-70 leading-tight">Borra todos los extras</span>
                          </div>
                        </button>
                      </>
                    )}
                  </div>
                )}
              </div>

              {/* Alineaciones (Teams) */}
              <div className="relative">
                <button
                  onClick={() => handleTogglePanel('teams')}
                  className={`flex items-center justify-center w-9 h-9 rounded-xl border transition-all cursor-pointer active:scale-90 ${
                    isTeamConfigOpen
                      ? 'bg-accent-500/20 text-accent-400 border-accent-500/30'
                      : 'bg-surface-700/60 text-text-secondary border-border hover:bg-surface-700 hover:text-text-primary'
                  }`}
                  title="Alineaciones"
                >
                  <Users size={16} />
                </button>
                {isTeamConfigOpen && (
                  <div className={`z-[100] rounded-xl border border-border bg-surface-700 p-4 shadow-2xl animate-in fade-in duration-150 md:absolute md:w-[320px] ${popoverPositionClass} popover-mobile`}>
                    <h3 className="text-[10px] font-bold uppercase tracking-wider text-text-secondary mb-3 flex items-center gap-1.5">
                      <Users size={12} /> Alineaciones y Equipos
                    </h3>
                    {teamConfigContent}
                  </div>
                )}
              </div>

              {/* Guardar */}
              <button
                onClick={onGuardar}
                className="flex items-center justify-center w-9 h-9 rounded-xl bg-accent-500/10 text-accent-400 hover:bg-accent-500/20 hover:text-accent-300 border border-accent-500/20 hover:border-accent-500/40 transition-all cursor-pointer active:scale-90"
                title="Guardar Táctica"
              >
                <Save size={16} />
              </button>

              {/* Reiniciar */}
              <button
                onClick={onReiniciar}
                className="flex items-center justify-center w-9 h-9 rounded-xl bg-surface-700/60 text-text-secondary hover:text-text-primary hover:bg-surface-700 border border-border transition-all cursor-pointer active:scale-90"
                title="Reiniciar Cancha"
              >
                <RotateCcw size={16} />
              </button>

              {/* Exportar */}
              <div className="relative">
                <button
                  onClick={() => handleTogglePanel('export')}
                  className={`flex items-center justify-center w-9 h-9 rounded-xl border transition-all cursor-pointer active:scale-90 ${
                    isExportOpen
                      ? 'bg-blue-600/20 text-blue-400 border-blue-500/30'
                      : 'bg-surface-700/60 text-text-secondary border-border hover:bg-surface-700 hover:text-text-primary'
                  }`}
                  title="Exportar / Importar"
                >
                  <Download size={16} />
                </button>
                {isExportOpen && (
                  <div className={`z-[100] rounded-xl border border-border bg-surface-700 p-1.5 shadow-2xl animate-in fade-in duration-150 md:absolute md:w-48 ${popoverPositionClass} popover-mobile`}>
                    {exportContent}
                  </div>
                )}
              </div>

              {/* Compartir */}
              <div className="relative">
                <button
                  onClick={() => handleTogglePanel('share')}
                  className={`flex items-center justify-center w-9 h-9 rounded-xl border transition-all cursor-pointer active:scale-90 ${
                    isShareOpen
                      ? 'bg-emerald-600/20 text-emerald-400 border-emerald-500/30'
                      : 'bg-surface-700/60 text-text-secondary border-border hover:bg-surface-700 hover:text-text-primary'
                  }`}
                  title="Compartir táctica"
                >
                  <Link2 size={16} />
                </button>
                {isShareOpen && (
                  <div className={`z-[100] rounded-xl border border-border bg-surface-700 p-4 shadow-2xl animate-in fade-in duration-150 md:absolute md:w-[340px] ${popoverPositionClass} popover-mobile`}>
                    {shareContent}
                    <div className="mt-3 pt-2.5 border-t border-white/5">
                      <p className="text-[10px] text-text-muted leading-relaxed">
                        <span className="font-semibold text-text-secondary">💡 Tip:</span>{' '}
                        Guarda este enlace en tus marcadores o compártelo por WhatsApp, correo o cualquier medio. La táctica viaja dentro del enlace, sin necesidad de cuenta ni servidor.
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </>
        )}
      </div>
    </>
  );
}
