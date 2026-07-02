import { Icon, Triangle, Minus, Type, Trash2 } from 'lucide-react';
import { soccerBall } from '@lucide/lab';
import type { ElementType } from '../types';

interface ToolbarProps {
  onAdd: (type: ElementType | 'arrow') => void;
  onClearExtras?: () => void;
  className?: string;
}

const tools: { type: ElementType | 'arrow'; label: string; icon: React.ReactNode; hoverBg: string }[] = [
  {
    type: 'ball',
    label: 'Balón',
    icon: <Icon iconNode={soccerBall} size={22} strokeWidth={1.8} color="#4ade80" />,
    hoverBg: 'hover:bg-green-500/15',
  },
  {
    type: 'cone',
    label: 'Cono',
    icon: (
      <Triangle
        size={22}
        strokeWidth={1.8}
        color="#fb923c"
        fill="#f97316"
        fillOpacity={0.35}
      />
    ),
    hoverBg: 'hover:bg-orange-500/15',
  },
  {
    type: 'arrow',
    label: 'Línea',
    icon: <Minus size={22} strokeWidth={2.5} color="#facc15" />,
    hoverBg: 'hover:bg-yellow-500/15',
  },
  {
    type: 'text',
    label: 'Texto',
    icon: <Type size={22} strokeWidth={1.8} color="#22d3ee" />,
    hoverBg: 'hover:bg-cyan-500/15',
  },
];

/**
 * Static horizontal toolbar for adding field annotations.
 * Intended to be placed in the main app header.
 */
export default function Toolbar({ onAdd, onClearExtras, className = 'border border-border' }: ToolbarProps) {
  return (
    <div className={`flex items-center gap-1 p-1 rounded-xl bg-transparent ${className}`}>
      {tools.map((t) => (
        <button
          key={t.type}
          id={`tool-${t.type}`}
          title={t.label}
          onClick={() => onAdd(t.type)}
          className={`flex items-center justify-center w-9 h-9 rounded-lg
                     bg-transparent ${t.hoverBg}
                     transition-all duration-150 cursor-pointer active:scale-90`}
        >
          {t.icon}
        </button>
      ))}

      {/* Divider */}
      <div className="w-px h-6 bg-white/10 mx-0.5" />

      {/* Trash bin — clears all extras */}
      <button
        id="tool-trash"
        title="Borrar extras del campo"
        onClick={onClearExtras}
        className="flex items-center justify-center w-9 h-9 rounded-lg
                   bg-transparent hover:bg-red-500/15
                   transition-all duration-150 cursor-pointer active:scale-90"
      >
        <Trash2 size={20} strokeWidth={1.8} color="#f87171" />
      </button>
    </div>
  );
}

