import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, HelpCircle, X, ChevronDown, ChevronUp } from 'lucide-react';

const HELP_STAGES = {
    lobby: {
        title: "Ваши Герои",
        tips: [
            "Здесь список всех ваших персонажей. Нажмите на карточку, чтобы открыть лист героя.",
            "Чтобы добавить нового, нажмите кнопку '+ Создать героя' в самом низу."
        ]
    },
    wizard: {
        1: {
            title: "Личность (1/4)",
            tips: [
                "Введите имя, расу и класс персонажа. Это основа вашего героя.",
                "Вы также можете загрузить изображение, нажав на иконку камеры."
            ]
        },
        2: {
            title: "Характеристики (2/4)",
            tips: [
                "Распределите очки параметров. Модификаторы рассчитываются автоматически.",
                "Обычно игроки используют набор: 15, 14, 13, 12, 10, 8."
            ]
        },
        3: {
            title: "Защита и Здоровье (3/4)",
            tips: [
                "Введите КД (Класс Доспеха), обычно 10 + модификатор Ловкости. Я добавил кнопку для быстрого расчета!",
                "Укажите ХП. Можно бросить кость хитов (d6-d12), и я сам прибавлю ваш бонус Телосложения!"
            ]
        },
        4: {
            title: "Навыки (4/4)",
            tips: [
                "Выберите навыки, которыми владеет ваш герой. Это добавит бонус мастерства к проверкам.",
                "Закончив, нажмите 'Сохранить'!"
            ]
        }
    },
    sheet: {
        title: "Лист Персонажа",
        tips: [
            "Нажимайте на любую характеристику или навык, чтобы бросить d20.",
            "Нажмите на цифры здоровья сверху, чтобы быстро добавить урон или исцеление.",
            "Во вкладке 'Бой' можно управлять ячейками заклинаний и делать 'Долгий отдых'."
        ]
    }
};

const Onboarding = ({ onComplete, currentView, wizardStep }) => {
    const [isMinimized, setIsMinimized] = useState(false);

    const getStageProps = () => {
        if (currentView === 'wizard') {
            return HELP_STAGES.wizard[wizardStep] || HELP_STAGES.wizard[1];
        }
        return HELP_STAGES[currentView] || HELP_STAGES.lobby;
    };

    const stage = getStageProps();

    return (
        <div style={{
            position: 'fixed',
            top: 'auto',
            bottom: '20px',
            left: '10px',
            right: '10px',
            zIndex: 4000,
            pointerEvents: 'none'
        }}>
            <AnimatePresence>
                <motion.div
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    className="glass"
                    style={{
                        padding: '15px',
                        borderRadius: '20px',
                        border: '1px solid var(--accent-color)',
                        pointerEvents: 'auto',
                        boxShadow: '0 8px 32px rgba(0,0,0,0.5)',
                        background: 'rgba(20, 20, 25, 0.95)'
                    }}
                >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: isMinimized ? 0 : '10px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--accent-color)' }}>
                            <HelpCircle size={18} />
                            <span style={{ fontWeight: 'bold', fontSize: '14px' }}>Софт-Гайд: {stage.title}</span>
                        </div>
                        <div style={{ display: 'flex', gap: '8px' }}>
                            <button
                                onClick={() => setIsMinimized(!isMinimized)}
                                style={{ background: 'transparent', padding: '4px', color: 'var(--text-secondary)' }}
                            >
                                {isMinimized ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                            </button>
                            <button
                                onClick={onComplete}
                                style={{ background: 'transparent', padding: '4px', color: 'var(--text-secondary)' }}
                            >
                                <X size={18} />
                            </button>
                        </div>
                    </div>

                    {!isMinimized && (
                        <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                        >
                            <div style={{ paddingLeft: '5px', marginTop: '10px' }}>
                                {stage.tips.map((tip, i) => (
                                    <div key={i} style={{
                                        fontSize: '13px',
                                        lineHeight: '1.4',
                                        color: 'var(--text-secondary)',
                                        marginBottom: '10px',
                                        display: 'flex',
                                        gap: '10px'
                                    }}>
                                        <div style={{ color: 'var(--accent-color)', marginTop: '3px', flexShrink: 0 }}>
                                            <Sparkles size={12} />
                                        </div>
                                        <span>{tip}</span>
                                    </div>
                                ))}
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '10px' }}>
                                <button
                                    onClick={onComplete}
                                    style={{
                                        fontSize: '11px',
                                        background: 'transparent',
                                        color: 'var(--accent-color)',
                                        border: '1px solid var(--accent-color)',
                                        padding: '4px 10px',
                                        borderRadius: '8px',
                                        opacity: 0.7
                                    }}
                                >
                                    Завершить обучение
                                </button>
                            </div>
                        </motion.div>
                    )}
                </motion.div>
            </AnimatePresence>
        </div>
    );
};

export default Onboarding;
