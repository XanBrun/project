import React from 'react';
import { Character, Currency } from '../../types';
import { Coins } from 'lucide-react';

interface Props {
  character: Partial<Character>;
  handleInputChange: (field: string, value: any) => void;
  handleCurrencyChange: (currencyType: keyof Currency, value: number) => void;
}

const Step4_EquipmentAndFinalize: React.FC<Props> = ({ character, handleInputChange, handleCurrencyChange }) => {
  return (
    <div className="space-y-6">
      <div className="bg-amber-50 rounded-lg p-4 border border-amber-200">
        <h3 className="text-lg font-bold text-amber-900 mb-2">Equipo y Dinero Inicial</h3>
        <p className="text-amber-700 text-sm">
          Configura el equipo inicial y las monedas de tu personaje.
        </p>
      </div>

      {/* Currency Section */}
      <div className="bg-white rounded-lg p-6 border border-amber-200">
        <h3 className="text-lg font-bold text-amber-900 mb-4 flex items-center">
          <Coins className="w-6 h-6 mr-2" />
          Monedas Iniciales
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          <div>
            <label className="block text-sm font-medium text-amber-900 mb-2">
              Platino (pp)
            </label>
            <input
              type="number"
              min="0"
              value={character.currency?.platinum || 0}
              onChange={(e) => handleCurrencyChange('platinum', parseInt(e.target.value) || 0)}
              className="w-full p-3 border border-amber-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-amber-900 mb-2">
              Oro (gp)
            </label>
            <input
              type="number"
              min="0"
              value={character.currency?.gold || 0}
              onChange={(e) => handleCurrencyChange('gold', parseInt(e.target.value) || 0)}
              className="w-full p-3 border border-amber-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-amber-900 mb-2">
              Electrum (ep)
            </label>
            <input
              type="number"
              min="0"
              value={character.currency?.electrum || 0}
              onChange={(e) => handleCurrencyChange('electrum', parseInt(e.target.value) || 0)}
              className="w-full p-3 border border-amber-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-amber-900 mb-2">
              Plata (sp)
            </label>
            <input
              type="number"
              min="0"
              value={character.currency?.silver || 0}
              onChange={(e) => handleCurrencyChange('silver', parseInt(e.target.value) || 0)}
              className="w-full p-3 border border-amber-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-amber-900 mb-2">
              Cobre (cp)
            </label>
            <input
              type="number"
              min="0"
              value={character.currency?.copper || 0}
              onChange={(e) => handleCurrencyChange('copper', parseInt(e.target.value) || 0)}
              className="w-full p-3 border border-amber-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
            />
          </div>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-amber-900 mb-2">
          Equipo (uno por línea)
        </label>
        <textarea
          value={character.equipment?.join('\n') || ''}
          onChange={(e) => handleInputChange('equipment', e.target.value.split('\n').filter(item => item.trim()))}
          className="w-full p-3 border border-amber-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent h-32"
          placeholder="Espada larga&#10;Armadura de cuero&#10;Arco corto&#10;20 flechas&#10;Mochila"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-amber-900 mb-2">
          Notas del Personaje
        </label>
        <textarea
          value={character.notes}
          onChange={(e) => handleInputChange('notes', e.target.value)}
          className="w-full p-3 border border-amber-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent h-32"
          placeholder="Historia del personaje, personalidad, objetivos, etc."
        />
      </div>

      <div className="bg-white rounded-lg p-6 border border-amber-200">
        <h3 className="text-lg font-bold text-amber-900 mb-4">Resumen del Personaje</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          <div><strong>Nombre:</strong> {character.name || 'Sin nombre'}</div>
          <div><strong>Clase:</strong> {character.class} Nivel {character.level}</div>
          <div><strong>Raza:</strong> {character.race}</div>
          <div><strong>Trasfondo:</strong> {character.background}</div>
          <div><strong>Alineamiento:</strong> {character.alignment}</div>
          <div><strong>Puntos de Vida:</strong> {character.hitPoints?.maximum}</div>
          <div><strong>Clase de Armadura:</strong> {character.armorClass}</div>
          <div><strong>Habilidades:</strong> {Object.entries(character.skills || {}).filter(([_, selected]) => selected).length}</div>
        </div>
      </div>
    </div>
  );
};

export default Step4_EquipmentAndFinalize;
