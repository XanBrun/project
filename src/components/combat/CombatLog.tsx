import React from 'react';
import { ScrollText, Swords, Heart, Shield, Zap, User } from 'lucide-react';

interface CombatLogEntry {
  id: string;
  type: 'turn' | 'damage' | 'heal' | 'condition' | 'action';
  message: string;
  timestamp: number;
  participantName?: string;
}

interface CombatLogProps {
  entries: CombatLogEntry[];
  maxEntries?: number;
}

function CombatLog({ entries, maxEntries = 10 }: CombatLogProps) {
  const recentEntries = entries.slice(-maxEntries).reverse();

  const getIcon = (type: string) => {
    switch (type) {
      case 'turn':
        return <User className="w-4 h-4 text-blue-600" />;
      case 'damage':
        return <Swords className="w-4 h-4 text-red-600" />;
      case 'heal':
        return <Heart className="w-4 h-4 text-green-600" />;
      case 'condition':
        return <Zap className="w-4 h-4 text-yellow-600" />;
      case 'action':
        return <Shield className="w-4 h-4 text-purple-600" />;
      default:
        return <ScrollText className="w-4 h-4 text-gray-600" />;
    }
  };

  const getTextColor = (type: string) => {
    switch (type) {
      case 'turn':
        return 'text-blue-900';
      case 'damage':
        return 'text-red-900';
      case 'heal':
        return 'text-green-900';
      case 'condition':
        return 'text-yellow-900';
      case 'action':
        return 'text-purple-900';
      default:
        return 'text-gray-900';
    }
  };

  const formatTime = (timestamp: number) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
  };

  if (entries.length === 0) {
    return (
      <div className="text-center py-6">
        <ScrollText className="w-12 h-12 text-amber-400 mx-auto mb-2" />
        <p className="text-amber-600 text-sm">El registro de combate aparecerá aquí</p>
      </div>
    );
  }

  return (
    <div className="space-y-2 max-h-64 overflow-y-auto">
      {recentEntries.map((entry) => (
        <div
          key={entry.id}
          className="flex items-start space-x-3 p-2 bg-white/50 rounded-lg border border-amber-100 hover:bg-amber-50 transition-colors"
        >
          <div className="mt-0.5">{getIcon(entry.type)}</div>
          <div className="flex-1 min-w-0">
            <p className={`text-sm font-medium ${getTextColor(entry.type)}`}>
              {entry.message}
            </p>
            <p className="text-xs text-amber-600 mt-0.5">{formatTime(entry.timestamp)}</p>
          </div>
        </div>
      ))}
    </div>
  );
}

export default CombatLog;
export type { CombatLogEntry };
