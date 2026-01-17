import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Sword, Scroll, BookOpen, Shield, Heart, Dice5, Coffee, Plus, Minus, Edit3, Download, Trash2, Package, FileJson, Send, Star } from 'lucide-react';
import DiceRoller from './DiceRoller';
import { SPELL_DATABASE } from '../data/spellDatabase';
import { getSpellSlotsForClass } from '../data/spellProgression';

const CharacterSheet = ({ character, onUpdate, onBack }) => {
    const [activeTab, setActiveTab] = useState('main'); // main, combat, notes
    const [isDiceOpen, setIsDiceOpen] = useState(false);
    const [hpPopup, setHpPopup] = useState(false);
    const [hpChange, setHpChange] = useState('');
    const [equipmentType, setEquipmentType] = useState('weapon'); // weapon, armor, item
    const [newNote, setNewNote] = useState({ title: '', content: '' });
    const [isAddingNote, setIsAddingNote] = useState(false);
    const [showSpellSelector, setShowSpellSelector] = useState(false);
    const [spellSearch, setSpellSearch] = useState('');

    const calculateMod = (score) => Math.floor((score - 10) / 2);

    // Calculate Max Spell Level (Circle) based on Class and Level
    const getMaxSpellLevel = () => {
        const cls = character.class;
        const lvl = character.level || 1;

        if (['Волшебник', 'Чародей', 'Жрец', 'Бард', 'Друид'].includes(cls)) {
            return Math.ceil(lvl / 2);
        } else if (['Паладин', 'Следопыт'].includes(cls)) {
            return lvl >= 2 ? Math.ceil(lvl / 2) : 0;
        } else if (cls === 'Чернокнижник') {
            // Warlock Pact Magic scaling is unique, simplified here for slots level
            if (lvl >= 17) return 5;
            if (lvl >= 11) return 5;
            if (lvl >= 9) return 5;
            if (lvl >= 7) return 4;
            if (lvl >= 5) return 3;
            if (lvl >= 3) return 2;
            return 1;
        }
        return 0; // Non-casters
    };

    const maxSpellLevel = getMaxSpellLevel();
    // Dynamic Max Spell Slots
    const standardMaxSlots = getSpellSlotsForClass(character.class, character.level);
    const maxSlots = { ...standardMaxSlots, ...(character.customSlots || {}) };
    const hasSpellSlots = Object.keys(maxSlots).length > 0 || (character.class === "Чернокнижник");

    // Calculate Character Level required for a specific Spell Circle
    const getUnlockLevel = (spellLevel, cls) => {
        if (spellLevel === 0) return 1;
        if (['Бард', 'Жрец', 'Друид', 'Чародей', 'Волшебник', 'Чернокнижник'].includes(cls)) {
            return Math.max(1, spellLevel * 2 - 1);
        }
        if (['Паладин', 'Следопыт'].includes(cls)) {
            if (spellLevel === 1) return 2;
            if (spellLevel === 2) return 5;
            if (spellLevel === 3) return 9;
            return spellLevel * 4 - 3; // Approx for higher lists if added
        }
        return 1;
    };

    // Filter spells: Match Class AND Level <= Max Available OR Subclass Match
    // Filter spells: Match Class OR Subclass. NO LEVEL LIMIT.
    const availableSpells = SPELL_DATABASE.filter(s =>
        (s.class.includes(character.class) || (s.subclass && character.subclass && s.subclass.includes(character.subclass))) &&
        (s.name.toLowerCase().includes(spellSearch.toLowerCase()) || s.school.toLowerCase().includes(spellSearch.toLowerCase()))
    ).sort((a, b) => a.name.localeCompare(b.name));

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
                spellSlots: {} // Reset to default max
            });
            alert('Вы отлично выспались! Силы восстановлены.');
        }
    };

    const toggleSpellSlot = (level, slotIndex) => {
        const current = character.spellSlots?.[level] ?? maxSlots[level];
        // Logic: if clicking a filled slot (<= current), reduce count.
        let newVal = current;
        if (slotIndex <= current) {
            newVal = slotIndex - 1;
        } else {
            newVal = slotIndex;
        }

        onUpdate({
            spellSlots: {
                ...character.spellSlots,
                [level]: newVal
            }
        });
    };

    const addSpell = (spell) => {
        const newItem = {
            id: Date.now(),
            type: 'spell',
            item: spell.name,
            damage: spell.damage,
            effect: spell.desc,
            level: spell.level,
            school: spell.school,
            link: spell.link
        };
        const newEquipment = [...(character.equipment || []), newItem];
        onUpdate({ equipment: newEquipment });
        setShowSpellSelector(false);
        setSpellSearch('');
    };

    const addEquipment = (type = 'weapon') => {
        if (type === 'spell') {
            setShowSpellSelector(true);
            return;
        }
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

    const shareToTelegram = () => {
        const statsSummary = Object.entries(character.stats)
            .map(([name, val]) => `${name.substring(0, 3)}: ${val} (${calculateMod(val) >= 0 ? '+' : ''}${calculateMod(val)})`)
            .join(' | ');

        const text = `🛡️ ПЕРСОНАЖ: ${character.name}\n` +
            `🔹 ${character.race} — ${character.class}, ${character.level} уровень\n\n` +
            `📊 ХАРАКТЕРИСТИКИ:\n${statsSummary}\n\n` +
            `🛡️ КД: ${character.ac} | ❤️ ХП: ${character.hpCurrent ?? character.hpMax}/${character.hpMax}\n` +
            (character.bio ? `\n📖 ИСТОРИЯ:\n${character.bio.substring(0, 200)}${character.bio.length > 200 ? '...' : ''}\n` : '') +
            `\nСоздано в D&D Pocket Sheet 🛡️✨`;

        const url = `https://t.me/share/url?url=${encodeURIComponent('https://dnd-pocket-sheet.vercel.app')} &text=${encodeURIComponent(text)}`;
        window.open(url, '_blank');
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
                        onClick={shareToTelegram}
                        style={{ padding: '8px', background: 'transparent', color: '#0088cc' }}
                        title="Поделиться в Telegram"
                    >
                        <Send size={20} />
                    </button>
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
                                        style={{ padding: '12px', borderRadius: '16px', textAlign: 'center', cursor: 'pointer', position: 'relative' }}
                                    >
                                        <div onClick={() => setIsDiceOpen(true)}>
                                            <span style={{ fontSize: '10px', color: 'var(--text-secondary)', display: 'block', textTransform: 'uppercase' }}>{name.substring(0, 3)}</span>
                                            <span style={{ fontSize: '24px', fontWeight: 'bold', display: 'block', margin: '4px 0' }}>
                                                {calculateMod(val) >= 0 ? '+' : ''}{calculateMod(val)}
                                            </span>
                                        </div>
                                        <input
                                            type="number"
                                            value={val}
                                            onChange={e => {
                                                const input = e.target.value;
                                                if (input === '') {
                                                    onUpdate({ stats: { ...character.stats, [name]: '' } });
                                                } else {
                                                    const num = parseInt(input);
                                                    if (!isNaN(num)) {
                                                        const limited = Math.min(30, Number(input)); // Allow typing 0-9 freely, only cap max
                                                        onUpdate({ stats: { ...character.stats, [name]: limited } });
                                                    }
                                                }
                                            }}
                                            onBlur={e => {
                                                let final = parseInt(e.target.value);
                                                if (isNaN(final) || final < 1) final = 10; // Default to 10 if empty
                                                onUpdate({ stats: { ...character.stats, [name]: final } });
                                                e.target.style.borderBottom = '1px solid transparent';
                                            }}
                                            onClick={e => e.stopPropagation()}
                                            style={{
                                                width: '100%', background: 'transparent', border: 'none',
                                                textAlign: 'center', fontSize: '12px', opacity: 0.7, color: 'var(--text-secondary)',
                                                outline: 'none', borderBottom: '1px solid transparent'
                                            }}
                                            onFocus={e => e.target.style.borderBottom = '1px solid var(--accent-color)'}
                                        />
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
                                    <span style={{ fontWeight: 'bold' }}>+{Math.floor((character.level - 1) / 4) + 2}</span>
                                </div>
                            </div>

                            {/* Skills */}
                            <h3 style={{ fontSize: '16px', marginBottom: '15px' }}>Навыки</h3>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                {[
                                    'Акробатика (Лов)', 'Анализ (Инт)', 'Атлетика (Сил)', 'Восприятие (Муд)',
                                    'Выживание (Муд)', 'Выступление (Хар)', 'Запугивание (Хар)', 'История (Инт)',
                                    'Ловкость рук (Лов)', 'Магия (Инт)', 'Медицина (Муд)', 'Обман (Хар)',
                                    'Природа (Инт)', 'Проницательность (Муд)', 'Религия (Инт)', 'Скрытность (Лов)',
                                    'Убеждение (Хар)', 'Уход за животными (Муд)'
                                ].map(skill => {
                                    const isProficient = character.skills.includes(skill);
                                    const isExpert = character.expertise && character.expertise.includes(skill);

                                    let attrName = '';
                                    if (skill.includes('(Сил)')) attrName = 'Сила';
                                    else if (skill.includes('(Лов)')) attrName = 'Ловкость';
                                    else if (skill.includes('(Инт)')) attrName = 'Интеллект';
                                    else if (skill.includes('(Муд)')) attrName = 'Мудрость';
                                    else if (skill.includes('(Хар)')) attrName = 'Харизма';

                                    const attrMod = calculateMod(character.stats[attrName] || 10);
                                    const profBonus = Math.floor((character.level - 1) / 4) + 2;

                                    // Calculate total mod: Attr + (Expert ? 2*Prof : (Prof ? Prof : 0))
                                    const totalMod = attrMod + (isExpert ? profBonus * 2 : (isProficient ? profBonus : 0));

                                    const toggleSkillState = () => {
                                        let newSkills = [...character.skills];
                                        let newExpertise = [...(character.expertise || [])];

                                        if (!isProficient && !isExpert) {
                                            // None -> Proficient
                                            newSkills.push(skill);
                                        } else if (isProficient) {
                                            // Proficient -> Expertise
                                            newSkills = newSkills.filter(s => s !== skill);
                                            newExpertise.push(skill);
                                        } else {
                                            // Expertise -> None
                                            newExpertise = newExpertise.filter(s => s !== skill);
                                        }

                                        onUpdate({ skills: newSkills, expertise: newExpertise });
                                    };

                                    return (
                                        <div
                                            key={skill}
                                            className="glass"
                                            onClick={toggleSkillState}
                                            style={{ padding: '10px 15px', borderRadius: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer' }}
                                        >
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                                <div style={{
                                                    width: '6px', height: '6px', borderRadius: '3px',
                                                    backgroundColor: isExpert ? 'var(--accent-secondary)' : (isProficient ? 'var(--accent-color)' : 'transparent'),
                                                    border: (isProficient || isExpert) ? 'none' : '1px solid var(--text-secondary)',
                                                    display: 'flex', alignItems: 'center', justifyContent: 'center'
                                                }}>
                                                    {isExpert && <div style={{ width: '4px', height: '4px', borderRadius: '2px', background: 'black' }} />}
                                                </div>
                                                <span style={{ fontSize: '14px', color: (isProficient || isExpert) ? 'white' : 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '5px' }}>
                                                    {skill} {isExpert && <Star size={10} fill="var(--accent-secondary)" color="var(--accent-secondary)" />}
                                                </span>
                                            </div>
                                            <span style={{ fontWeight: (isProficient || isExpert) ? 'bold' : 'normal', fontSize: '14px', color: isExpert ? 'var(--accent-secondary)' : (isProficient ? 'var(--accent-color)' : 'white') }}>
                                                {totalMod >= 0 ? '+' : ''}{totalMod}
                                            </span>
                                        </div>
                                    );
                                })}
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
                                        <div key={item.id} className="glass" style={{ padding: '15px 40px 15px 15px', borderRadius: '16px', position: 'relative' }}>
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
                                                        {item.type === 'spell' && item.link && (
                                                            <a
                                                                href={item.link}
                                                                target="_blank"
                                                                rel="noopener noreferrer"
                                                                style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: '3px', color: 'var(--accent-color)', textDecoration: 'none' }}
                                                            >
                                                                <BookOpen size={10} />
                                                                TTG Club
                                                            </a>
                                                        )}
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

                            {hasSpellSlots && (
                                <>
                                    <h3 style={{ fontSize: '16px', marginBottom: '15px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                        <span>Ячейки заклинаний</span>
                                        {/* Future: Add Manual Edit Button here */}
                                    </h3>
                                    <div className="glass" style={{ padding: '20px', borderRadius: '16px', marginBottom: '25px' }}>
                                        {Object.keys(maxSlots).sort((a, b) => Number(a) - Number(b)).map(lvl => {
                                            const total = maxSlots[lvl];
                                            const current = character.spellSlots?.[lvl] ?? total;

                                            return (
                                                <div key={lvl} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '15px' }}>
                                                    <span style={{ fontSize: '14px' }}>{lvl}-й Круг</span>
                                                    <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', justifyContent: 'flex-end', maxWidth: '70%' }}>
                                                        {Array.from({ length: total }, (_, i) => i + 1).map(i => (
                                                            <div
                                                                key={i}
                                                                onClick={() => toggleSpellSlot(lvl, i)}
                                                                style={{
                                                                    width: '24px', height: '24px', borderRadius: '12px', border: '2px solid var(--mana-color)',
                                                                    backgroundColor: current >= i ? 'var(--mana-color)' : 'transparent',
                                                                    cursor: 'pointer', flexShrink: 0
                                                                }}
                                                            />
                                                        ))}
                                                    </div>
                                                </div>
                                            );
                                        })}
                                        {Object.keys(maxSlots).length === 0 && (
                                            <div style={{ textAlign: 'center', color: 'var(--text-secondary)', fontSize: '12px' }}>
                                                Нет доступных ячеек
                                            </div>
                                        )}
                                    </div>
                                </>
                            )}

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
                            {/* Bio Section */}
                            {character.bio && (
                                <div className="glass" style={{ padding: '20px', borderRadius: '16px', marginBottom: '25px', background: 'rgba(255,183,77,0.03)', border: '1px solid rgba(255,183,77,0.1)' }}>
                                    <h3 style={{ fontSize: '16px', display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px', color: 'var(--accent-color)' }}>
                                        <Edit3 size={18} /> История и описание
                                    </h3>
                                    <p style={{ fontSize: '14px', lineHeight: '1.6', color: 'var(--text-secondary)', whiteSpace: 'pre-wrap', fontStyle: 'italic' }}>
                                        {character.bio}
                                    </p>
                                </div>
                            )}

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

            {/* Spell Selector Modal */}
            <AnimatePresence>
                {showSpellSelector && (
                    <motion.div
                        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                        style={{ position: 'fixed', inset: 0, zIndex: 1100, background: 'rgba(0,0,0,0.85)', padding: '20px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                        onClick={() => setShowSpellSelector(false)}
                    >
                        <motion.div
                            initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9, y: 20 }}
                            className="glass"
                            style={{ width: '100%', maxWidth: '400px', maxHeight: '80vh', padding: '25px', borderRadius: '24px', position: 'relative', display: 'flex', flexDirection: 'column' }}
                            onClick={e => e.stopPropagation()}
                        >
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                                <h3 style={{ fontSize: '20px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                                    <Scroll color="var(--accent-color)" /> Выбор заклинания
                                </h3>
                                <button onClick={() => setShowSpellSelector(false)} style={{ background: 'transparent', color: 'var(--text-secondary)' }}>
                                    Закрыть
                                </button>
                            </div>

                            <input
                                type="text"
                                placeholder="Поиск заклинания..."
                                value={spellSearch}
                                onChange={e => setSpellSearch(e.target.value)}
                                style={{ width: '100%', padding: '12px', borderRadius: '12px', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--border-color)', color: 'white', marginBottom: '15px' }}
                            />

                            <div style={{ flex: 1, overflowY: 'auto' }}>
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '8px' }}>
                                    {availableSpells.map(spell => (
                                        <div
                                            key={spell.name}
                                            onClick={() => addSpell(spell)}
                                            className="glass"
                                            style={{
                                                padding: '12px', borderRadius: '12px', cursor: 'pointer',
                                                border: '1px solid var(--border-color)',
                                                display: 'flex', justifyContent: 'space-between', alignItems: 'center'
                                            }}
                                        >
                                            <div>
                                                <div style={{ fontWeight: 'bold' }}>{spell.name}</div>
                                                <div style={{ fontSize: '10px', color: 'var(--text-secondary)' }}>
                                                    {spell.level === 0 ? 'Заговор' : `${spell.level} круг`} • {spell.school} • {spell.damage}
                                                </div>
                                            </div>
                                            <Plus size={16} color="var(--accent-color)" />
                                        </div>
                                    ))}
                                </div>
                                {availableSpells.length === 0 && (
                                    <div style={{ textAlign: 'center', padding: '20px', color: 'var(--text-secondary)' }}>
                                        Заклинания не найдены
                                    </div>
                                )}
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Dice Roller Overlay */}
            <DiceRoller isOpen={isDiceOpen} onClose={() => setIsDiceOpen(false)} />
        </div>
    );
};

export default CharacterSheet;
