import React from 'react';
import { Character } from '../../types';
import { Heart, Shield, Zap } from 'lucide-react';

interface PointBuy {
  strength: number;
  dexterity: number;
  constitution: number;
  intelligence: number;
  wisdom: number;
  charisma: number;
  remainingPoints: number;
}

interface Props {
  character: Partial<Character>;
  pointBuy: PointBuy;
  updateStat: (stat: keyof PointBuy, value: number) => void;
  getModifier: (score: number) => number;
  getPointCost: (score: number) => number;
}

const Step2_Stats: React.FC<Props> = ({ character, pointBuy, updateStat, getModifier, getPointCost }) => {
  return (
    <div className="space-y-6">
      <div className="bg-amber-50 rounded-lg p-4 border border-amber-200">
        <h3 className="text-lg font-bold text-amber-900 mb-2">Sistema Point Buy</h3>
        <p className="text-amber-700 text-sm mb-4">
          Tienes 27 puntos para distribuir. Cada estadística comienza en 8.
        </p>
        <div className="text-center">
          <span className="text-2xl font-bold text-amber-900">
            Puntos restantes: {pointBuy.remainingPoints}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {Object.entries(pointBuy).map(([stat, value]) => {
          if (stat === 'remainingPoints') return null;

          const statName = stat.charAt(0).toUpperCase() + stat.slice(1);
          const modifier = getModifier(value);

          return (
            <div key={stat} className="bg-white rounded-lg p-4 border border-amber-200 shadow-sm">
              <div className="text-center">
                <h4 className="font-bold text-amber-900 mb-2">{statName}</h4>
                <div className="flex items-center justify-center space-x-2 mb-3">
                  <button
                    onClick={() => updateStat(stat as keyof PointBuy, value - 1)}
                    disabled={value <= 8}
                    className="w-8 h-8 bg-red-500 text-white rounded-full disabled:opacity-50 disabled:cursor-not-allowed hover:bg-red-600 transition-colors"
                  >
                    -
                  </button>
                  <div className="w-16 text-center">
                    <div className="text-2xl font-bold text-amber-900">{value}</div>
                    <div className="text-sm text-amber-600">
                      {modifier >= 0 ? '+' : ''}{modifier}
                    </div>
                  </div>
                  <button
                    onClick={() => updateStat(stat as keyof PointBuy, value + 1)}
                    disabled={value >= 15 || pointBuy.remainingPoints - (getPointCost(value + 1) - getPointCost(value)) < 0}
                    className="w-8 h-8 bg-green-500 text-white rounded-full disabled:opacity-50 disabled:cursor-not-allowed hover:bg-green-600 transition-colors"
                  >
                    +
                  </button>
                </div>
                <div className="text-xs text-amber-600">
                  Costo: {getPointCost(value)} puntos
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="bg-white rounded-lg p-6 border border-amber-200">
        <h3 className="text-lg font-bold text-amber-900 mb-4">Estadísticas Derivadas</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="text-center p-4 bg-red-50 rounded-lg">
            <Heart className="w-8 h-8 text-red-600 mx-auto mb-2" />
            <div className="font-bold text-red-900">Puntos de Vida</div>
            <div className="text-2xl font-bold text-red-800">{character.hitPoints?.maximum}</div>
          </div>
          <div className="text-center p-4 bg-blue-50 rounded-lg">
            <Shield className="w-8 h-8 text-blue-600 mx-auto mb-2" />
            <div className="font-bold text-blue-900">Clase de Armadura</div>
            <div className="text-2xl font-bold text-blue-800">{character.armorClass}</div>
          </div>
          <div className="text-center p-4 bg-purple-50 rounded-lg">
            <Zap className="w-8 h-8 text-purple-600 mx-auto mb-2" />
            <div className="font-bold text-purple-900">Bonificador de Competencia</div>
            <div className="text-2xl font-bold text-purple-800">+{character.proficiencyBonus}</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Step2_Stats;
