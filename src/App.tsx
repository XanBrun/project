import React, { useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useBluetoothStore } from './stores/bluetoothStore';
import Layout from './components/Layout';

// Import pages
import Home from './pages/Home';
import Characters from './pages/Characters';
import CharacterCreation from './pages/CharacterCreation';
import CharacterSheet from './pages/CharacterSheet';
import CampaignManager from './pages/CampaignManager';
import DiceRoller from './pages/DiceRoller';
import CombatTracker from './pages/CombatTracker';
import MapView from './pages/MapView';
import Shop from './pages/Shop';
import Settings from './pages/Settings';

function App() {
  const { initializeBluetoothState } = useBluetoothStore();

  useEffect(() => {
    initializeBluetoothState();
  }, [initializeBluetoothState]);

  return (
    <Routes>
      <Route path="/" element={<Layout />}>
        <Route index element={<Home />} />
        <Route path="characters" element={<Characters />} />
        <Route path="character">
          <Route path="create" element={<CharacterCreation />} />
          <Route path=":id" element={<CharacterSheet />} />
        </Route>
        <Route path="campaigns" element={<CampaignManager />} />
        <Route path="dice" element={<DiceRoller />} />
        <Route path="combat" element={<CombatTracker />} />
        <Route path="map" element={<MapView />} />
        <Route path="shop" element={<Shop />} />
        <Route path="settings" element={<Settings />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Route>
    </Routes>
  );
}

export default App;