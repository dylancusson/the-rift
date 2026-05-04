CREATE TABLE IF NOT EXISTS cards (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    energy INT,
    power INT,
    might INT,
    domain VARCHAR(100),
    card_types VARCHAR(100),
    tags VARCHAR(255),  -- Allows for storing multiple tags as a comma-separated string
    ability TEXT,           -- Allows for storing <b>Bold</b> or other HTML tags
    rarity VARCHAR(50),
    artist VARCHAR(255),
    card_set VARCHAR(255),
    image_url VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(255) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS collections (
    user_id INT NOT NULL,
    card_id INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (user_id, card_id),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (card_id) REFERENCES cards(id) ON DELETE CASCADE
);

-- Insert cards into DB
INSERT INTO cards (name, energy, power, might, domain, card_types, tags, ability, rarity, artist, card_set, image_url)
VALUES 
('Teemo, Strategist', 2, 1, 2, 'Mind', ',Unit,Champion,', ',Yordle,Teemo,', '[Hidden]:(Hide now for 1 rune to react later for 0.)<br>When I defend or I''m played from [Hidden], reveal the top 5 cards of your Main Deck. Deal 1 to an enemy unit here for each card with [Hidden], then recycle them.', 'Showcase', 'Mo Yan', 'Spiritforged', '/cards/teemo_strategist.avif'),
('Against the Odds', 2, NULL, NULL, 'Fury', ',Spell,', NULL, '[Reaction] (Play any time, even before spells and abilities resolve.)<br>Give a friendly unit at a battlefield +2 might this turn for each enemy unit there.', 'Common', 'Kudos Productions', 'Spiritforged', '/cards/against_the_odds.avif'),
('Armed Assailant', 6, 1, 6, 'Fury', ',Unit,', ',Noxus,', '[Accelerate] (You may pay 1 fury rune as an additional cost to have me enter ready.)<br>[Weaponmaster] (When you play me, you may [Equip] one of your Equipment to me for 1 rune less, even if it''s already attached.)', 'Common', 'Kudos Productions', 'Spiritforged', '/cards/armed_assailant.avif'),
('Blood Rush', 1, NULL, NULL, 'Fury', ',Spell,', NULL, '[Action] (Play on your turn or in showdowns.)<br>[Repeat] 1 rune (You may pay the additional cost to repeat this spell''s effect.)<br>Give a unit [Assault 2] this turn. (+2 might while it''s an attacker.)', 'Common', 'Six More Vodka', 'Spiritforged', '/cards/blood_rush.avif'),
('Gold', NULL, NULL, NULL, 'Colorless', ',Resource,', NULL, 'Kill this card: [Reaction] - [Add] 1 rune. (Abilities that add resources can''t be reacted to.)', 'Common', 'Kudos Productions', 'Spiritforged', '/cards/gold.avif'),
('Bushwack', 2, 1, NULL, 'Fury', ',Spell,', NULL, '[Hidden] (Hide now for 1 rune to react with later for 0.)<br>Friendly units enter ready this turn. Play a Gold gear token exhausted.', 'Common', 'Kudos Productions', 'Spiritforged', '/cards/bushwack.avif'),
('Detonate', 1, 1, NULL, 'Fury', ',Spell,', NULL, 'Kill a gear. Its controller draws 2.', 'Common', 'Kudos Productions', 'Spiritforged', '/cards/detonate.avif'),
('Eager Drakehound', 3, 1, 3, 'Fury', ',Unit,', ',Dog,Dragon,Noxus,', 'I enter ready.', 'Common', 'Michal Ivan', 'Spiritforged', '/cards/eager_drakehound.avif'),
('Gem Jammer', 2, NULL, 2, 'Fury', ',Unit,', ',Mech,Bandle City,', 'When you play me, give a unit [Ganking] this turn. (It can move from battlefield to battlefield.)', 'Common', 'Caravan Studio', 'Spiritforged', '/cards/gem_jammer.avif'),
('Sentinel Adept', 3, NULL, 3, 'Fury', ',Unit,', ',Shadow Isles,Sentinel,', '[Weaponmaster] (When you play me, you may [Equip] one of your Equipment to me for 1 rune less, even if it''s already attached.)', 'Common', 'Wild Blue Studios', 'Spiritforged', '/cards/sentinel_adept.avif'),
('Serrated Dirk', 1, NULL, NULL, 'Fury', ',Gear,', ',Equipment,', '[Equip] 1 fury rune (Attach this to a unit you control.)<br>[Assault 2] (+2 might while I''m an attacker.)', 'Common', '黯荧岛 Dark Glow', 'Spiritforged', '/cards/serrated_dirk.avif'),
('Void Drone', 3, NULL, 3, 'Fury', ',Unit,', ',The Void,', 'I cost 2 less to play from anywhere other than your hand.', 'Common', 'Wild Blue Studios', 'Spiritforged', '/cards/void_drone.avif'),
('Angle Shot', 2, NULL, NULL, 'Fury', ',Spell,', NULL, '[Reaction] (Play any time, even before spells and abilities resolve.)<br>Choose a unit and an Equipment with the same controller. Attach that Equipment to that unit or detach that Equipment from that unit. Draw 1.', 'Uncommon', 'Kudos Productions', 'Spiritforged', '/cards/angle_shot.avif'),
('Battering Ram', 5, NULL, 5, 'Fury', ',Unit,', ',Trifarian,Noxus,', 'I cost 1 less for each card you''ve played this turn, to a minimum of 1.', 'Uncommon', 'Six More Vodka', 'Spiritforged', '/cards/battering_ram.avif'),
('Blast Corps Cadet', 2, NULL, 2, 'Fury', ',Unit,', ',Piltover,', 'You may pay 1 fury rune as an additional cost to play me.<br>When you play me, if you paid the additional cost, deal 2 to a unit at a battlefield.', 'Uncommon', 'Six More Vodka', 'Spiritforged', '/cards/blast_corps_cadet.avif'),
('Minotaur Reckoner', 5, NULL, 5, 'Fury', ',Unit,', ',Noxus,', 'Units can''t move to base.', 'Uncommon', 'Six More Vodka', 'Spiritforged', '/cards/minotaur_reckoner.avif'),
('Perched Grimwyrm', 4, NULL, 5, 'Fury', ',Unit,', ',Dragon,Shadow Isles,', 'Play me only to a battlefield you conquered this turn. (You can''t play me anywhere else.)', 'Uncommon', 'Kudos Productions & 黯荧岛 Dark Glow', 'Spiritforged', '/cards/perched_grimwyrm.avif'),
('Recurve Bow', 2, NULL, NULL, 'Fury', ',Gear,', ',Equipment,', '[Equip] 1 fury rune (Attach this to a unit you control.)<br>When I attack or defend, deal 2 to an enemy unit here.', 'Uncommon', '黯荧岛 Dark Glow', 'Spiritforged', '/cards/recurve_bow.avif'),
('Sudden Storm', 3, NULL, NULL, 'Fury', ',Spell,', NULL, '[Hidden] (Hide now for 1 rune to react with later for 0.)<br>[Action] (Play on your turn or in showdowns.)<br>Deal 2 to a unit at a battlefield. If it''s attacking, deal 4 to it instead.', 'Uncommon', 'Kudos Productions', 'Spiritforged', '/cards/sudden_storm.avif'),
('Void Hatchling', 2, NULL, 2, 'Fury', ',Unit,', ',The Void,', 'If you would reveal cards from a deck, look at the top card first. You may recycle it. Then reveal those cards.', 'Uncommon', 'Kudos Productions', 'Spiritforged', '/cards/void_hatchling.avif'),
('Assembly Rig', 4, NULL, NULL, 'Fury', ',Gear,', NULL, '1 fury rune, Recycle a unit from your trash and discard me: Play a 3 might Mech unit token to your base.', 'Rare', 'Six More Vodka', 'Spiritforged', '/cards/assembly_rig.avif'),
('Draven, Vanquisher', 4, NULL, 4, 'Fury', ',Unit,Champion,', ',Draven,Noxus,', 'When I win a combat, play a Gold gear token exhausted.<br>When I attack or defend, you may pay 1 fury rune. If you do, give me +2 might this turn.', 'Rare', 'League Splash Team', 'Spiritforged', '/cards/draven_vanquisher.avif'),
('Ferrous Forerunner', 6, 1, 6, 'Fury', ',Unit,', ',Mech,Yordle,Bandle City,', '[Deathknell] Play two 3 might Mech unit tokens to your base. (When I die, get the effect.)', 'Rare', 'Envar Studio', 'Spiritforged', '/cards/ferrous_forerunner.avif'),
('Long Sword', 2, 1, 2, 'Fury', ',Gear,', ',Equipment,', '[Quick-Draw] (This has [Reaction]. When you play it, attach it to a unit you control.)<br>[Equip] (1 fury rune: Attach this to a unit you control.)', 'Rare', '黯荧岛 Dark Glow', 'Spiritforged', '/cards/long_sword.avif')
;
