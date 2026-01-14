import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, RotateCcw } from 'lucide-react';

const DICE_TYPES = [4, 6, 8, 10, 12, 20, 100];

const DiceRoller = ({ isOpen, onClose, onRoll }) => {
    const [selectedDice, setSelectedDice] = useState({}); // { 20: 1, 6: 2 }
    const [modifier, setModifier] = useState(0);
    const [results, setResults] = useState(null);
    const [isRolling, setIsRolling] = useState(false);

    const addDice = (type) => {
        setSelectedDice({
            ...selectedDice,
            [type]: (selectedDice[type] || 0) + 1
        });
    };

    const clear = () => {
        setSelectedDice({});
        setModifier(0);
        setResults(null);
    };

    const roll = () => {
        if (Object.keys(selectedDice).length === 0) return;

        setIsRolling(true);
        setTimeout(() => {
            const rollResults = [];
            let total = 0;

            Object.entries(selectedDice).forEach(([type, count]) => {
                for (let i = 0; i < count; i++) {
                    const val = Math.floor(Math.random() * type) + 1;
                    rollResults.push({ type, val });
                    total += val;
                }
            });

            setResults({
                rolls: rollResults,
                total: total + modifier,
                formula: Object.entries(selectedDice)
                    .map(([type, count]) => `${count}d${type}`)
                    .join(' + ') + (modifier !== 0 ? ` + ${modifier}` : '')
            });
            setIsRolling(false);
            if (onRoll) onRoll(total + modifier);
        }, 600);
    };

    if (!isOpen) return null;

    return (
        <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="glass"
            style={{
                position: 'fixed', bottom: 0, left: 0, right: 0,
                zIndex: 1000, borderTopLeftRadius: '24px', borderTopRightRadius: '24px',
                padding: '20px', paddingBottom: 'calc(20px + env(safe-area-inset-bottom))',
                maxHeight: '80vh', overflowY: 'auto'
            }}
        >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                <h3 style={{ fontSize: '20px' }}>Бросок Кубов</h3>
                <div style={{ display: 'flex', gap: '10px' }}>
                    <button onClick={clear} style={{ padding: '8px', background: 'transparent' }}><RotateCcw size={20} /></button>
                    <button onClick={onClose} style={{ padding: '8px', background: 'transparent' }}><X size={20} /></button>
                </div>
            </div>

            {!results ? (
                <>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '10px', marginBottom: '20px' }}>
                        {DICE_TYPES.map(d => (
                            <button
                                key={d}
                                onClick={() => addDice(d)}
                                style={{
                                    height: '60px', borderRadius: '12px', display: 'flex', flexDirection: 'column',
                                    alignItems: 'center', justifyContent: 'center', position: 'relative',
                                    backgroundColor: selectedDice[d] ? 'rgba(255,193,7,0.1)' : 'var(--card-bg)',
                                    borderColor: selectedDice[d] ? 'var(--accent-color)' : 'transparent'
                                }}
                            >
                                <span style={{ fontSize: '10px', color: 'var(--text-secondary)' }}>d</span>
                                <span style={{ fontSize: '18px', fontWeight: 'bold' }}>{d}</span>
                                {selectedDice[d] > 0 && (
                                    <div style={{
                                        position: 'absolute', top: '-5px', right: '-5px',
                                        background: 'var(--accent-color)', color: 'black',
                                        width: '20px', height: '20px', borderRadius: '10px', fontSize: '12px', fontWeight: 'bold',
                                        display: 'flex', alignItems: 'center', justifyContent: 'center'
                                    }}>
                                        {selectedDice[d]}
                                    </div>
                                )}
                            </button>
                        ))}
                    </div>

                    <div style={{ marginBottom: '20px' }}>
                        <label style={{ display: 'block', fontSize: '14px', marginBottom: '8px', color: 'var(--text-secondary)' }}>Модификатор</label>
                        <input
                            type="number" value={modifier} onChange={e => setModifier(parseInt(e.target.value) || 0)}
                            style={{ width: '100%', padding: '12px', borderRadius: '12px', border: '1px solid var(--border-color)', background: 'var(--card-bg)', color: 'white', fontSize: '18px' }}
                        />
                    </div>

                    <button
                        disabled={Object.keys(selectedDice).length === 0}
                        onClick={roll}
                        style={{ width: '100%', padding: '15px', borderRadius: '16px', backgroundColor: 'var(--accent-color)', color: 'black', fontWeight: 'bold', fontSize: '18px' }}
                    >
                        {isRolling ? 'Бросаем...' : 'БРОСОК'}
                    </button>
                </>
            ) : (
                <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}>
                    <div style={{ textAlign: 'center', padding: '20px 0' }}>
                        <p style={{ color: 'var(--text-secondary)', marginBottom: '10px' }}>{results.formula}</p>
                        <h2 style={{ fontSize: '48px', color: 'var(--accent-color)' }}>{results.total}</h2>
                        <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: '8px', marginTop: '20px' }}>
                            {results.rolls.map((r, i) => (
                                <motion.div
                                    key={i}
                                    initial={{ y: 20, opacity: 0 }}
                                    animate={{ y: 0, opacity: 1 }}
                                    transition={{ delay: i * 0.05, type: 'spring' }}
                                    style={{ padding: '8px 12px', background: 'rgba(255,255,255,0.05)', borderRadius: '8px', fontSize: '14px' }}
                                >
                                    d{r.type}: <strong>{r.val}</strong>
                                </motion.div>
                            ))}
                        </div>
                    </div>
                    <button
                        onClick={() => setResults(null)}
                        style={{ width: '100%', marginTop: '20px', padding: '12px', borderRadius: '12px', background: 'var(--card-bg)' }}
                    >
                        Ещё раз
                    </button>
                </motion.div>
            )}
        </motion.div>
    );
};

export default DiceRoller;
