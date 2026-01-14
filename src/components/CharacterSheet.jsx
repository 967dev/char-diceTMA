import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Sword, Scroll, BookOpen, Shield, Heart, Dice5, Coffee, Plus, Minus, Edit3, Download, Trash2, Package, FileJson } from 'lucide-react';
import DiceRoller from './DiceRoller';

const CharacterSheet = ({ character, onUpdate, onBack }) => {
    const [activeTab, setActiveTab] = useState('main'); // main, combat, notes
    const [isDiceOpen, setIsDiceOpen] = useState(false);
    const [hpPopup, setHpPopup] = useState(false);

    const calculateMod = (score) => Math.floor((score - 10) / 2);

    const handleHpChange = (amount) => {
        const newHp = Math.min(character.hpMax, Math.max(0, (character.hpCurrent || character.hpMax) + amount));
        onUpdate({ hpCurrent: newHp });
    };

    const handleLongRest = () => {
        if (confirm('Начать долгий отдых? Это восстановит все хиты и ячейки заклинаний.')) {
            onUpdate({
                hpCurrent: character.hpMax,
                tempHp: 0,
                spellSlots: { 1: 3, 2: 0, 3: 0 }
            });
            alert('Вы отлично выспались! Силы восстановлены.');
        }
    };

    const toggleSpellSlot = (level, index) => {
        const slots = { ...(character.spellSlots || { 1: 3, 2: 0, 3: 0 }) };
        if (slots[level] >= index) {
            slots[level] = index - 1;
        } else {
            slots[level] = index;
        }
        onUpdate({ spellSlots: slots });
    };

    const addEquipment = () => {
        const newEquipment = [...(character.equipment || []), { id: Date.now(), item: '', damage: '', effect: '' }];
        onUpdate({ equipment: newEquipment });
    };

    const updateEquipment = (id, field, value) => {
        const newEquipment = character.equipment.map(e => e.id === id ? { ...e, [field]: value } : e);
        onUpdate({ equipment: newEquipment });
    };

    const deleteEquipment = (id) => {
        const newEquipment = character.equipment.filter(e => e.id !== id);
        onUpdate({ equipment: newEquipment });
    };

    const exportToText = () => {
        const statsText = Object.entries(character.stats)
            .map(([name, val]) => `${name}: ${val} (мод. ${calculateMod(val) >= 0 ? '+' : ''}${calculateMod(val)})`)
            .join('\n');

        const text = `ЛИСТ ПЕРСОНАЖА: ${character.name}\n` +
            `==========================\n` +
            `Раса: ${character.race}\n` +
            `Класс: ${character.class}\n` +
            `Уровень: ${character.level}\n\n` +
            `ХАРАКТЕРИСТИКИ:\n${statsText}\n\n` +
            `КД: ${character.ac}\n` +
            `Хиты: ${character.hpCurrent ?? character.hpMax} / ${character.hpMax}\n\n` +
            `НАВЫКИ:\n${character.skills.join(', ')}\n\n` +
            `ЗАМЕТКИ:\n${character.notes || 'Нет заметок'}\n\n` +
            `Создано в D&D TMA - ${new Date().toLocaleDateString()}`;

        const blob = new Blob([text], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${character.name}_sheet.txt`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    };

    const exportToJson = () => {
        const dataStr = JSON.stringify(character, null, 2);
        const blob = new Blob([dataStr], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${character.name}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    };

    return (
        <div className="character-sheet animate-fade-in" style={{ display: 'flex', flexDirection: 'column', height: '100vh', position: 'relative' }}>
            {/* Sticky Header */}
            <header className="glass" style={{
                position: 'sticky', top: 0, zIndex: 100, padding: '15px 20px',
                display: 'flex', alignItems: 'center', gap: '15px', borderBottom: '1px solid var(--border-color)'
            }}>
                <button onClick={onBack} style={{ padding: '8px', background: 'transparent' }}><ArrowLeft /></button>
                <div style={{ flex: 1 }}>
                    <h2 style={{ fontSize: '18px', fontWeight: '600' }}>{character.name}</h2>
                    <p style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>{character.race} {character.class}, {character.level} ур.</p>
                </div>
                <div style={{ display: 'flex', gap: '5px' }}>
                    <button
                        onClick={exportToJson}
                        style={{ padding: '8px', background: 'transparent', color: 'var(--accent-color)' }}
                        title="Экспорт в JSON"
                    >
                        <FileJson size={20} />
                    </button>
                    <button
                        onClick={exportToText}
                        style={{ padding: '8px', background: 'transparent', color: 'var(--text-secondary)' }}
                        title="Экспорт в TXT"
                    >
                        <Download size={20} />
                    </button>
                </div>
                <div
                    onClick={() => setHpPopup(true)}
                    className="hp-trigger"
                    style={{
                        display: 'flex', alignItems: 'center', gap: '8px', background: 'rgba(239, 83, 80, 0.1)',
                        padding: '4px 12px', borderRadius: '20px', border: '1px solid rgba(239, 83, 80, 0.3)',
                        cursor: 'pointer'
                    }}
                >
                    <Heart size={16} color="var(--hp-color)" fill="var(--hp-color)" />
                    <span style={{ fontWeight: 'bold' }}>{character.hpCurrent ?? character.hpMax} / {character.hpMax}</span>
                </div>
            </header>

            {/* Main Content Areas */}
            <main style={{ flex: 1, overflowY: 'auto', padding: '20px' }} className="safe-area-bottom">
                <AnimatePresence mode="wait">
                    {activeTab === 'main' && (
                        <motion.div key="main" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                            {/* Stats Grid */}
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px', marginBottom: '25px' }}>
                                {Object.entries(character.stats).map(([name, val]) => (
                                    <div
                                        key={name} className="glass stat-block"
                                        onClick={() => setIsDiceOpen(true)}
                                        style={{ padding: '12px', borderRadius: '16px', textAlign: 'center', cursor: 'pointer' }}
                                    >
                                        <span style={{ fontSize: '10px', color: 'var(--text-secondary)', display: 'block', textTransform: 'uppercase' }}>{name.substring(0, 3)}</span>
                                        <span style={{ fontSize: '24px', fontWeight: 'bold', display: 'block', margin: '4px 0' }}>
                                            {calculateMod(val) >= 0 ? '+' : ''}{calculateMod(val)}
                                        </span>
                                        <span style={{ fontSize: '12px', opacity: 0.5 }}>{val}</span>
                                    </div>
                                ))}
                            </div>

                            {/* Inspiration & Proficiency */}
                            <div style={{ display: 'flex', gap: '10px', marginBottom: '25px' }}>
                                <div
                                    className="glass"
                                    onClick={() => onUpdate({ inspiration: !character.inspiration })}
                                    style={{ flex: 1, padding: '12px', borderRadius: '16px', display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer' }}
                                >
                                    <div style={{ width: '12px', height: '12px', borderRadius: '6px', border: '2px solid var(--accent-color)', backgroundColor: character.inspiration ? 'var(--accent-color)' : 'transparent' }} />
                                    <span style={{ fontSize: '14px' }}>Вдохновение</span>
                                </div>
                                <div className="glass" style={{ flex: 1, padding: '12px', borderRadius: '16px', display: 'flex', alignItems: 'center', gap: '10px', justifyContent: 'center' }}>
                                    <span style={{ fontSize: '14px', color: 'var(--text-secondary)' }}>Бонус мастерства:</span>
                                    <span style={{ fontWeight: 'bold' }}>+2</span>
                                </div>
                            </div>

                            {/* Skills */}
                            <h3 style={{ fontSize: '16px', marginBottom: '15px' }}>Навыки</h3>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                {character.skills.map(skill => (
                                    <div key={skill} className="glass" style={{ padding: '10px 15px', borderRadius: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                            <div style={{ width: '6px', height: '6px', borderRadius: '3px', backgroundColor: 'var(--accent-color)' }} />
                                            <span style={{ fontSize: '14px' }}>{skill}</span>
                                        </div>
                                        <span style={{ fontWeight: 'bold', fontSize: '14px' }}>+2</span>
                                    </div>
                                ))}
                            </div>

                            {/* Equipment Section */}
                            <div style={{ marginTop: '30px', marginBottom: '25px' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
                                    <h3 style={{ fontSize: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                        <Package size={18} color="var(--accent-color)" /> Снаряжение
                                    </h3>
                                    <button
                                        onClick={addEquipment}
                                        style={{
                                            padding: '4px 12px', fontSize: '12px', background: 'rgba(255,183,77,0.1)',
                                            color: 'var(--accent-color)', border: '1px solid var(--accent-color)', borderRadius: '8px'
                                        }}
                                    >
                                        + Добавить
                                    </button>
                                </div>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                                    {(character.equipment || []).map(item => (
                                        <div key={item.id} className="glass" style={{ padding: '15px', borderRadius: '16px', position: 'relative' }}>
                                            <button
                                                onClick={() => deleteEquipment(item.id)}
                                                style={{ position: 'absolute', top: '10px', right: '10px', background: 'transparent', color: 'rgba(255,255,255,0.3)', padding: '5px' }}
                                            >
                                                <Trash2 size={16} />
                                            </button>
                                            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                                                <div>
                                                    <label style={{ fontSize: '10px', color: 'var(--text-secondary)', textTransform: 'uppercase', marginBottom: '4px', display: 'block' }}>Предмет</label>
                                                    <input
                                                        value={item.item}
                                                        onChange={e => updateEquipment(item.id, 'item', e.target.value)}
                                                        placeholder="Напр. Световой меч"
                                                        style={{ width: '100%', background: 'transparent', border: 'none', borderBottom: '1px solid var(--border-color)', color: 'white', fontSize: '14px', outline: 'none' }}
                                                    />
                                                </div>
                                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '15px' }}>
                                                    <div>
                                                        <label style={{ fontSize: '10px', color: 'var(--text-secondary)', textTransform: 'uppercase', marginBottom: '4px', display: 'block' }}>Урон</label>
                                                        <input
                                                            value={item.damage}
                                                            onChange={e => updateEquipment(item.id, 'damage', e.target.value)}
                                                            placeholder="1d8"
                                                            style={{ width: '100%', background: 'transparent', border: 'none', borderBottom: '1px solid var(--border-color)', color: 'white', fontSize: '14px', outline: 'none' }}
                                                        />
                                                    </div>
                                                    <div>
                                                        <label style={{ fontSize: '10px', color: 'var(--text-secondary)', textTransform: 'uppercase', marginBottom: '4px', display: 'block' }}>Эффект</label>
                                                        <input
                                                            value={item.effect}
                                                            onChange={e => updateEquipment(item.id, 'effect', e.target.value)}
                                                            placeholder="Магический, +1"
                                                            style={{ width: '100%', background: 'transparent', border: 'none', borderBottom: '1px solid var(--border-color)', color: 'white', fontSize: '14px', outline: 'none' }}
                                                        />
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                    {(!character.equipment || character.equipment.length === 0) && (
                                        <div style={{ textAlign: 'center', padding: '20px', color: 'var(--text-secondary)', fontSize: '14px', border: '1px dashed var(--border-color)', borderRadius: '16px' }}>
                                            Список снаряжения пуст
                                        </div>
                                    )}
                                </div>
                            </div>
                        </motion.div>
                    )}

                    {activeTab === 'combat' && (
                        <motion.div key="combat" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginBottom: '25px' }}>
                                <div className="glass" style={{ padding: '20px', borderRadius: '16px', textAlign: 'center' }}>
                                    <Shield size={24} color="var(--accent-color)" style={{ marginBottom: '8px' }} />
                                    <span style={{ display: 'block', fontSize: '12px', color: 'var(--text-secondary)' }}>КД</span>
                                    <span style={{ fontSize: '24px', fontWeight: 'bold' }}>{character.ac}</span>
                                </div>
                                <div className="glass" style={{ padding: '20px', borderRadius: '16px', textAlign: 'center' }}>
                                    <Dice5 size={24} color="var(--accent-secondary)" style={{ marginBottom: '8px' }} />
                                    <span style={{ display: 'block', fontSize: '12px', color: 'var(--text-secondary)' }}>Инициатива</span>
                                    <span style={{ fontSize: '24px', fontWeight: 'bold' }}>+2</span>
                                </div>
                            </div>

                            <h3 style={{ fontSize: '16px', marginBottom: '15px' }}>Ячейки заклинаний</h3>
                            <div className="glass" style={{ padding: '20px', borderRadius: '16px', marginBottom: '25px' }}>
                                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '15px' }}>
                                    <span style={{ fontSize: '14px' }}>1-й Круг</span>
                                    <div style={{ display: 'flex', gap: '8px' }}>
                                        {[1, 2, 3].map(i => (
                                            <div
                                                key={i}
                                                onClick={() => toggleSpellSlot(1, i)}
                                                style={{
                                                    width: '24px', height: '24px', borderRadius: '12px', border: '2px solid var(--mana-color)',
                                                    backgroundColor: (character.spellSlots?.[1] ?? 3) >= i ? 'var(--mana-color)' : 'transparent',
                                                    cursor: 'pointer'
                                                }}
                                            />
                                        ))}
                                    </div>
                                </div>
                            </div>

                            <button
                                onClick={handleLongRest}
                                className="rest-btn"
                                style={{
                                    width: '100%', padding: '15px', borderRadius: '16px', display: 'flex',
                                    alignItems: 'center', justifyContent: 'center', gap: '12px', background: 'var(--card-bg)', border: '1px solid var(--accent-secondary)', color: 'var(--accent-secondary)'
                                }}
                            >
                                <Coffee size={20} /> Долгий Отдых
                            </button>
                        </motion.div>
                    )}

                    {activeTab === 'notes' && (
                        <motion.div key="notes" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                            <div className="glass" style={{ padding: '20px', borderRadius: '16px', minHeight: '300px' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '15px', color: 'var(--text-secondary)' }}>
                                    <Edit3 size={18} />
                                    <span>Заметки приключенца</span>
                                </div>
                                <textarea
                                    value={character.notes || ''}
                                    onChange={(e) => onUpdate({ notes: e.target.value })}
                                    placeholder="Записывайте здесь важные события, имена NPC и зацепки..."
                                    style={{
                                        width: '100%', height: '250px', background: 'transparent', border: 'none', color: 'white',
                                        resize: 'none', fontSize: '16px', lineHeight: '1.6', outline: 'none'
                                    }}
                                />
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </main>

            {/* HP Adjustment Popup */}
            <AnimatePresence>
                {hpPopup && (
                    <motion.div
                        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                        style={{
                            position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.8)', zIndex: 1000,
                            display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px'
                        }}
                        onClick={() => setHpPopup(false)}
                    >
                        <motion.div
                            initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }}
                            className="glass"
                            style={{ padding: '30px', borderRadius: '24px', width: '100%', maxWidth: '300px' }}
                            onClick={e => e.stopPropagation()}
                        >
                            <h3 style={{ textAlign: 'center', marginBottom: '20px' }}>Изменить ОЗ</h3>
                            <div style={{ display: 'flex', gap: '15px', marginBottom: '20px' }}>
                                <button
                                    onClick={() => handleHpChange(-5)}
                                    style={{ flex: 1, backgroundColor: 'var(--hp-color)', borderRadius: '12px', padding: '15px' }}
                                >
                                    -5
                                </button>
                                <button
                                    onClick={() => handleHpChange(5)}
                                    style={{ flex: 1, backgroundColor: 'var(--success-color)', borderRadius: '12px', padding: '15px' }}
                                >
                                    +5
                                </button>
                            </div>
                            <button
                                onClick={() => setHpPopup(false)}
                                style={{ width: '100%', padding: '12px', background: 'var(--card-bg)', borderRadius: '12px' }}
                            >
                                Закрыть
                            </button>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Bottom Nav */}
            <nav className="glass" style={{
                padding: '10px 20px calc(10px + env(safe-area-inset-bottom))',
                display: 'flex', justifyContent: 'space-around', borderTop: '1px solid var(--border-color)'
            }}>
                <button onClick={() => setActiveTab('main')} style={{ background: 'transparent', color: activeTab === 'main' ? 'var(--accent-color)' : 'var(--text-secondary)', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px' }}>
                    <Scroll size={20} />
                    <span style={{ fontSize: '10px' }}>Главная</span>
                </button>
                <button onClick={() => setActiveTab('combat')} style={{ background: 'transparent', color: activeTab === 'combat' ? 'var(--accent-color)' : 'var(--text-secondary)', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px' }}>
                    <Sword size={20} />
                    <span style={{ fontSize: '10px' }}>Бой</span>
                </button>
                <button onClick={() => setActiveTab('notes')} style={{ background: 'transparent', color: activeTab === 'notes' ? 'var(--accent-color)' : 'var(--text-secondary)', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px' }}>
                    <BookOpen size={20} />
                    <span style={{ fontSize: '10px' }}>Заметки</span>
                </button>
                <button
                    onClick={() => setIsDiceOpen(true)}
                    className="nav-dice"
                    style={{ background: 'transparent', color: 'var(--accent-secondary)', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px' }}
                >
                    <Dice5 size={20} />
                    <span style={{ fontSize: '10px' }}>Кубы</span>
                </button>
            </nav>

            {/* Dice Roller Overlay */}
            <DiceRoller isOpen={isDiceOpen} onClose={() => setIsDiceOpen(false)} />
        </div>
    );
};

export default CharacterSheet;
