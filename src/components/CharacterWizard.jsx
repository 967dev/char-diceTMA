import React, { useState } from 'react';
import { ArrowLeft, ArrowRight, Save, Camera, Check, Dices, Upload } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const STATS = ['Сила', 'Ловкость', 'Телосложение', 'Интеллект', 'Мудрость', 'Харизма'];
const SKILLS = [
    'Акробатика (Лов)', 'Анализ (Инт)', 'Атлетика (Сил)', 'Восприятие (Муд)',
    'Выживание (Муд)', 'Выступление (Хар)', 'Запугивание (Хар)', 'История (Инт)',
    'Ловкость рук (Лов)', 'Магия (Инт)', 'Медицина (Муд)', 'Обман (Хар)',
    'Природа (Инт)', 'Проницательность (Муд)', 'Религия (Инт)', 'Скрытность (Лов)',
    'Убеждение (Хар)', 'Уход за животными (Муд)'
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
        inspiration: false,
        notes: ''
    });

    const nextStep = () => setStep(s => s + 1);
    const prevStep = () => setStep(s => s - 1);

    const handleStatChange = (stat, val) => {
        const numVal = val === '' ? 0 : parseInt(val);
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

    const handleJsonImport = (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (event) => {
            try {
                const data = JSON.parse(event.target.result);
                // Basic validation
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
                    equipment: data.equipment || []
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
                                <input
                                    type="text" placeholder="Имя персонажа"
                                    value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })}
                                    style={{ width: '100%', padding: '12px', borderRadius: '12px', border: '1px solid var(--border-color)', background: 'var(--card-bg)', color: 'white' }}
                                />
                                <input
                                    className="race-input"
                                    type="text" placeholder="Раса"
                                    value={formData.race} onChange={e => setFormData({ ...formData, race: e.target.value })}
                                    style={{ width: '100%', padding: '12px', borderRadius: '12px', border: '1px solid var(--border-color)', background: 'var(--card-bg)', color: 'white' }}
                                />
                                <input
                                    className="class-input"
                                    type="text" placeholder="Класс"
                                    value={formData.class} onChange={e => setFormData({ ...formData, class: e.target.value })}
                                    style={{ width: '100%', padding: '12px', borderRadius: '12px', border: '1px solid var(--border-color)', background: 'var(--card-bg)', color: 'white' }}
                                />
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
        </div>
    );
};

export default CharacterWizard;
