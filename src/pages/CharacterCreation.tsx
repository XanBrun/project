import React from 'react';
import { useNavigate } from 'react-router-dom';
import { User, Dice6, Book, Shield, Save, ArrowLeft } from 'lucide-react';

import { useCharacterCreation } from '../hooks/useCharacterCreation';
import Step1_BasicInfo from '../components/character-creation/Step1_BasicInfo';
import Step2_Stats from '../components/character-creation/Step2_Stats';
import Step3_Skills from '../components/character-creation/Step3_Skills';
import Step4_EquipmentAndFinalize from '../components/character-creation/Step4_EquipmentAndFinalize';

const steps = [
  { number: 1, title: 'Información Básica', icon: User },
  { number: 2, title: 'Estadísticas', icon: Dice6 },
  { number: 3, title: 'Habilidades', icon: Book },
  { number: 4, title: 'Equipo & Finalizar', icon: Shield }
];

function CharacterCreation() {
  const navigate = useNavigate();
  const {
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
  } = useCharacterCreation();

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return <Step1_BasicInfo character={character} handleInputChange={handleInputChange} />;
      case 2:
        return <Step2_Stats character={character} pointBuy={pointBuy} updateStat={updateStat} getModifier={getModifier} getPointCost={getPointCost} />;
      case 3:
        return <Step3_Skills character={character} handleSkillToggle={handleSkillToggle} getModifier={getModifier} />;
      case 4:
        return <Step4_EquipmentAndFinalize character={character} handleInputChange={handleInputChange} handleCurrencyChange={handleCurrencyChange} />;
      default:
        return null;
    }
  };

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
          {renderStepContent()}
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