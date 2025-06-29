import React, { useState, useEffect } from 'react';
import { Plus, Minus, RefreshCw, History, Dice1, Dice2, Dice3, Dice4, Dice5, Dice6 } from 'lucide-react';
import { rollDice, loadDiceRolls } from '../services/db';
import { DiceRoll } from '../types';

const diceTypes = [4, 6, 8, 10, 12, 20, 100];

interface DiceSelectionState {
  [key: number]: number;
}

const DiceIcon = ({ value }: { value: number }) => {
  const icons = {
    1: Dice1,
    2: Dice2,
    3: Dice3,
    4: Dice4,
    5: Dice5,
    6: Dice6
  };
  
  const Icon = icons[Math.min(value, 6) as keyof typeof icons] || Dice6;
  return <Icon className="w-8 h-8" />;
};

function DiceRoller() {
  const [selectedDice, setSelectedDice] = useState<DiceSelectionState>({});
  const [modifier, setModifier] = useState(0);
  const [rollResults, setRollResults] = useState<any | null>(null);
  const [isRolling, setIsRolling] = useState(false);
  const [history, setHistory] = useState<DiceRoll[]>([]);
  const [showHistory, setShowHistory] = useState(false);
  
  useEffect(() => {
    loadHistory();
  }, []);

  const loadHistory = async () => {
    const rolls = await loadDiceRolls();
    setHistory(rolls);
  };
  
  const updateDiceCount = (diceType: number, increment: boolean) => {
    setSelectedDice(prev => {
      const currentCount = prev[diceType] || 0;
      const newCount = increment ? currentCount + 1 : Math.max(0, currentCount - 1);
      
      if (newCount === 0) {
        const newState = { ...prev };
        delete newState[diceType];
        return newState;
      }
      
      return {
        ...prev,
        [diceType]: newCount
      };
    });
  };
  
  const handleRoll = async () => {
    const totalDiceCount = Object.values(selectedDice).reduce((sum, count) => sum + count, 0);
    if (totalDiceCount === 0) return;
    
    setIsRolling(true);
    setRollResults(null);
    
    // Simulate rolling animation
    setTimeout(async () => {
      const results: any = {};
      let totalSum = modifier;
      
      for (const [diceType, count] of Object.entries(selectedDice)) {
        if (count > 0) {
          const diceRoll = await rollDice(parseInt(diceType), count, 0);
          results[diceType] = diceRoll.results;
          totalSum += diceRoll.results.reduce((sum, value) => sum + value, 0);
        }
      }
      
      setRollResults({
        results,
        total: totalSum,
        modifier
      });
      
      setIsRolling(false);
      loadHistory(); // Refresh history
    }, 1000);
  };
  
  const clearSelection = () => {
    setSelectedDice({});
    setModifier(0);
    setRollResults(null);
  };
  
  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Main Dice Roller */}
      <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-8 shadow-xl border border-amber-200">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-amber-900 mb-2">Lanzador de Dados</h1>
          <p className="text-amber-700">Selecciona tus dados y lanza para la aventura</p>
        </div>
        
        {/* Dice Selection */}
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-6 mb-8">
          {diceTypes.map(diceType => (
            <div key={diceType} className="flex flex-col items-center">
              <button
                onClick={() => updateDiceCount(diceType, true)}
                className={`w-20 h-20 rounded-xl flex flex-col items-center justify-center font-bold text-white shadow-lg transform transition-all duration-200 hover:scale-110 ${
                  isRolling ? 'animate-pulse' : ''
                } ${
                  diceType === 4 ? 'bg-gradient-to-br from-blue-500 to-blue-600' :
                  diceType === 6 ? 'bg-gradient-to-br from-green-500 to-green-600' :
                  diceType === 8 ? 'bg-gradient-to-br from-yellow-500 to-yellow-600' :
                  diceType === 10 ? 'bg-gradient-to-br from-orange-500 to-orange-600' :
                  diceType === 12 ? 'bg-gradient-to-br from-red-500 to-red-600' :
                  diceType === 20 ? 'bg-gradient-to-br from-purple-500 to-purple-600' :
                  'bg-gradient-to-br from-gray-500 to-gray-600'
                }`}
              >
                <span className="text-xs">d{diceType}</span>
                <span className="text-lg">{diceType}</span>
              </button>
              
              <div className="flex items-center mt-3 bg-amber-100 rounded-lg">
                <button 
                  onClick={() => updateDiceCount(diceType, false)}
                  className="w-8 h-8 flex items-center justify-center bg-red-500 text-white rounded-l-lg hover:bg-red-600 transition-colors"
                  disabled={!selectedDice[diceType]}
                >
                  <Minus size={16} />
                </button>
                <div className="w-10 text-center font-bold text-amber-900 py-1">
                  {selectedDice[diceType] || 0}
                </div>
                <button 
                  onClick={() => updateDiceCount(diceType, true)}
                  className="w-8 h-8 flex items-center justify-center bg-green-500 text-white rounded-r-lg hover:bg-green-600 transition-colors"
                >
                  <Plus size={16} />
                </button>
              </div>
            </div>
          ))}
        </div>
        
        {/* Modifier and Controls */}
        <div className="flex flex-col md:flex-row items-center justify-between mb-8 space-y-4 md:space-y-0">
          <div className="flex items-center space-x-4">
            <span className="text-lg font-semibold text-amber-900">Modificador:</span>
            <div className="flex items-center bg-amber-100 rounded-lg">
              <button 
                onClick={() => setModifier(prev => prev - 1)}
                className="w-10 h-10 flex items-center justify-center bg-red-500 text-white rounded-l-lg hover:bg-red-600 transition-colors"
              >
                <Minus size={18} />
              </button>
              <div className="w-16 text-center font-bold text-amber-900 py-2">
                {modifier >= 0 ? `+${modifier}` : modifier}
              </div>
              <button 
                onClick={() => setModifier(prev => prev + 1)}
                className="w-10 h-10 flex items-center justify-center bg-green-500 text-white rounded-r-lg hover:bg-green-600 transition-colors"
              >
                <Plus size={18} />
              </button>
            </div>
          </div>
          
          <div className="flex space-x-3">
            <button 
              onClick={() => setShowHistory(!showHistory)}
              className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors shadow-md"
            >
              <History size={18} />
              <span>Historial</span>
            </button>
            <button 
              onClick={clearSelection}
              className="flex items-center space-x-2 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors shadow-md"
            >
              <RefreshCw size={18} />
              <span>Limpiar</span>
            </button>
            <button 
              onClick={handleRoll}
              disabled={isRolling || Object.keys(selectedDice).length === 0}
              className="flex items-center space-x-2 px-6 py-2 bg-gradient-to-r from-amber-600 to-amber-700 text-white rounded-lg hover:from-amber-700 hover:to-amber-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-md transform hover:scale-105"
            >
              <Dice6 size={18} />
              <span>{isRolling ? 'Lanzando...' : 'Lanzar Dados'}</span>
            </button>
          </div>
        </div>
        
        {/* Selected Dice Display */}
        <div className="bg-amber-50 rounded-xl p-6 border border-amber-200">
          <h3 className="text-xl font-bold text-amber-900 mb-3">Dados Seleccionados</h3>
          {Object.keys(selectedDice).length > 0 ? (
            <div className="flex flex-wrap gap-3">
              {Object.entries(selectedDice).map(([diceType, count]) => (
                count > 0 && (
                  <div key={diceType} className="bg-white px-4 py-2 rounded-lg shadow-sm border border-amber-200">
                    <span className="font-bold text-amber-900">{count}d{diceType}</span>
                  </div>
                )
              ))}
              {modifier !== 0 && (
                <div className="bg-white px-4 py-2 rounded-lg shadow-sm border border-amber-200">
                  <span className="font-bold text-amber-900">
                    {modifier >= 0 ? `+${modifier}` : modifier} (modificador)
                  </span>
                </div>
              )}
            </div>
          ) : (
            <p className="text-amber-600">No hay dados seleccionados</p>
          )}
        </div>
      </div>
      
      {/* Rolling Animation */}
      {isRolling && (
        <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-8 shadow-xl border border-amber-200 text-center">
          <div className="animate-bounce mb-4">
            <Dice6 className="w-16 h-16 text-amber-600 mx-auto" />
          </div>
          <h2 className="text-2xl font-bold text-amber-900 mb-2">Lanzando dados...</h2>
          <div className="flex justify-center space-x-2">
            <div className="w-3 h-3 bg-amber-600 rounded-full animate-pulse"></div>
            <div className="w-3 h-3 bg-amber-600 rounded-full animate-pulse" style={{animationDelay: '0.2s'}}></div>
            <div className="w-3 h-3 bg-amber-600 rounded-full animate-pulse" style={{animationDelay: '0.4s'}}></div>
          </div>
        </div>
      )}
      
      {/* Results */}
      {rollResults && !isRolling && (
        <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-8 shadow-xl border border-amber-200">
          <h2 className="text-3xl font-bold text-amber-900 mb-6 text-center">Resultados del Lanzamiento</h2>
          
          <div className="space-y-6">
            {Object.entries(rollResults.results).map(([diceType, results]: [string, any]) => (
              <div key={diceType} className="bg-amber-50 rounded-xl p-6 border border-amber-200">
                <h3 className="text-xl font-bold text-amber-900 mb-4">{results.length}d{diceType}</h3>
                <div className="flex flex-wrap gap-3 mb-4">
                  {results.map((value: number, index: number) => (
                    <div key={index} className="w-12 h-12 bg-white rounded-lg shadow-md flex items-center justify-center border-2 border-amber-300">
                      <span className="font-bold text-amber-900">{value}</span>
                    </div>
                  ))}
                </div>
                <p className="text-lg font-semibold text-amber-800">
                  Suma: <span className="text-amber-900">{results.reduce((sum: number, value: number) => sum + value, 0)}</span>
                </p>
              </div>
            ))}
            
            {rollResults.modifier !== 0 && (
              <div className="bg-blue-50 rounded-xl p-6 border border-blue-200">
                <h3 className="text-xl font-bold text-blue-900">
                  Modificador: {rollResults.modifier >= 0 ? `+${rollResults.modifier}` : rollResults.modifier}
                </h3>
              </div>
            )}
            
            <div className="text-center p-6 bg-gradient-to-r from-amber-600 to-amber-700 text-white rounded-xl shadow-lg">
              <h3 className="text-2xl font-bold mb-2">Total Final</h3>
              <p className="text-5xl font-bold">{rollResults.total}</p>
            </div>
          </div>
        </div>
      )}

      {/* History Panel */}
      {showHistory && (
        <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-8 shadow-xl border border-amber-200">
          <h2 className="text-2xl font-bold text-amber-900 mb-6">Historial de Lanzamientos</h2>
          <div className="max-h-96 overflow-y-auto space-y-3">
            {history.length > 0 ? (
              history.map((roll) => (
                <div key={roll.id} className="bg-amber-50 rounded-lg p-4 border border-amber-200">
                  <div className="flex justify-between items-center">
                    <div>
                      <span className="font-bold text-amber-900">{roll.diceType}</span>
                      <span className="text-amber-700 ml-2">
                        Resultados: {roll.results.join(', ')}
                      </span>
                      {roll.modifier !== 0 && (
                        <span className="text-amber-700 ml-2">
                          ({roll.modifier >= 0 ? '+' : ''}{roll.modifier})
                        </span>
                      )}
                    </div>
                    <div className="text-right">
                      <div className="font-bold text-amber-900">Total: {roll.total}</div>
                      <div className="text-xs text-amber-600">
                        {new Date(roll.timestamp).toLocaleTimeString()}
                      </div>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-amber-600 text-center py-8">No hay lanzamientos en el historial</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default DiceRoller;