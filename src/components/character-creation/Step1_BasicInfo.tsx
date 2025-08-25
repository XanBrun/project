import React from 'react';
import { Character, CHARACTER_CLASSES, CHARACTER_RACES } from '../../types';

const BACKGROUNDS = [
  'Acolyte', 'Criminal', 'Folk Hero', 'Noble', 'Sage', 'Soldier',
  'Charlatan', 'Entertainer', 'Guild Artisan', 'Hermit', 'Outlander', 'Sailor'
] as const;

const ALIGNMENTS = [
  'Lawful Good', 'Neutral Good', 'Chaotic Good',
  'Lawful Neutral', 'True Neutral', 'Chaotic Neutral',
  'Lawful Evil', 'Neutral Evil', 'Chaotic Evil'
] as const;

interface Props {
  character: Partial<Character>;
  handleInputChange: (field: string, value: any) => void;
}

const Step1_BasicInfo: React.FC<Props> = ({ character, handleInputChange }) => {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-amber-900 mb-2">
            Nombre del Personaje *
          </label>
          <input
            type="text"
            value={character.name}
            onChange={(e) => handleInputChange('name', e.target.value)}
            className="w-full p-3 border border-amber-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
            placeholder="Ingresa el nombre de tu héroe"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-amber-900 mb-2">
            Nivel
          </label>
          <select
            value={character.level}
            onChange={(e) => handleInputChange('level', parseInt(e.target.value))}
            className="w-full p-3 border border-amber-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
          >
            {Array.from({ length: 20 }, (_, i) => i + 1).map(level => (
              <option key={level} value={level}>Nivel {level}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-amber-900 mb-2">
            Clase *
          </label>
          <select
            value={character.class}
            onChange={(e) => handleInputChange('class', e.target.value)}
            className="w-full p-3 border border-amber-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
          >
            {CHARACTER_CLASSES.map(cls => (
              <option key={cls} value={cls}>{cls}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-amber-900 mb-2">
            Raza *
          </label>
          <select
            value={character.race}
            onChange={(e) => handleInputChange('race', e.target.value)}
            className="w-full p-3 border border-amber-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
          >
            {CHARACTER_RACES.map(race => (
              <option key={race} value={race}>{race}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-amber-900 mb-2">
            Trasfondo
          </label>
          <select
            value={character.background}
            onChange={(e) => handleInputChange('background', e.target.value)}
            className="w-full p-3 border border-amber-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
          >
            {BACKGROUNDS.map(bg => (
              <option key={bg} value={bg}>{bg}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-amber-900 mb-2">
            Alineamiento
          </label>
          <select
            value={character.alignment}
            onChange={(e) => handleInputChange('alignment', e.target.value)}
            className="w-full p-3 border border-amber-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
          >
            {ALIGNMENTS.map(alignment => (
              <option key={alignment} value={alignment}>{alignment}</option>
            ))}
          </select>
        </div>
      </div>
    </div>
  );
};

export default Step1_BasicInfo;
