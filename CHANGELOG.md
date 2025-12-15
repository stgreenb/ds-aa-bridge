# Changelog

All notable changes to the Draw Steel + Automated Animations Bridge module will be documented in this file.

## [2.0.1] - 2024-12-15

### Fixed
- Corrected GitHub repository URLs from `steve` to `stgreenb`
- Fixed zip file creation process for proper Foundry VTT installation
- Improved GitHub Actions workflow for reliable releases

## [2.0.0] - 2024-12-15

### Added
- Initial release of DS-AA Bridge
- Animation fallback system with 30 DS animations
- Support for melee, ranged, and on-token animations
- Element-based animation selection (Fire, Cold, Lightning, Acid, Poison, Thunder, Psychic, Radiant, Necrotic, Force, Holy)
- Damage type detection for appropriate animation selection
- Strike keyword detection to differentiate attacks from buffs/debuffs
- Debug mode for troubleshooting animation selection
- Integration with Draw Steel Quick Strike hooks

### Features
- Automatic animation selection based on ability keywords and damage type
- Fallback to DS animations when specific ability is not found in AA database
- Priority system: Direct match → DS fallback based on keywords/damage
- Support for "None" damage type for abilities without elemental damage

### Dependencies
- Automated Animations
- Sequencer
- Draw Steel System
- Draw Steel Quick Strike
- JB2A Animations (free D&D5e versions used for fallbacks)