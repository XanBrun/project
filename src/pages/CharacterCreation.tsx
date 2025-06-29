import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, Dice6, Shield, Heart, Zap, Book, Save, ArrowLeft, Coins } from 'lucide-react';
import { saveCharacter, generateId } from '../services/db';
import { Character, CHARACTER_CLASSES, CHARACTER_RACES, SKILLS, Currency } from '../types';

const BACKGROUNDS = [
  'Acolyte', 'Criminal', 'Folk Hero', 'Noble', 'Sage', 'Soldier',
  'Charlatan', 'Entertainer', 'Guild Artisan', 'Hermit', 'Outlander', 'Sailor'
] as const;

const ALIGNMENTS = [
  'Lawful Good', 'Neutral Good', 'Chaotic Good',
  'Lawful Neutral', 'True Neutral', 'Chaotic Neutral',
  'Lawful Evil', 'Neutral Evil', 'Chaotic Evil'
] as const;

function CharacterCreation() {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);
  const [character, setCharacter] = useState<Partial<Character>>({
    name: '',
    class: 'Fighter',
    level: 1,
    race: 'Human',
    background: 'Folk Hero',
    alignment: 'Neutral Good',
    stats: {
      strength: 10,
      dexterity: 10,
      constitution: 10,
      intelligence: 10,
      wisdom: 10,
      charisma: 10
    },
    hitPoints: {
      current: 10,
      maximum: 10,
      temporary: 0
    },
    armorClass: 10,
    proficiencyBonus: 2,
    skills: {},
    equipment: [],
    spells: [],
    notes: '',
    currency: {
      copper: 0,
      silver: 0,
      electrum: 0,
      gold: 100,
      platinum: 0
    }
  });

  const [pointBuy, setPointBuy] = useState({
    strength: 8,
    dexterity: 8,
    constitution: 8,
    intelligence: 8,
    wisdom: 8,
    charisma: 8,
    remainingPoints: 27
  });

  const steps = [
    { number: 1, title: 'Información Básica', icon: User },
    { number: 2, title: 'Estadísticas', icon: Dice6 },
    { number: 3, title: 'Habilidades', icon: Book },
    { number: 4, title: 'Equipo & Finalizar', icon: Shield }
  ];

  // Calculate modifier from ability score
  const getModifier = (score: number) => Math.floor((score - 10) / 2);

  // Calculate point cost for point buy system
  const getPointCost = (score: number) => {
    if (score <= 8) return 0;
    if (score <= 13) return score - 8;
    if (score === 14) return 7;
    if (score === 15) return 9;
    return 0;
  };

  // Update point buy and character stats
  const updateStat = (stat: keyof typeof pointBuy, value: number) => {
    if (stat === 'remainingPoints') return;
    
    const oldCost = getPointCost(pointBuy[stat]);
    const newCost = getPointCost(value);
    const costDifference = newCost - oldCost;
    
    if (pointBuy.remainingPoints - costDifference >= 0 && value >= 8 && value <= 15) {
      const newPointBuy = {
        ...pointBuy,
        [stat]: value,
        remainingPoints: pointBuy.remainingPoints - costDifference
      };
      setPointBuy(newPointBuy);
      
      setCharacter(prev => ({
        ...prev,
        stats: {
          ...prev.stats!,
          [stat]: value
        }
      }));
    }
  };

  // Calculate derived stats
  useEffect(() => {
    const constitution = character.stats?.constitution || 10;
    const constitutionModifier = getModifier(constitution);
    const baseHP = character.class === 'Barbarian' ? 12 : 
                   character.class === 'Fighter' || character.class === 'Paladin' || character.class === 'Ranger' ? 10 :
                   character.class === 'Bard' || character.class === 'Cleric' || character.class === 'Druid' || 
                   character.class === 'Monk' || character.class === 'Rogue' || character.class === 'Warlock' ? 8 : 6;
    
    const maxHP = baseHP + constitutionModifier + (character.level! - 1) * (Math.floor(baseHP / 2) + 1 + constitutionModifier);
    
    setCharacter(prev => ({
      ...prev,
      hitPoints: {
        current: maxHP,
        maximum: maxHP,
        temporary: 0
      },
      armorClass: 10 + getModifier(prev.stats?.dexterity || 10),
      proficiencyBonus: Math.ceil((character.level || 1) / 4) + 1
    }));
  }, [character.stats, character.class, character.level]);

  const handleInputChange = (field: string, value: any) => {
    setCharacter(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleCurrencyChange = (currencyType: keyof Currency, value: number) => {
    setCharacter(prev => ({
      ...prev,
      currency: {
        ...prev.currency!,
        [currencyType]: Math.max(0, value)
      }
    }));
  };

  const handleSkillToggle = (skill: string) => {
    setCharacter(prev => ({
      ...prev,
      skills: {
        ...prev.skills,
        [skill]: !prev.skills?.[skill]
      }
    }));
  };

  const handleSaveCharacter = async () => {
    try {
      const newCharacter: Character = {
        id: generateId(),
        name: character.name || 'Unnamed Character',
        class: character.class!,
        level: character.level!,
        race: character.race!,
        background: character.background!,
        alignment: character.alignment!,
        stats: character.stats!,
        hitPoints: character.hitPoints!,
        armorClass: character.armorClass!,
        proficiencyBonus: character.proficiencyBonus!,
        skills: character.skills!,
        equipment: character.equipment!,
        spells: character.spells,
        notes: character.notes!,
        currency: character.currency!,
        createdAt: Date.now(),
        updatedAt: Date.now()
      };

      await saveCharacter(newCharacter);
      navigate(`/character/${newCharacter.id}`);
    } catch (error) {
      console.error('Error saving character:', error);
      alert('Error al guardar el personaje');
    }
  };

  const renderStep1 = () => (
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

  const renderStep2 = () => (
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
                    onClick={() => updateStat(stat as keyof typeof pointBuy, value - 1)}
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
                    onClick={() => updateStat(stat as keyof typeof pointBuy, value + 1)}
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

  const renderStep3 = () => (
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

  const renderStep4 = () => (
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

  return (
    <div className="max-w-4xl mx-auto">
      <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl border border-amber-200">
        {/* Header */}
        <div className="p-6 border-b border-amber-200">
          <div className="flex items-center justify-between mb-4">
            <button
              onClick={() => navigate(-1)}
              className="flex items-center space-x-2 text-amber-700 hover:text-amber-900 transition-colors"
            >
              <ArrowLeft size={20} />
              <span>Volver</span>
            </button>
            <h1 className="text-3xl font-bold text-amber-900">Crear Personaje</h1>
            <div></div>
          </div>

          {/* Progress Steps */}
          <div className="flex items-center justify-between">
            {steps.map((step, index) => {
              const Icon = step.icon;
              const isActive = currentStep === step.number;
              const isCompleted = currentStep > step.number;
              
              return (
                <div key={step.number} className="flex items-center">
                  <div className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-all ${
                    isActive ? 'bg-amber-600 text-white' :
                    isCompleted ? 'bg-green-600 text-white' :
                    'bg-amber-100 text-amber-700'
                  }`}>
                    <Icon size={20} />
                    <span className="font-medium">{step.title}</span>
                  </div>
                  {index < steps.length - 1 && (
                    <div className={`w-8 h-1 mx-2 ${
                      isCompleted ? 'bg-green-600' : 'bg-amber-200'
                    }`} />
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          {currentStep === 1 && renderStep1()}
          {currentStep === 2 && renderStep2()}
          {currentStep === 3 && renderStep3()}
          {currentStep === 4 && renderStep4()}
        </div>

        {/* Navigation */}
        <div className="p-6 border-t border-amber-200 flex justify-between">
          <button
            onClick={() => setCurrentStep(Math.max(1, currentStep - 1))}
            disabled={currentStep === 1}
            className="px-6 py-2 bg-gray-600 text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-700 transition-colors"
          >
            Anterior
          </button>

          {currentStep < 4 ? (
            <button
              onClick={() => setCurrentStep(Math.min(4, currentStep + 1))}
              disabled={currentStep === 1 && !character.name}
              className="px-6 py-2 bg-amber-600 text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-amber-700 transition-colors"
            >
              Siguiente
            </button>
          ) : (
            <button
              onClick={handleSaveCharacter}
              disabled={!character.name}
              className="flex items-center space-x-2 px-6 py-2 bg-green-600 text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-green-700 transition-colors"
            >
              <Save size={20} />
              <span>Crear Personaje</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

export default CharacterCreation;