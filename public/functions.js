// credit
//   - https://www.dndbeyond.com/forums/d-d-beyond-general/general-discussion/94605-script-to-generate-a-table-of-data-relevant-to-the
//   - https://colab.research.google.com/drive/1rfc6Qd7l-PSdIHKEMnQdeImXL_XjI5-v?usp=sharing
// i just rewrote it to js and fixed a couple bugs

function get_hp(char_data) {
  let base_hp = char_data.data.baseHitPoints; // purely determined by hit dice
  let removed_hp = char_data.data.removedHitPoints; // damage
  let temp_hp = char_data.data.temporaryHitPoints;
  let bonus_hp_input = char_data.data.bonusHitPoints;
  // TODO: add HP bonus from feats like Tough and magic items like berserker axe
  if (Number.isInteger(bonus_hp_input)) {
    bonus_hp = bonus_hp_input;
  } else {
    bonus_hp = 0;
  }
  let con_score = calc_ability_score(char_data, 'CON');
  let con_mod = calc_score_modifier(con_score);
  if (char_data.data.race.fullName == 'Hill Dwarf') {
    con_mod += 1; // not really, but it has the same effect
  }
  let level = get_total_level(char_data);
  let max_hp = base_hp + (con_mod * level);
  let hp_remaining = max_hp - removed_hp + temp_hp + bonus_hp;
  let hp_str = hp_remaining + ' / ' +  max_hp;
  return hp_str;
}

function get_total_level(char_data) {
  let level = 0;
  let class_list = char_data.data.classes;
  class_list.forEach(char_class => level += char_class.level);
  return level;
}

function calc_barbarian_ac(char_data) {
  // check if they're wearing armor
  let AC;
  let wearing_armor = 0;
  char_data.data.inventory.forEach(item => {
    if (item.definition.filterType == 'Armor' && item.equipped && item.definition.armorTypeId < 4) {
      wearing_armor += 1;
    }
  });
  // if so calc_standard_ac
  if (wearing_armor > 0) {
    AC = calc_standard_ac(char_data);
  } else {
    // unarmored defense = 10 + DEX + CON
    let dex_score = calc_ability_score(char_data, 'DEX');
    let con_score = calc_ability_score(char_data, 'CON');
    let dex_mod = calc_score_modifier(dex_score);
    let con_mod = calc_score_modifier(con_score);
    AC = 10 + dex_mod + con_mod;
  }
  return AC;
}

function calc_standard_ac(char_data) {
  let AC = 0;
  let dex_score = calc_ability_score(char_data, 'DEX');
  let dex_mod = calc_score_modifier(dex_score);
  char_data.data.inventory.forEach(item => {
    if (item.equipped && item.definition.filterType == 'Armor') {
      if (item.definition.armorTypeId == 1) { // light
        AC += item.definition.armorClass + dex_mod;
      } else if (item.definition.armorTypeId == 2) { // medium
        if (dex_mod > 2) {
          dex_bonus = 2;
        } else {
          dex_bonus = dex_mod;
        }
        AC += item.definition.armorClass + dex_bonus;
      } else if (item.definition.armorTypeId == 3) { // heavy
        AC += item.definition.armorClass;
      } else if (item.definition.armorTypeId == 4) { // shield
        AC += item.definition.armorClass;
      }
    }
  });
  if (AC == 0) {
    AC = 10 + dex_mod;
  }
  return AC;
}

function get_bonus_ac(char_data) {
  let bonus_ac = 0;
  // for some reason this is picking up neither bracers of defense nor black dragon mask.
  let modifiers = char_data.data.modifiers;
  for (mod in modifiers) {
    modifiers[mod].forEach(entry => {
      if (entry.subType == 'armor-class' && entry.type == 'bonus') {
        bonus_ac += entry['value'];
      }
    });
  }
  return bonus_ac;
}

function get_ac(char_data) {
  // need to get class name because of fucking unarmored defense
  //thanksObama
  // also need to add monk AC
  // also need to add logic for calculating max AC based on multiple means
  let its_a_fucking_barbarian = 0;
  let AC;
  char_data.data.classes.forEach(char_class => {
    if (char_class.definition.name == 'Barbarian') {
      its_a_fucking_barbarian += 1;
    }
  });
  if (its_a_fucking_barbarian > 0) {
    AC = calc_barbarian_ac(char_data);
  } else {
    AC = calc_standard_ac(char_data);
  }
  AC += get_bonus_ac(char_data);
  return AC;
}

function get_sense(char_data, sense) {
  let senses = {
    'perception': 'WIS',
    'investigation': 'INT',
    'insight': 'WIS'
  };
  // 10 + sense + proficiency
  let ability_score = calc_ability_score(char_data, senses[sense]);
  let score_modifier = calc_score_modifier(ability_score);
  let prof_multiplier = check_proficiency(char_data, sense);
  let prof_bonus = get_proficiency_bonus(char_data);
  let proficiency_bonus = prof_multiplier * prof_bonus;
  return 10 + score_modifier + proficiency_bonus;
}

function get_proficiency_bonus(char_data) {
  let level = get_total_level(char_data);
  let prof_bonus = 0;
  if (level <= 4) {
    prof_bonus = 2;
  } else if (level > 4 && level <= 8) {
    prof_bonus = 3;
  } else if (level > 8 && level <= 12) {
    prof_bonus = 4;
  } else if (level > 12 && level <= 16) {
    prof_bonus = 5;
  } else if (level > 16 && level <= 20) {
    prof_bonus = 6;
  } else {
    prof_bonus = 7;
  }
  return prof_bonus;
}
/*
def get_spell_slots(char_data):
  pass # char_data['data']['spellSlots'] - display available/used
*/
function check_proficiency(char_data, skill) {
  // add capability to list proficiencies
  let modifiers = char_data.data.modifiers;
  let prof_multiplier = 0;
  for (mod in modifiers) {
    modifiers[mod].forEach(item => {
      if (item.subType == skill && item.type == 'proficiency') {
        prof_multiplier = 1;
      } else if (item.subType == skill && item.type == 'expertise') {
        prof_multiplier = 2;
      }
    });
  }
  return prof_multiplier;
}

function calc_ability_score(char_data, ability) {
  let lookup = {
    'STR': [0, 'strength-score'],
    'DEX': [1, 'dexterity-score'],
    'CON': [2, 'constitution-score'],
    'INT': [3, 'intelligence-score'],
    'WIS': [4, 'wisdom-score'],
    'CHA': [5, 'charisma-score']
  };
  let col = lookup[ability];
  let score_base = char_data.data.stats[col[0]].value;
  let score_bonus_input = char_data.data.bonusStats[col[0]].value;
  let score_bonus = 0;
  if (Number.isInteger(score_bonus_input)) {
    score_bonus = score_bonus_input;
  } else {
    score_bonus = 0;
  }
  let modifiers = char_data.data.modifiers;
  let score_modifier = 0;
  for (mod in modifiers) {
    modifiers[mod].forEach(item => {
      if (item.subType == col[1] && item.type == 'bonus') {
        score_modifier += item.value;
      }
    });
  }
  return parseInt(score_base + score_modifier + score_bonus);
}

function calc_score_modifier(score) {
  return Math.floor((score - 10) / 2);
}
