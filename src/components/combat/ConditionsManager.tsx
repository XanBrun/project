import React, { useState } from 'react';
import { X, Plus, AlertCircle } from 'lucide-react';
import { CONDITIONS } from '../../types';

interface ConditionsManagerProps {
  conditions: string[];
  onUpdate: (conditions: string[]) => void;
  participantName: string;
}

function ConditionsManager({ conditions, onUpdate, participantName }: ConditionsManagerProps) {
  const [showAdd, setShowAdd] = useState(false);
  const [selectedCondition, setSelectedCondition] = useState('');

  const addCondition = () => {
    if (selectedCondition && !conditions.includes(selectedCondition)) {
      onUpdate([...conditions, selectedCondition]);
      setSelectedCondition('');
      setShowAdd(false);
    }
  };

  const removeCondition = (condition: string) => {
    onUpdate(conditions.filter(c => c !== condition));
  };

  const getConditionColor = (condition: string) => {
    const colors: Record<string, string> = {
      'Blinded': 'bg-gray-100 text-gray-800 border-gray-300',
      'Charmed': 'bg-pink-100 text-pink-800 border-pink-300',
      'Deafened': 'bg-yellow-100 text-yellow-800 border-yellow-300',
      'Frightened': 'bg-purple-100 text-purple-800 border-purple-300',
      'Grappled': 'bg-orange-100 text-orange-800 border-orange-300',
      'Incapacitated': 'bg-red-100 text-red-800 border-red-300',
      'Invisible': 'bg-blue-100 text-blue-800 border-blue-300',
      'Paralyzed': 'bg-red-100 text-red-800 border-red-300',
      'Petrified': 'bg-gray-100 text-gray-800 border-gray-300',
      'Poisoned': 'bg-green-100 text-green-800 border-green-300',
      'Prone': 'bg-amber-100 text-amber-800 border-amber-300',
      'Restrained': 'bg-orange-100 text-orange-800 border-orange-300',
      'Stunned': 'bg-yellow-100 text-yellow-800 border-yellow-300',
      'Unconscious': 'bg-red-100 text-red-800 border-red-300'
    };
    return colors[condition] || 'bg-gray-100 text-gray-800 border-gray-300';
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <AlertCircle className="w-4 h-4 text-amber-600" />
          <span className="text-sm font-medium text-amber-900">Condiciones</span>
        </div>
        <button
          onClick={() => setShowAdd(!showAdd)}
          className="p-1 text-amber-600 hover:bg-amber-100 rounded transition-colors"
        >
          <Plus size={16} />
        </button>
      </div>

      {/* Current Conditions */}
      {conditions.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {conditions.map((condition, index) => (
            <div
              key={index}
              className={`flex items-center space-x-1 px-2 py-1 rounded-full text-xs font-medium border ${getConditionColor(condition)}`}
            >
              <span>{condition}</span>
              <button
                onClick={() => removeCondition(condition)}
                className="hover:bg-black/10 rounded-full p-0.5 transition-colors"
              >
                <X size={12} />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Add Condition */}
      {showAdd && (
        <div className="flex items-center space-x-2 p-2 bg-amber-50 rounded-lg border border-amber-200">
          <select
            value={selectedCondition}
            onChange={(e) => setSelectedCondition(e.target.value)}
            className="flex-1 p-2 border border-amber-300 rounded text-sm focus:ring-2 focus:ring-amber-500"
          >
            <option value="">Seleccionar condición...</option>
            {CONDITIONS.filter(c => !conditions.includes(c)).map(condition => (
              <option key={condition} value={condition}>
                {condition}
              </option>
            ))}
          </select>
          <button
            onClick={addCondition}
            disabled={!selectedCondition}
            className="px-3 py-2 bg-green-600 text-white rounded text-sm hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            Agregar
          </button>
          <button
            onClick={() => {
              setShowAdd(false);
              setSelectedCondition('');
            }}
            className="px-3 py-2 bg-gray-600 text-white rounded text-sm hover:bg-gray-700 transition-colors"
          >
            Cancelar
          </button>
        </div>
      )}

      {conditions.length === 0 && !showAdd && (
        <p className="text-xs text-amber-600 italic">Sin condiciones activas</p>
      )}
    </div>
  );
}

export default ConditionsManager;
