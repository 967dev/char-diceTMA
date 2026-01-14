import React from 'react';
import { Plus, User, Trash2, ChevronRight, HelpCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const Lobby = ({ characters, onSelect, onCreate, onDelete, onStartOnboarding }) => {
    return (
        <div className="lobby animate-fade-in" style={{ padding: '20px' }}>
            <header style={{ marginBottom: '30px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h1 style={{ fontSize: '24px', fontWeight: 'bold' }}>Мои Герои</h1>
                <button
                    onClick={onStartOnboarding}
                    style={{ padding: '8px', background: 'transparent', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '6px' }}
                >
                    <HelpCircle size={20} />
                    <span style={{ fontSize: '14px' }}>Помощь</span>
                </button>
            </header>

            <div className="character-list" style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                <AnimatePresence>
                    {characters.map((char) => (
                        <motion.div
                            key={char.id}
                            initial={{ x: -20, opacity: 0 }}
                            animate={{ x: 0, opacity: 1 }}
                            exit={{ x: 20, opacity: 0 }}
                            className="glass"
                            style={{
                                borderRadius: '16px',
                                padding: '15px',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '15px',
                                cursor: 'pointer',
                                position: 'relative',
                                overflow: 'hidden'
                            }}
                            onClick={() => onSelect(char.id)}
                        >
                            {/* Character Avatar or Placeholder */}
                            <div
                                style={{
                                    width: '50px',
                                    height: '50px',
                                    borderRadius: '12px',
                                    backgroundColor: 'rgba(255,255,255,0.05)',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    overflow: 'hidden',
                                    backgroundImage: char.image ? `url(${char.image})` : 'none',
                                    backgroundSize: 'cover',
                                    backgroundPosition: 'center'
                                }}
                            >
                                {!char.image && <User size={24} color="var(--text-secondary)" />}
                            </div>

                            {/* Info */}
                            <div style={{ flex: 1 }}>
                                <h3 style={{ fontSize: '18px', marginBottom: '4px' }}>{char.name || 'Безымянный'}</h3>
                                <p style={{ fontSize: '14px', color: 'var(--text-secondary)' }}>
                                    {char.race || 'Раса'} · {char.class || 'Класс'} · {char.level || 1} ур.
                                </p>
                            </div>

                            {/* Actions */}
                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        onDelete(char.id);
                                    }}
                                    style={{
                                        padding: '8px',
                                        backgroundColor: 'transparent',
                                        border: 'none',
                                        color: 'rgba(255,255,255,0.3)'
                                    }}
                                    className="delete-btn"
                                >
                                    <Trash2 size={18} />
                                </button>
                                <ChevronRight size={20} color="var(--text-secondary)" />
                            </div>
                        </motion.div>
                    ))}
                </AnimatePresence>

                {characters.length === 0 && (
                    <div style={{
                        textAlign: 'center',
                        padding: '40px 20px',
                        color: 'var(--text-secondary)',
                        border: '2px dashed var(--border-color)',
                        borderRadius: '16px'
                    }}>
                        <p>У вас пока нет персонажей. Создайте своего первого героя!</p>
                    </div>
                )}
            </div>

            {/* Create Character Button at the end of the list */}
            <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={onCreate}
                className="glass create-hero-btn"
                style={{
                    width: '100%',
                    padding: '20px',
                    borderRadius: '16px',
                    border: '2px dashed var(--accent-color)',
                    backgroundColor: 'rgba(255, 193, 7, 0.05)',
                    color: 'var(--accent-color)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '12px',
                    fontSize: '18px',
                    fontWeight: 'bold',
                    cursor: 'pointer',
                    marginTop: '10px'
                }}
            >
                <Plus size={24} />
                <span>Создать героя</span>
            </motion.button>
        </div>
    );
};

export default Lobby;
