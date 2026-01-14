import React, { useState, useEffect } from 'react';
import Lobby from './components/Lobby';
import CharacterSheet from './components/CharacterSheet';
import CharacterWizard from './components/CharacterWizard';
import Onboarding from './components/Onboarding';
import './index.css';

function App() {
  const [view, setView] = useState('lobby'); // lobby, wizard, sheet
  const [characters, setCharacters] = useState(() => {
    const saved = localStorage.getItem('dnd_characters');
    return saved ? JSON.parse(saved) : [];
  });
  const [activeCharacterId, setActiveCharacterId] = useState(null);
  const [showOnboarding, setShowOnboarding] = useState(() => {
    return !localStorage.getItem('dnd_onboarding_seen');
  });

  // Effect for view-only initialization (now handled in useState)
  useEffect(() => {
    // We can keep this for other one-time side effects if needed
  }, []);

  // Save characters to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('dnd_characters', JSON.stringify(characters));
    } catch (e) {
      if (e.name === 'QuotaExceededError') {
        alert('Ошибка: Память браузера переполнена! Попробуйте удалить старых персонажей или использовать картинки меньшего размера.');
      } else {
        console.error('Save error:', e);
      }
    }
  }, [characters]);

  const activeCharacter = characters.find(c => c.id === activeCharacterId);

  const [wizardStep, setWizardStep] = useState(1);

  const startCreation = () => {
    setWizardStep(1);
    setView('wizard');
  };

  const selectCharacter = (id) => {
    setActiveCharacterId(id);
    setView('sheet');
  };

  const saveNewCharacter = (char) => {
    const newChar = { ...char, id: Date.now() };
    setCharacters([...characters, newChar]);
    setActiveCharacterId(newChar.id);
    setView('sheet');
    setWizardStep(1);
  };

  const updateCharacter = (id, updates) => {
    setCharacters(characters.map(c => c.id === id ? { ...c, ...updates } : c));
  };

  const deleteCharacter = (id) => {
    if (confirm('Удалить этого персонажа?')) {
      setCharacters(characters.filter(c => c.id !== id));
      if (activeCharacterId === id) setView('lobby');
    }
  };

  const goBack = () => {
    setView('lobby');
    setActiveCharacterId(null);
    setWizardStep(1);
  };

  const handleOnboardingComplete = () => {
    setShowOnboarding(false);
    localStorage.setItem('dnd_onboarding_seen', 'true');
  };

  return (
    <div className="app-container">
      {showOnboarding && (
        <Onboarding
          onComplete={handleOnboardingComplete}
          currentView={view}
          wizardStep={wizardStep}
          charactersCount={characters.length}
        />
      )}

      {view === 'lobby' && (
        <Lobby
          characters={characters}
          onSelect={selectCharacter}
          onCreate={startCreation}
          onDelete={deleteCharacter}
          onStartOnboarding={() => setShowOnboarding(true)}
        />
      )}

      {view === 'wizard' && (
        <CharacterWizard
          onSave={saveNewCharacter}
          onCancel={goBack}
          onStepChange={setWizardStep}
        />
      )}

      {view === 'sheet' && activeCharacter && (
        <CharacterSheet
          character={activeCharacter}
          onUpdate={(updates) => updateCharacter(activeCharacterId, updates)}
          onBack={goBack}
        />
      )}
    </div>
  );
}

export default App;
