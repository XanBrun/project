import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { saveCharacter, generateId } from '../services/db';
import { Character, Currency } from '../types';

export const useCharacterCreation = () => {
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

  return {
    currentStep,
    setCurrentStep,
    character,
    pointBuy,
    getModifier,
    getPointCost,
    updateStat,
    handleInputChange,
    handleCurrencyChange,
    handleSkillToggle,
    handleSaveCharacter
  };
};
