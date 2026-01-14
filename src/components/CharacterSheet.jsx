import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Sword, Scroll, BookOpen, Shield, Heart, Dice5, Coffee, Plus, Minus, Edit3, Download, Trash2, Package, FileJson } from 'lucide-react';
import DiceRoller from './DiceRoller';

const CharacterSheet = ({ character, onUpdate, onBack }) => {
    const [activeTab, setActiveTab] = useState('main'); // main, combat, notes
    const [isDiceOpen, setIsDiceOpen] = useState(false);
    const [hpPopup, setHpPopup] = useState(false);
    const [hpChangeVal, setHpChangeVal] = useState(0);
    const [equipmentType, setEquipmentType] = useState('weapon'); // weapon, armor, item
    const [newNote, setNewNote] = useState({ title: '', content: '' });
    const [isAddingNote, setIsAddingNote] = useState(false);

    const calculateMod = (score) => Math.floor((score - 10) / 2);

    const handleHpChange = (amount) => {
        const newHp = Math.min(character.hpMax, Math.max(0, (character.hpCurrent ?? character.hpMax) + hpChangeVal));
        onUpdate({ hpCurrent: newHp });
        setHpPopup(false);
        setHpChangeVal(0);
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

    const addEquipment = (type = 'weapon') => {
        const newItem = {
            id: Date.now(),
            type,
            item: '',
            damage: type === 'weapon' ? '' : undefined,
            ac: type === 'armor' ? '' : undefined,
            effect: ''
        };
        const newEquipment = [...(character.equipment || []), newItem];
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

    const addNote = () => {
        if (!newNote.title.trim()) return;
        const notes = Array.isArray(character.notes) ? character.notes : [];
        onUpdate({ notes: [...notes, { ...newNote, id: Date.now() }] });
        setNewNote({ title: '', content: '' });
        setIsAddingNote(false);
    };

    const deleteNote = (id) => {
        const notes = Array.isArray(character.notes) ? character.notes : [];
        onUpdate({ notes: notes.filter(n => n.id !== id) });
    };

    const exportToText = () => {
        const statsText = Object.entries(character.stats)
            .map(([name, val]) => `${name}: ${val} (мод. ${calculateMod(val) >= 0 ? '+' : ''}${calculateMod(val)})`)
            .join('\n');

        const notesText = Array.isArray(character.notes)
            ? character.notes.map(n => `--- ${n.title} ---\n${n.content}`).join('\n\n')
            : character.notes || 'Нет заметок';

        const text = `ЛИСТ ПЕРСОНАЖА: ${character.name}\n` +
            `==========================\n` +
            `Раса: ${character.race}\n` +
            `Класс: ${character.class}\n` +
            `Уровень: ${character.level}\n\n` +
            `ХАРАКТЕРИСТИКИ:\n${statsText}\n\n` +
            `КД: ${character.ac}\n` +
            `Хиты: ${character.hpCurrent ?? character.hpMax} / ${character.hpMax}\n\n` +
            `НАВЫКИ:\n${character.skills.join(', ')}\n\n` +
            `ЗАМЕТКИ:\n${notesText}\n\n` +
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
                {character.image && (
                    <div style={{ width: '40px', height: '40px', borderRadius: '12px', overflow: 'hidden', border: '1px solid var(--accent-color)', flexShrink: 0 }}>
                        <img src={character.image} alt={character.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    </div>
                )}
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
                                    style={{ flex: 1, padding: '12px', borderRadius: '16px', display: 'flex', alignItems: 'center', gap: '10px' }}
                                >
                                    <span style={{ fontSize: '14px' }}>Вдохновение:</span>
                                    <input
                                        type="text"
                                        value={character.inspiration || '0'}
                                        onChange={e => onUpdate({ inspiration: e.target.value })}
                                        style={{ width: '40px', background: 'transparent', border: 'none', color: 'var(--accent-color)', fontWeight: 'bold', fontSize: '16px', outline: 'none', borderBottom: '1px solid var(--border-color)' }}
                                    />
                                </div>
                                <div className="glass" style={{ flex: 1, padding: '12px', borderRadius: '16px', display: 'flex', alignItems: 'center', gap: '10px', justifyContent: 'center' }}>
                                    <span style={{ fontSize: '14px', color: 'var(--text-secondary)' }}>Мастерство:</span>
                                    <span style={{ fontWeight: 'bold' }}>+{character.level || 1}</span>
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

                            {/* Equipment Section with Currency */}
                            <div style={{ marginTop: '30px', marginBottom: '25px' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
                                    <h3 style={{ fontSize: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                        <Package size={18} color="var(--accent-color)" /> Снаряжение
                                    </h3>
                                    <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '4px', background: 'rgba(255,215,0,0.1)', padding: '4px 8px', borderRadius: '8px', border: '1px solid rgba(255,215,0,0.3)' }}>
                                            <div style={{ width: '8px', height: '8px', borderRadius: '4px', background: '#FFD700' }} />
                                            <input
                                                type="number" value={character.gold || 0}
                                                onChange={e => onUpdate({ gold: parseInt(e.target.value) || 0 })}
                                                style={{ width: '35px', background: 'transparent', border: 'none', color: '#FFD700', fontSize: '12px', fontWeight: 'bold', outline: 'none' }}
                                            />
                                        </div>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '4px', background: 'rgba(192,192,192,0.1)', padding: '4px 8px', borderRadius: '8px', border: '1px solid rgba(192,192,192,0.3)' }}>
                                            <div style={{ width: '8px', height: '8px', borderRadius: '4px', background: '#C0C0C0' }} />
                                            <input
                                                type="number" value={character.silver || 0}
                                                onChange={e => onUpdate({ silver: parseInt(e.target.value) || 0 })}
                                                style={{ width: '35px', background: 'transparent', border: 'none', color: '#C0C0C0', fontSize: '12px', fontWeight: 'bold', outline: 'none' }}
                                            />
                                        </div>
                                    </div>
                                </div>

                                <div style={{ display: 'flex', gap: '8px', marginBottom: '15px', overflowX: 'auto', paddingBottom: '5px' }}>
                                    {[
                                        { type: 'weapon', label: 'Оружие' },
                                        { type: 'armor', label: 'Доспех' },
                                        { type: 'spell', label: 'Заклинание' },
                                        { type: 'item', label: 'Предмет' }
                                    ].map(({ type, label }) => (
                                        <button
                                            key={type}
                                            onClick={() => addEquipment(type)}
                                            style={{
                                                flexShrink: 0, padding: '8px 12px', fontSize: '11px', borderRadius: '10px',
                                                background: 'rgba(255,183,77,0.05)', color: 'var(--accent-color)',
                                                border: '1px dashed var(--accent-color)', minWidth: '80px'
                                            }}
                                        >
                                            + {label}
                                        </button>
                                    ))}
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
                                                    <label style={{ fontSize: '10px', color: 'var(--text-secondary)', textTransform: 'uppercase', marginBottom: '4px', display: 'flex', alignItems: 'center', gap: '5px' }}>
                                                        {item.type === 'weapon' ? <Sword size={10} /> : item.type === 'armor' ? <Shield size={10} /> : item.type === 'spell' ? <Scroll size={10} /> : <Package size={10} />}
                                                        {item.type === 'weapon' ? 'Оружие' : item.type === 'armor' ? 'Доспех' : item.type === 'spell' ? 'Заклинание' : 'Предмет'}
                                                    </label>
                                                    <input
                                                        value={item.item}
                                                        onChange={e => updateEquipment(item.id, 'item', e.target.value)}
                                                        placeholder="Название..."
                                                        style={{ width: '100%', background: 'transparent', border: 'none', borderBottom: '1px solid var(--border-color)', color: 'white', fontSize: '14px', outline: 'none' }}
                                                    />
                                                </div>
                                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '15px' }}>
                                                    {(item.type === 'weapon' || item.type === 'spell') && (
                                                        <div>
                                                            <label style={{ fontSize: '10px', color: 'var(--text-secondary)', textTransform: 'uppercase', marginBottom: '4px', display: 'block' }}>
                                                                {item.type === 'weapon' ? 'Урон' : 'Урон/Эффект'}
                                                            </label>
                                                            <input
                                                                value={item.damage}
                                                                onChange={e => updateEquipment(item.id, 'damage', e.target.value)}
                                                                placeholder={item.type === 'weapon' ? '1d8' : '2d6/Очар.'}
                                                                style={{ width: '100%', background: 'transparent', border: 'none', borderBottom: '1px solid var(--border-color)', color: 'white', fontSize: '14px', outline: 'none' }}
                                                            />
                                                        </div>
                                                    )}
                                                    {item.type === 'armor' && (
                                                        <div>
                                                            <label style={{ fontSize: '10px', color: 'var(--text-secondary)', textTransform: 'uppercase', marginBottom: '4px', display: 'block' }}>КД</label>
                                                            <input
                                                                value={item.ac}
                                                                onChange={e => updateEquipment(item.id, 'ac', e.target.value)}
                                                                placeholder="15"
                                                                style={{ width: '100%', background: 'transparent', border: 'none', borderBottom: '1px solid var(--border-color)', color: 'white', fontSize: '14px', outline: 'none' }}
                                                            />
                                                        </div>
                                                    )}
                                                    <div style={{ gridColumn: item.type === 'item' ? 'span 2' : 'auto' }}>
                                                        <label style={{ fontSize: '10px', color: 'var(--text-secondary)', textTransform: 'uppercase', marginBottom: '4px', display: 'block' }}>
                                                            {item.type === 'item' ? 'Описание' : 'Эффект'}
                                                        </label>
                                                        <input
                                                            value={item.effect}
                                                            onChange={e => updateEquipment(item.id, 'effect', e.target.value)}
                                                            placeholder={item.type === 'item' ? 'Что делает...' : 'Магический...'}
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
                                    <span style={{ fontSize: '24px', fontWeight: 'bold' }}>
                                        {calculateMod(character.stats['Ловкость']) >= 0 ? '+' : ''}{calculateMod(character.stats['Ловкость'])}
                                    </span>
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
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
                                <h3 style={{ fontSize: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                    <BookOpen size={18} color="var(--accent-color)" /> Заметки
                                </h3>
                                {!isAddingNote && (
                                    <button
                                        onClick={() => setIsAddingNote(true)}
                                        style={{ padding: '4px 12px', fontSize: '12px', background: 'rgba(255,183,77,0.1)', color: 'var(--accent-color)', border: '1px solid var(--accent-color)', borderRadius: '8px' }}
                                    >
                                        + Новая заметка
                                    </button>
                                )}
                            </div>

                            {isAddingNote && (
                                <div className="glass" style={{ padding: '20px', borderRadius: '16px', marginBottom: '20px' }}>
                                    <input
                                        value={newNote.title}
                                        onChange={e => setNewNote({ ...newNote, title: e.target.value })}
                                        placeholder="Заголовок..."
                                        style={{ width: '100%', background: 'transparent', border: 'none', borderBottom: '1px solid var(--border-color)', color: 'white', fontSize: '16px', fontWeight: 'bold', marginBottom: '10px', outline: 'none' }}
                                    />
                                    <textarea
                                        value={newNote.content}
                                        onChange={e => setNewNote({ ...newNote, content: e.target.value })}
                                        placeholder="Текст заметки..."
                                        style={{ width: '100%', height: '100px', background: 'transparent', border: 'none', color: 'white', resize: 'none', outline: 'none' }}
                                    />
                                    <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
                                        <button onClick={addNote} style={{ flex: 1, backgroundColor: 'var(--accent-color)', color: 'black', padding: '10px', borderRadius: '10px' }}>Создать</button>
                                        <button onClick={() => setIsAddingNote(false)} style={{ flex: 1, backgroundColor: 'var(--card-bg)', padding: '10px', borderRadius: '10px' }}>Отмена</button>
                                    </div>
                                </div>
                            )}

                            <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                                {(Array.isArray(character.notes) ? character.notes : []).map(note => (
                                    <div key={note.id} className="glass" style={{ padding: '20px', borderRadius: '16px', position: 'relative' }}>
                                        <button
                                            onClick={() => deleteNote(note.id)}
                                            style={{ position: 'absolute', top: '15px', right: '15px', background: 'transparent', color: 'rgba(255,255,255,0.3)' }}
                                        >
                                            <Trash2 size={16} />
                                        </button>
                                        <h4 style={{ fontSize: '16px', fontWeight: 'bold', marginBottom: '8px', color: 'var(--accent-color)' }}>{note.title}</h4>
                                        <p style={{ fontSize: '14px', lineHeight: '1.5', color: 'var(--text-secondary)', whiteSpace: 'pre-wrap' }}>{note.content}</p>
                                    </div>
                                ))}
                                {(!character.notes || character.notes.length === 0) && !isAddingNote && (
                                    <div style={{ textAlign: 'center', padding: '40px 20px', color: 'var(--text-secondary)', border: '1px dashed var(--border-color)', borderRadius: '16px' }}>
                                        У вас пока нет заметок
                                    </div>
                                )}
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

                            <div style={{ textAlign: 'center', marginBottom: '25px' }}>
                                <div style={{ fontSize: '48px', fontWeight: 'bold', color: hpChangeVal >= 0 ? 'var(--success-color)' : 'var(--hp-color)' }}>
                                    {hpChangeVal > 0 ? `+${hpChangeVal}` : hpChangeVal}
                                </div>
                                <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
                                    Итого: {(character.hpCurrent ?? character.hpMax) + hpChangeVal} / {character.hpMax}
                                </div>
                            </div>

                            <div style={{ display: 'flex', gap: '15px', marginBottom: '20px', justifyContent: 'center' }}>
                                <button
                                    onClick={() => setHpChangeVal(v => v - 1)}
                                    style={{
                                        width: '60px', height: '60px', backgroundColor: 'var(--hp-color)',
                                        borderRadius: '30px', fontSize: '24px', fontWeight: 'bold',
                                        display: 'flex', alignItems: 'center', justifyContent: 'center', border: 'none'
                                    }}
                                >
                                    -1
                                </button>
                                <button
                                    onClick={() => setHpChangeVal(v => v + 1)}
                                    style={{
                                        width: '60px', height: '60px', backgroundColor: 'var(--success-color)',
                                        borderRadius: '30px', fontSize: '24px', fontWeight: 'bold',
                                        display: 'flex', alignItems: 'center', justifyContent: 'center', border: 'none'
                                    }}
                                >
                                    +1
                                </button>
                            </div>

                            <div style={{ display: 'flex', gap: '10px' }}>
                                <button
                                    onClick={() => handleHpChange()}
                                    style={{ flex: 1, padding: '15px', background: 'var(--accent-color)', color: 'black', borderRadius: '12px', fontWeight: 'bold' }}
                                >
                                    Применить
                                </button>
                                <button
                                    onClick={() => {
                                        setHpPopup(false);
                                        setHpChangeVal(0);
                                    }}
                                    style={{ flex: 1, padding: '15px', background: 'var(--card-bg)', borderRadius: '12px' }}
                                >
                                    Отмена
                                </button>
                            </div>
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
