export const SPELL_PROGRESSION = {
    // Full Casters: Bard, Cleric, Druid, Sorcerer, Wizard
    "Full": {
        1: { 1: 2 },
        2: { 1: 3 },
        3: { 1: 4, 2: 2 },
        4: { 1: 4, 2: 3 },
        5: { 1: 4, 2: 3, 3: 2 },
        6: { 1: 4, 2: 3, 3: 3 },
        7: { 1: 4, 2: 3, 3: 3, 4: 1 },
        8: { 1: 4, 2: 3, 3: 3, 4: 2 },
        9: { 1: 4, 2: 3, 3: 3, 4: 3, 5: 1 },
        10: { 1: 4, 2: 3, 3: 3, 4: 3, 5: 2 },
        11: { 1: 4, 2: 3, 3: 3, 4: 3, 5: 2, 6: 1 },
        12: { 1: 4, 2: 3, 3: 3, 4: 3, 5: 2, 6: 1 },
        13: { 1: 4, 2: 3, 3: 3, 4: 3, 5: 2, 6: 1, 7: 1 },
        14: { 1: 4, 2: 3, 3: 3, 4: 3, 5: 2, 6: 1, 7: 1 },
        15: { 1: 4, 2: 3, 3: 3, 4: 3, 5: 2, 6: 1, 7: 1, 8: 1 },
        16: { 1: 4, 2: 3, 3: 3, 4: 3, 5: 2, 6: 1, 7: 1, 8: 1 },
        17: { 1: 4, 2: 3, 3: 3, 4: 3, 5: 2, 6: 1, 7: 1, 8: 1, 9: 1 },
        18: { 1: 4, 2: 3, 3: 3, 4: 3, 5: 2, 6: 1, 7: 1, 8: 1, 9: 1 },
        19: { 1: 4, 2: 3, 3: 3, 4: 3, 5: 2, 6: 2, 7: 2, 8: 1, 9: 1 },
        20: { 1: 4, 2: 3, 3: 3, 4: 3, 5: 2, 6: 2, 7: 2, 8: 1, 9: 1 }
    },
    // Half Casters: Paladin, Ranger (Artificer rounds up, so acts as half caster but starts lvl 1 - treating as Half for simplicity or custom logic)
    "Half": {
        1: {},
        2: { 1: 2 },
        3: { 1: 3 },
        4: { 1: 3 },
        5: { 1: 4, 2: 2 },
        6: { 1: 4, 2: 2 },
        7: { 1: 4, 2: 3 },
        8: { 1: 4, 2: 3 },
        9: { 1: 4, 2: 3, 3: 2 },
        10: { 1: 4, 2: 3, 3: 2 },
        11: { 1: 4, 2: 3, 3: 3 },
        12: { 1: 4, 2: 3, 3: 3 },
        13: { 1: 4, 2: 3, 3: 3, 4: 1 },
        14: { 1: 4, 2: 3, 3: 3, 4: 1 },
        15: { 1: 4, 2: 3, 3: 3, 4: 2 },
        16: { 1: 4, 2: 3, 3: 3, 4: 2 },
        17: { 1: 4, 2: 3, 3: 3, 4: 3, 5: 1 },
        18: { 1: 4, 2: 3, 3: 3, 4: 3, 5: 1 },
        19: { 1: 4, 2: 3, 3: 3, 4: 3, 5: 2 },
        20: { 1: 4, 2: 3, 3: 3, 4: 3, 5: 2 }
    },
    // Warlock (Pact Magic) - Slots are all of the same level (max level)
    "Warlock": {
        1: { 1: 1 },
        2: { 1: 2 },
        3: { 2: 2 },
        4: { 2: 2 },
        5: { 3: 2 },
        6: { 3: 2 },
        7: { 4: 2 },
        8: { 4: 2 },
        9: { 5: 2 },
        10: { 5: 2 },
        11: { 5: 3 }, // Mystic Arcanum logic separate, this is Pact Slots
        12: { 5: 3 },
        13: { 5: 3 },
        14: { 5: 3 },
        15: { 5: 3 },
        16: { 5: 3 },
        17: { 5: 4 },
        18: { 5: 4 },
        19: { 5: 4 },
        20: { 5: 4 }
    }
};

export const CASTER_TYPE = {
    "Бард": "Full",
    "Жрец": "Full",
    "Друид": "Full",
    "Чародей": "Full",
    "Волшебник": "Full",
    "Паладин": "Half",
    "Следопыт": "Half",
    "Изобретатель": "Half", // Simplification (Artificer is actually half-caster rounded up, starts lvl 1)
    "Чернокнижник": "Warlock",
    // Subclass specific logic (Eldritch Knight, Arcane Trickster) requires more complex handling, defaults to None
    "Воин": "None",
    "Плут": "None",
    "Варвар": "None",
    "Монах": "None"
};

export function getSpellSlotsForClass(className, level) {
    const type = CASTER_TYPE[className] || "None";
    if (type === "None") return {};

    // Artificer special case: Round Up
    if (className === "Изобретатель") {
        // Artificer follows Half Caster progression but starts at lvl 1 effectively shifted?
        // Actually Artificer is unique: spellcasting level = ceil(level/2). Standard Half is floor(level/2).
        // Let's us Full caster table but with half level rounded up?
        // Easier: Custom Artificer mapping or just use Half table with override for lvl 1.
        if (level === 1) return { 1: 2 };
        return SPELL_PROGRESSION["Half"][level];
    }

    return SPELL_PROGRESSION[type][level] || {};
}
