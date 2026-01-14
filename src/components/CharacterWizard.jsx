import React, { useState } from 'react';
import { ArrowLeft, ArrowRight, Save, Camera, Check, Dices, Upload, Info, ExternalLink, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { RACE_DETAILS } from '../data/races';
import { CLASS_DETAILS, CLASSES } from '../data/classes';

const STATS = ['Сила', 'Ловкость', 'Телосложение', 'Интеллект', 'Мудрость', 'Харизма'];
const SKILLS = [
    'Акробатика (Лов)', 'Анализ (Инт)', 'Атлетика (Сил)', 'Восприятие (Муд)',
    'Выживание (Муд)', 'Выступление (Хар)', 'Запугивание (Хар)', 'История (Инт)',
    'Ловкость рук (Лов)', 'Магия (Инт)', 'Медицина (Муд)', 'Обман (Хар)',
    'Природа (Инт)', 'Проницательность (Муд)', 'Религия (Инт)', 'Скрытность (Лов)',
    'Убеждение (Хар)', 'Уход за животными (Муд)'
];

const RACES = [
    { ru: "Ааракокра", en: "Aarakocra" }, { ru: "Аасимар", en: "Aasimar" }, { ru: "Авен", en: "Aven" },
    { ru: "Багбир", en: "Bugbear" }, { ru: "Ведалкен", en: "Vedalken" }, { ru: "Вердан", en: "Verdan" },
    { ru: "Гибрид Симиков", en: "Simic Hybrid" }, { ru: "Гит", en: "Gith" }, { ru: "Гифф", en: "Giff" },
    { ru: "Гном", en: "Gnome" }, { ru: "Гоблин", en: "Goblin" }, { ru: "Голиаф", en: "Goliath" },
    { ru: "Грунг", en: "Grung" }, { ru: "Дварф", en: "Dwarf" }, { ru: "Дженази", en: "Genasi" },
    { ru: "Драконорождённый", en: "Dragonborn" }, { ru: "Изменяющиеся", en: "Changeling" },
    { ru: "Калаштар", en: "Kalashtar" }, { ru: "Кендер", en: "Kender" }, { ru: "Кенку", en: "Kenku" },
    { ru: "Кентавр", en: "Centaur" }, { ru: "Кобольд", en: "Kobold" }, { ru: "Кованый", en: "Warforged" },
    { ru: "Леонин", en: "Leonin" }, { ru: "Локата", en: "Locathah" }, { ru: "Локсодон", en: "Loxodon" },
    { ru: "Людоящер", en: "Lizardfolk" }, { ru: "Минотавр", en: "Minotaur" }, { ru: "Нага", en: "Naga" },
    { ru: "Орк", en: "Orc" }, { ru: "Плазмоид", en: "Plasmoid" }, { ru: "Полуорк", en: "Half-Orc" },
    { ru: "Полурослик", en: "Halfling" }, { ru: "Полуэльф", en: "Half-Elf" }, { ru: "Сатир", en: "Satyr" },
    { ru: "Совлин", en: "Owlin" }, { ru: "Табакси", en: "Tabaxi" }, { ru: "Тифлинг", en: "Tiefling" },
    { ru: "Тортл", en: "Tortle" }, { ru: "Три-крин", en: "Thri-kreen" }, { ru: "Тритон", en: "Triton" },
    { ru: "Фирболг", en: "Firbolg" }, { ru: "Фэйри", en: "Fairy" }, { ru: "Хадози", en: "Hadozee" },
    { ru: "Харенгон", en: "Harengon" }, { ru: "Хенра", en: "Khenra" }, { ru: "Хобгоблин", en: "Hobgoblin" },
    { ru: "Человек", en: "Human" }, { ru: "Шифтер", en: "Shifter" }, { ru: "Эльф", en: "Elf" },
    { ru: "Эльф (астральный)", en: "Astral Elf" }, { ru: "Юань-ти", en: "Yuan-ti" }
];

const CharacterWizard = ({ onSave, onCancel, onStepChange }) => {
    const [step, setStep] = useState(1);

    // Sync step with parent for onboarding
    React.useEffect(() => {
        if (onStepChange) onStepChange(step);
    }, [step, onStepChange]);
    const [isProcessingImage, setIsProcessingImage] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        image: '',
        race: '',
        class: '',
        level: 1,
        stats: { 'Сила': 10, 'Ловкость': 10, 'Телосложение': 10, 'Интеллект': 10, 'Мудрость': 10, 'Харизма': 10 },
        ac: 10,
        hpMax: 10,
        skills: [],
        spellSlots: { 1: 3, 2: 0, 3: 0 },
        inspiration: '0',
        notes: [],
        gold: 0,
        silver: 0
    });

    const [raceSearch, setRaceSearch] = useState('');
    const [showRaceDropdown, setShowRaceDropdown] = useState(false);
    const [classSearch, setClassSearch] = useState('');
    const [showClassDropdown, setShowClassDropdown] = useState(false);
    const [showGlossary, setShowGlossary] = useState(false);
    const [glossaryItem, setGlossaryItem] = useState(null); // { type: 'race'|'class', name, ... }

    const nextStep = () => setStep(s => s + 1);
    const prevStep = () => setStep(s => s - 1);

    const handleStatChange = (stat, val) => {
        let numVal = val === '' ? 0 : parseInt(val);
        if (numVal > 20) numVal = 20;
        setFormData({
            ...formData,
            stats: { ...formData.stats, [stat]: numVal }
        });
    };

    const toggleSkill = (skill) => {
        const newSkills = formData.skills.includes(skill)
            ? formData.skills.filter(s => s !== skill)
            : [...formData.skills, skill];
        setFormData({ ...formData, skills: newSkills });
    };

    const calculateMod = (score) => Math.floor((score - 10) / 2);

    const handleFileUpload = (e) => {
        const file = e.target.files[0];
        if (!file) return;

        setIsProcessingImage(true);
        const reader = new FileReader();
        reader.onload = (event) => {
            const img = new Image();
            img.onload = () => {
                const canvas = document.createElement('canvas');
                const MAX_WIDTH = 300;
                const MAX_HEIGHT = 300;
                let width = img.width;
                let height = img.height;

                if (width > height) {
                    if (width > MAX_WIDTH) {
                        height *= MAX_WIDTH / width;
                        width = MAX_WIDTH;
                    }
                } else {
                    if (height > MAX_HEIGHT) {
                        width *= MAX_HEIGHT / height;
                        height = MAX_HEIGHT;
                    }
                }

                canvas.width = width;
                canvas.height = height;
                const ctx = canvas.getContext('2d');
                ctx.drawImage(img, 0, 0, width, height);

                // Compress to JPEG with 0.7 quality
                const dataUrl = canvas.toDataURL('image/jpeg', 0.7);
                setFormData({ ...formData, image: dataUrl });
                setIsProcessingImage(false);
            };
            img.src = event.target.result;
        };
        reader.readAsDataURL(file);
    };

    const convertLssToAppFormat = (lssJson) => {
        try {
            // LSS often wraps the main character data in a stringified JSON in the 'data' field
            const charData = typeof lssJson.data === 'string' ? JSON.parse(lssJson.data) : lssJson.data;

            if (!charData || charData.jsonType !== 'character') return null;

            const statsMapping = {
                str: 'Сила',
                dex: 'Ловкость',
                con: 'Телосложение',
                int: 'Интеллект',
                wis: 'Мудрость',
                cha: 'Харизма'
            };

            const stats = {};
            Object.entries(statsMapping).forEach(([lssKey, ruLabel]) => {
                stats[ruLabel] = charData.stats?.[lssKey]?.score || 10;
            });

            // Map equipment from weaponsList
            const equipment = (charData.weaponsList || []).map(w => {
                const name = w.name?.value || 'Оружие';
                const isSpell = name.toLowerCase().includes('заклинание') || (w.dmg?.value || '').toLowerCase().includes('заклинание');

                return {
                    id: w.id || Math.random().toString(36).substr(2, 9),
                    item: name,
                    type: isSpell ? 'spell' : 'weapon',
                    damage: w.dmg?.value || '',
                    effect: `Мод: ${w.mod?.value || '+0'}`
                };
            });

            // Map spell slots
            const spellSlots = { 1: 0, 2: 0, 3: 0 };
            if (charData.spells) {
                spellSlots[1] = charData.spells['slots-1']?.value || 0;
                spellSlots[2] = charData.spells['slots-2']?.value || 0;
                spellSlots[3] = charData.spells['slots-3']?.value || 0;
            }

            return {
                id: Math.random().toString(36).substr(2, 9),
                image: charData.charImage?.value || null,
                name: charData.name?.value || 'Безымянный',
                race: charData.info?.race?.value || '',
                class: charData.info?.charClass?.value || '',
                level: charData.info?.level?.value || 1,
                stats,
                hpMax: (charData.vitality?.['hp-max']?.value || 10) + (charData.vitality?.['hp-max-bonus']?.value || 0),
                hpCurrent: charData.vitality?.['hp-current']?.value || 10,
                ac: charData.vitality?.ac?.value || 10,
                equipment,
                spellSlots,
                notes: [],
                skills: [],
                gold: 0,
                silver: 0,
                inspiration: '0'
            };
        } catch (e) {
            console.error("LSS Conversion Error:", e);
            return null;
        }
    };

    const handleJsonImport = (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (event) => {
            try {
                let data = JSON.parse(event.target.result);

                // Detect and convert Long Story Short format
                if (data.jsonType === 'character' && (data.data || data.edition)) {
                    const converted = convertLssToAppFormat(data);
                    if (converted) {
                        data = converted;
                    } else {
                        throw new Error('Не удалось сконвертировать формат Long Story Short');
                    }
                }

                // Basic validation for our format or converted format
                if (!data.name || !data.stats) {
                    throw new Error('Некорректный формат JSON');
                }
                setFormData({
                    ...formData,
                    ...data,
                    // Ensure essential fields exist
                    id: undefined, // Will be set on save
                    stats: { ...formData.stats, ...data.stats },
                    spellSlots: data.spellSlots || { 1: 3, 2: 0, 3: 0 },
                    skills: data.skills || [],
                    equipment: data.equipment || [],
                    notes: Array.isArray(data.notes) ? data.notes : [],
                    level: data.level || 1,
                    inspiration: data.inspiration || '0',
                    gold: data.gold || 0,
                    silver: data.silver || 0
                });
                alert('Персонаж успешно импортирован!');
            } catch (err) {
                alert('Ошибка при импорте: ' + err.message);
            }
        };
        reader.readAsText(file);
    };

    return (
        <div className="wizard animate-fade-in" style={{ padding: '20px', paddingBottom: '100px' }}>
            <header style={{ marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '15px' }}>
                <button onClick={onCancel} style={{ padding: '8px', background: 'transparent' }}><ArrowLeft /></button>
                <div style={{ flex: 1 }}>
                    <h2>Новый Герой ({step}/4)</h2>
                </div>
                {step === 1 && (
                    <div style={{ position: 'relative' }}>
                        <button
                            style={{
                                padding: '8px 12px', fontSize: '12px', background: 'rgba(255,255,255,0.05)',
                                border: '1px solid var(--border-color)', borderRadius: '10px',
                                display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--text-secondary)'
                            }}
                        >
                            <Upload size={14} /> Импорт JSON
                        </button>
                        <input
                            type="file"
                            accept=".json"
                            onChange={handleJsonImport}
                            style={{ position: 'absolute', inset: 0, opacity: 0, cursor: 'pointer' }}
                        />
                    </div>
                )}
            </header>

            <div className="step-content">
                <AnimatePresence mode="wait">
                    {step === 1 && (
                        <motion.div key="step1" initial={{ x: 20, opacity: 0 }} animate={{ x: 0, opacity: 1 }} exit={{ x: -20, opacity: 0 }}>
                            <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '20px' }}>
                                <div style={{
                                    width: '120px', height: '120px', borderRadius: '60px',
                                    backgroundColor: 'var(--card-bg)', border: '2px dashed var(--border-color)',
                                    display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                                    cursor: 'pointer', overflow: 'hidden', position: 'relative'
                                }}>
                                    {formData.image ? <img src={formData.image} style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : (
                                        <>
                                            <Camera size={32} color="var(--text-secondary)" />
                                            <span style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '8px' }}>
                                                {isProcessingImage ? 'Сжатие...' : 'Фото'}
                                            </span>
                                        </>
                                    )}
                                    <input
                                        type="file"
                                        accept="image/*"
                                        onChange={handleFileUpload}
                                        style={{ position: 'absolute', opacity: 0, width: '100%', height: '100%', cursor: 'pointer' }}
                                    />
                                </div>
                            </div>

                            <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                                <div style={{ display: 'flex', gap: '10px' }}>
                                    <input
                                        type="text" placeholder="Имя персонажа"
                                        value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })}
                                        style={{ flex: 3, padding: '12px', borderRadius: '12px', border: '1px solid var(--border-color)', background: 'var(--card-bg)', color: 'white' }}
                                    />
                                    <div style={{ flex: 1, position: 'relative' }}>
                                        <label style={{ position: 'absolute', top: '-8px', left: '10px', fontSize: '10px', background: 'var(--bg-color)', padding: '0 4px', color: 'var(--text-secondary)' }}>УР</label>
                                        <input
                                            type="number" value={formData.level}
                                            onChange={e => setFormData({ ...formData, level: Math.max(1, parseInt(e.target.value) || 1) })}
                                            style={{ width: '100%', padding: '12px', borderRadius: '12px', border: '1px solid var(--border-color)', background: 'var(--card-bg)', color: 'white', textAlign: 'center' }}
                                        />
                                    </div>
                                </div>

                                <div style={{ position: 'relative', display: 'flex', gap: '10px' }}>
                                    <div style={{ flex: 1, position: 'relative' }}>
                                        <input
                                            type="text" placeholder="Выберите расу..."
                                            value={raceSearch || formData.race}
                                            onFocus={() => setShowRaceDropdown(true)}
                                            onChange={e => {
                                                setRaceSearch(e.target.value);
                                                setShowRaceDropdown(true);
                                            }}
                                            style={{ width: '100%', padding: '12px', borderRadius: '12px', border: '1px solid var(--border-color)', background: 'var(--card-bg)', color: 'white' }}
                                        />
                                        {showRaceDropdown && (
                                            <div className="glass" style={{
                                                position: 'absolute', top: '100%', left: 0, right: 0, zIndex: 100,
                                                maxHeight: '200px', overflowY: 'auto', marginTop: '5px', borderRadius: '12px',
                                                padding: '5px', border: '1px solid var(--border-color)', boxShadow: '0 10px 25px rgba(0,0,0,0.5)'
                                            }}>
                                                {RACES.filter(r =>
                                                    (r.ru && r.ru.toLowerCase().includes((raceSearch || '').toLowerCase())) ||
                                                    (r.en && r.en.toLowerCase().includes((raceSearch || '').toLowerCase()))
                                                ).map(r => (
                                                    <div
                                                        key={r.ru}
                                                        onClick={() => {
                                                            setFormData({ ...formData, race: r.ru });
                                                            setRaceSearch(r.ru);
                                                            setShowRaceDropdown(false);
                                                        }}
                                                        style={{ padding: '10px', cursor: 'pointer', borderRadius: '8px', borderBottom: '1px solid rgba(255,255,255,0.03)' }}
                                                        onMouseEnter={e => e.target.style.background = 'rgba(255,255,255,0.05)'}
                                                        onMouseLeave={e => e.target.style.background = 'transparent'}
                                                    >
                                                        <div style={{ fontSize: '14px' }}>{r.ru}</div>
                                                        <div style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>{r.en}</div>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                    <button
                                        onClick={() => {
                                            setGlossaryItem(RACE_DETAILS[formData.race] ? { type: 'race', name: formData.race, isDirect: true, ...RACE_DETAILS[formData.race] } : { type: 'race', name: null, isDirect: false });
                                            setShowGlossary(true);
                                        }}
                                        style={{ width: '45px', background: 'rgba(255,183,77,0.1)', border: '1px solid var(--accent-color)', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--accent-color)' }}
                                    >
                                        <Info size={20} />
                                    </button>
                                </div>

                                <div style={{ position: 'relative', display: 'flex', gap: '10px' }}>
                                    <div style={{ flex: 1, position: 'relative' }}>
                                        <input
                                            type="text" placeholder="Выберите класс..."
                                            value={classSearch || formData.class}
                                            onFocus={() => setShowClassDropdown(true)}
                                            onChange={e => {
                                                setClassSearch(e.target.value);
                                                setShowClassDropdown(true);
                                            }}
                                            style={{ width: '100%', padding: '12px', borderRadius: '12px', border: '1px solid var(--border-color)', background: 'var(--card-bg)', color: 'white' }}
                                        />
                                        {showClassDropdown && (
                                            <div className="glass" style={{
                                                position: 'absolute', top: '100%', left: 0, right: 0, zIndex: 100,
                                                maxHeight: '200px', overflowY: 'auto', marginTop: '5px', borderRadius: '12px',
                                                padding: '5px', border: '1px solid var(--border-color)', boxShadow: '0 10px 25px rgba(0,0,0,0.5)'
                                            }}>
                                                {CLASSES.filter(c =>
                                                    (c.ru && c.ru.toLowerCase().includes((classSearch || '').toLowerCase())) ||
                                                    (c.en && c.en.toLowerCase().includes((classSearch || '').toLowerCase()))
                                                ).map(c => (
                                                    <div
                                                        key={c.ru}
                                                        onClick={() => {
                                                            setFormData({ ...formData, class: c.ru });
                                                            setClassSearch(c.ru);
                                                            setShowClassDropdown(false);
                                                        }}
                                                        style={{ padding: '10px', cursor: 'pointer', borderRadius: '8px', borderBottom: '1px solid rgba(255,255,255,0.03)' }}
                                                        onMouseEnter={e => e.target.style.background = 'rgba(255,255,255,0.05)'}
                                                        onMouseLeave={e => e.target.style.background = 'transparent'}
                                                    >
                                                        <div style={{ fontSize: '14px' }}>{c.ru}</div>
                                                        <div style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>{c.en}</div>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                    <button
                                        onClick={() => {
                                            setGlossaryItem(CLASS_DETAILS[formData.class] ? { type: 'class', name: formData.class, isDirect: true, ...CLASS_DETAILS[formData.class] } : { type: 'class', name: null, isDirect: false });
                                            setShowGlossary(true);
                                        }}
                                        style={{ width: '45px', background: 'rgba(255,183,77,0.1)', border: '1px solid var(--accent-color)', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--accent-color)' }}
                                    >
                                        <Info size={20} />
                                    </button>
                                </div>
                                <div style={{ marginTop: '20px', display: 'flex', gap: '10px' }}>
                                    <button
                                        onClick={() => {
                                            setGlossaryItem({ type: 'race', name: null, isDirect: false });
                                            setShowGlossary(true);
                                        }}
                                        style={{ flex: 1, padding: '12px', background: 'rgba(255,183,77,0.05)', borderRadius: '12px', fontSize: '13px', border: '1px solid rgba(255,183,77,0.2)', color: 'var(--accent-color)' }}
                                    >
                                        Кратко о расах
                                    </button>
                                    <button
                                        onClick={() => {
                                            setGlossaryItem({ type: 'class', name: null, isDirect: false });
                                            setShowGlossary(true);
                                        }}
                                        style={{ flex: 1, padding: '12px', background: 'rgba(255,183,77,0.05)', borderRadius: '12px', fontSize: '13px', border: '1px solid rgba(255,183,77,0.2)', color: 'var(--accent-color)' }}
                                    >
                                        Кратко о классах
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    )}

                    {step === 2 && (
                        <motion.div key="step2" initial={{ x: 20, opacity: 0 }} animate={{ x: 0, opacity: 1 }} exit={{ x: -20, opacity: 0 }}>
                            <div className="stats-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
                                {STATS.map(stat => (
                                    <div key={stat} className="glass" style={{ padding: '15px', borderRadius: '16px', textAlign: 'center' }}>
                                        <label style={{ display: 'block', fontSize: '14px', marginBottom: '8px', color: 'var(--text-secondary)' }}>{stat}</label>
                                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px' }}>
                                            <input
                                                type="number" value={formData.stats[stat]}
                                                onChange={e => handleStatChange(stat, e.target.value)}
                                                style={{ width: '50px', background: 'transparent', border: 'none', textAlign: 'center', fontSize: '20px', fontWeight: 'bold', color: 'white' }}
                                            />
                                            <span style={{ color: 'var(--accent-color)', fontWeight: 'bold' }}>
                                                {calculateMod(formData.stats[stat]) >= 0 ? '+' : ''}{calculateMod(formData.stats[stat])}
                                            </span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </motion.div>
                    )}

                    {step === 3 && (
                        <motion.div key="step3" initial={{ x: 20, opacity: 0 }} animate={{ x: 0, opacity: 1 }} exit={{ x: -20, opacity: 0 }}>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                                <div className="glass" style={{ padding: '20px', borderRadius: '16px' }}>
                                    <label style={{ display: 'block', marginBottom: '10px' }}>Класс Доспеха (AC)</label>
                                    <div style={{ display: 'flex', gap: '10px', marginBottom: '15px' }}>
                                        <input
                                            type="number" value={formData.ac} onChange={e => setFormData({ ...formData, ac: e.target.value === '' ? '' : parseInt(e.target.value) })}
                                            style={{ flex: 1, padding: '12px', borderRadius: '12px', border: '1px solid var(--border-color)', background: 'var(--card-bg)', color: 'white' }}
                                        />
                                        <button
                                            onClick={() => {
                                                const dexMod = calculateMod(formData.stats['Ловкость']);
                                                setFormData({ ...formData, ac: 10 + dexMod });
                                            }}
                                            style={{ padding: '0 15px', fontSize: '12px', background: 'rgba(255,183,77,0.1)', color: 'var(--accent-color)', border: '1px solid var(--accent-color)' }}
                                        >
                                            10 + Лов
                                        </button>
                                    </div>
                                </div>

                                <div className="glass" style={{ padding: '20px', borderRadius: '16px' }}>
                                    <label style={{ display: 'block', marginBottom: '10px' }}>Максимум Хитов (HP)</label>
                                    <input
                                        type="number" value={formData.hpMax} onChange={e => setFormData({ ...formData, hpMax: e.target.value === '' ? '' : parseInt(e.target.value) })}
                                        style={{ width: '100%', padding: '12px', borderRadius: '12px', border: '1px solid var(--border-color)', background: 'var(--card-bg)', color: 'white', marginBottom: '15px' }}
                                    />

                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                                        <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>Кинуть кость хитов (+Тел):</span>
                                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: '8px' }}>
                                            {[6, 8, 10, 12].map(d => (
                                                <button
                                                    key={d}
                                                    onClick={() => {
                                                        const roll = Math.floor(Math.random() * d) + 1;
                                                        const conMod = calculateMod(formData.stats['Телосложение']);
                                                        setFormData({ ...formData, hpMax: roll + conMod });
                                                    }}
                                                    className="dice-roll-btn"
                                                    style={{
                                                        padding: '8px 0',
                                                        fontSize: '12px',
                                                        background: 'var(--card-bg)',
                                                        border: '1px solid var(--border-color)',
                                                        display: 'flex',
                                                        flexDirection: 'column',
                                                        alignItems: 'center',
                                                        gap: '4px'
                                                    }}
                                                >
                                                    <Dices size={14} color="var(--accent-color)" />
                                                    d{d}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    )}

                    {step === 4 && (
                        <motion.div key="step4" initial={{ x: 20, opacity: 0 }} animate={{ x: 0, opacity: 1 }} exit={{ x: -20, opacity: 0 }}>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                                {SKILLS.map(skill => (
                                    <div
                                        key={skill}
                                        onClick={() => toggleSkill(skill)}
                                        className="glass"
                                        style={{
                                            padding: '12px 15px', borderRadius: '12px', display: 'flex', alignItems: 'center', gap: '15px',
                                            borderColor: formData.skills.includes(skill) ? 'var(--accent-color)' : 'var(--border-color)'
                                        }}
                                    >
                                        <div style={{
                                            width: '20px', height: '20px', borderRadius: '6px', border: '2px solid var(--border-color)',
                                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                                            backgroundColor: formData.skills.includes(skill) ? 'var(--accent-color)' : 'transparent'
                                        }}>
                                            {formData.skills.includes(skill) && <Check size={14} color="black" />}
                                        </div>
                                        <span>{skill}</span>
                                    </div>
                                ))}
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            <div style={{
                position: 'fixed', bottom: '0', left: '0', right: '0', padding: '20px',
                background: 'linear-gradient(transparent, var(--bg-color) 20%)'
            }}>
                <div style={{ display: 'flex', gap: '15px' }}>
                    {step > 1 && (
                        <button onClick={prevStep} style={{ flex: 1, backgroundColor: 'var(--card-bg)' }}>
                            Назад
                        </button>
                    )}
                    {step < 4 ? (
                        <button className="wizard-next-btn" onClick={nextStep} style={{ flex: 2, backgroundColor: 'var(--accent-color)', color: 'black' }}>
                            Далее <ArrowRight size={18} style={{ marginLeft: '8px' }} />
                        </button>
                    ) : (
                        <button className="save-btn" onClick={() => onSave(formData)} style={{ flex: 2, backgroundColor: 'var(--accent-secondary)', color: 'black' }}>
                            Сохранить <Save size={18} style={{ marginLeft: '8px' }} />
                        </button>
                    )}
                </div>
            </div>

            {/* Race/Class Glossary Modal */}
            <AnimatePresence>
                {showGlossary && (
                    <motion.div
                        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                        style={{ position: 'fixed', inset: 0, zIndex: 1000, background: 'rgba(0,0,0,0.8)', padding: '20px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                        onClick={() => setShowGlossary(false)}
                    >
                        <motion.div
                            initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9, y: 20 }}
                            className="glass"
                            style={{ width: '100%', maxWidth: '400px', padding: '25px', borderRadius: '24px', position: 'relative' }}
                            onClick={e => e.stopPropagation()}
                        >
                            <button
                                onClick={() => setShowGlossary(false)}
                                style={{ position: 'absolute', top: '20px', right: '20px', background: 'transparent', color: 'var(--text-secondary)' }}
                            >
                                <X size={24} />
                            </button>

                            {!glossaryItem?.name ? (
                                <>
                                    <h3 style={{ marginBottom: '20px' }}>Глоссарий {glossaryItem?.type === 'race' ? 'рас' : 'классов'}</h3>
                                    <p style={{ color: 'var(--text-secondary)', marginBottom: '20px' }}>Выберите {glossaryItem?.type === 'race' ? 'расу' : 'класс'} из основного списка, чтобы увидеть здесь описание, или найдите ниже:</p>
                                    <div style={{ maxHeight: '300px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                        {Object.entries(glossaryItem?.type === 'race' ? RACE_DETAILS : CLASS_DETAILS).map(([name, info]) => (
                                            <div
                                                key={name}
                                                onClick={() => setGlossaryItem({ type: glossaryItem.type, name, ...info })}
                                                style={{ padding: '12px', background: 'rgba(255,255,255,0.03)', borderRadius: '12px', cursor: 'pointer' }}
                                            >
                                                {name}
                                            </div>
                                        ))}
                                    </div>
                                </>
                            ) : (
                                <>
                                    <div style={{ display: 'flex', gap: '15px', alignItems: 'center', marginBottom: '20px' }}>
                                        <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: 'var(--accent-color)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'black' }}>
                                            <Info size={24} />
                                        </div>
                                        <h2 style={{ fontSize: '24px' }}>{glossaryItem.name}</h2>
                                    </div>

                                    {glossaryItem.image && (
                                        <div style={{ width: '100%', height: '220px', borderRadius: '20px', overflow: 'hidden', marginBottom: '20px', border: '1px solid rgba(255,183,77,0.2)' }}>
                                            <img src={glossaryItem.image} alt={glossaryItem.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                        </div>
                                    )}

                                    <p style={{ fontSize: '16px', lineHeight: '1.6', marginBottom: '15px' }}>{glossaryItem.desc}</p>
                                    <div style={{ background: 'rgba(255,183,77,0.05)', padding: '15px', borderRadius: '16px', marginBottom: '20px' }}>
                                        <strong style={{ color: 'var(--accent-color)', display: 'block', marginBottom: '4px', fontSize: '12px', textTransform: 'uppercase' }}>Особенности:</strong>
                                        <span style={{ fontSize: '14px' }}>{glossaryItem.features}</span>
                                    </div>
                                    <div style={{ display: 'flex', gap: '10px' }}>
                                        <a
                                            href={glossaryItem.link}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            style={{ flex: 2, background: 'var(--accent-color)', color: 'black', textDecoration: 'none', padding: '12px', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', fontWeight: 'bold' }}
                                        >
                                            На dnd.su <ExternalLink size={18} />
                                        </a>
                                        <button
                                            onClick={() => {
                                                if (glossaryItem.isDirect) {
                                                    setShowGlossary(false);
                                                } else {
                                                    setGlossaryItem({ ...glossaryItem, name: null });
                                                }
                                            }}
                                            style={{ flex: 1, backgroundColor: 'var(--card-bg)' }}
                                        >
                                            Назад
                                        </button>
                                    </div>
                                </>
                            )}
                        </motion.div>

                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default CharacterWizard;
