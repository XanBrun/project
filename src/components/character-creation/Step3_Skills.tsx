import React from 'react';
import { Character, SKILLS } from '../../types';

interface Props {
  character: Partial<Character>;
  handleSkillToggle: (skill: string) => void;
  getModifier: (score: number) => number;
}

const Step3_Skills: React.FC<Props> = ({ character, handleSkillToggle, getModifier }) => {
  return (
    <div className="space-y-6">
      <div className="bg-amber-50 rounded-lg p-4 border border-amber-200">
        <h3 className="text-lg font-bold text-amber-900 mb-2">Competencias en Habilidades</h3>
        <p className="text-amber-700 text-sm">
          Selecciona las habilidades en las que tu personaje es competente.
          Estas dependen de tu clase y trasfondo.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {SKILLS.map(skill => {
          const isSelected = character.skills?.[skill] || false;
          const relatedStat =
            ['Athletics'].includes(skill) ? 'strength' :
            ['Acrobatics', 'Sleight of Hand', 'Stealth'].includes(skill) ? 'dexterity' :
            ['Arcana', 'History', 'Investigation', 'Nature', 'Religion'].includes(skill) ? 'intelligence' :
            ['Animal Handling', 'Insight', 'Medicine', 'Perception', 'Survival'].includes(skill) ? 'wisdom' :
            'charisma';

          const statValue = character.stats?.[relatedStat as keyof typeof character.stats] || 10;
          const modifier = getModifier(statValue);
          const totalBonus = modifier + (isSelected ? (character.proficiencyBonus || 2) : 0);

          return (
            <div
              key={skill}
              onClick={() => handleSkillToggle(skill)}
              className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
                isSelected
                  ? 'border-amber-500 bg-amber-50'
                  : 'border-amber-200 bg-white hover:border-amber-300'
              }`}
            >
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-medium text-amber-900">{skill}</div>
                  <div className="text-sm text-amber-600 capitalize">
                    {relatedStat} {totalBonus >= 0 ? '+' : ''}{totalBonus}
                  </div>
                </div>
                <div className={`w-6 h-6 rounded-full border-2 ${
                  isSelected ? 'bg-amber-500 border-amber-500' : 'border-amber-300'
                }`}>
                  {isSelected && (
                    <div className="w-full h-full flex items-center justify-center">
                      <div className="w-2 h-2 bg-white rounded-full"></div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default Step3_Skills;
