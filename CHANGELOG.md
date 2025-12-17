# Changelog

All notable changes to the Draw Steel + Automated Animations Bridge module will be documented in this file.

## [2.1.0] - 2024-12-17

### Added
- Status condition animations support for Draw Steel Quick Strike
- Automatic animations when conditions are applied: Dazed, Slowed, Bleeding, Blinded, Charmed, Frightened, Poisoned, Restrained, and Stunned
- Brief 1.5 second onToken animations when status conditions are applied
- Integration with AA database entries for status animations
- Hook listeners for `ds-quick-strikeStatusApplied` and `ds-quick-strikeStatusUndone` events

### Features
- Status animations trigger automatically when conditions are applied via abilities
- Uses AA database entries ([DS] Status Name) for consistent animations
- Graceful fallback when AA is not available
- No animations for status removal (logging only)
- Maintains performance with parallel animation execution

## [2.0.2] - 2024-12-15

### Fixed
- Include module.json in GitHub release assets for Foundry VTT installation
- Ensure both zip and manifest files are available

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