# Draw Steel + Automated Animations Bridge

A Foundry VTT module that bridges Draw Steel ability usage to Automated Animations, providing dynamic visual feedback for combat and abilities.

## Version Information

- **Version**: 2.1.0
- **Author**: stgreenb
- **Foundry Compatibility**: v13
- **Dependencies**:
  - Automated Animations 
  - Sequencer 
  - Draw Steel System
  - Draw Steel Qukck Strike
  - JB2A Animations 

## Installation

1. Install this module in Foundry VTT
2. Install required dependencies: Automated Animations and Sequencer
3. Import the DS animation menu (`ds-aa.json`) for fallbacks via:
   - Automated Animations → Menu Manager → Merge or Overwrite
4. Enable the module in world settings

## Animation Selection Logic

Once you import the 'ds-aa.json' you will have 30 fallback animations that will be used if you don't  enter an specific abilities name into AA. I picked fallback animatiosn that are in the free JB2a for D&D5e, but if you have the full patreon you can pick more options. 

The bridge follows a clear decision tree for animation selection:

### 1. Direct Match Check
First checks if the ability name exists in AA's database:
- If found → Uses that animation
- If not found → Falls back to DS animations

### 2. Fallback Animation Selection
DS animations are selected based on ability keywords and damage type (for now we only animate if there is damage):

#### **Strike Keyword Detection**
- **Has Strike** → It's an attack → Use Melee or Ranged animations
- **No Strike** → It's a buff/debuff → Use OnToken animations

#### **Attack Type Determination (Strike abilities)**
- **Ranged keyword** → `[DS] Range + <element>`
- **Melee keyword** → `[DS] Melee + <element>`
- **Both Ranged & Melee** → Prioritize Ranged
- **Neither** → Default to Melee

#### **Element/Damage Type Selection**
Priority order:
1. Element keyword (Fire, Cold, Lightning, etc.)
2. Damage type from the attack
3. None (if no element or damage type)

## Animation Examples

### Attack Examples (Has Strike)
- **"Bifurcated Incineration"** - Keywords: `[Ranged, Strike, Magic, Fire]`, Damage: Fire
  - → `[DS] Range + Fire`

- **"Melee Free Strike"** - Keywords: `[Melee, Strike]`, No damage type
  - → `[DS] Melee + None]`

### Buff/Debuff Examples (No Strike)
- **"Lightfall"** - Keywords: `[Area, Magic]`, Damage: Holy
  - → `[DS] On Token + Holy`



## Debug Mode

Enable debug mode in module settings to see:
- Animation selection process
- Keyword detection
- Damage type resolution
- Database lookup results

## Troubleshooting

### Animations Not Playing
1. Ensure DS fallback animations are imported via AA Menu Manager
2. Check that Automated Animations and Sequencer are active
3. Verify you own the source token or are GM
4. Enable debug mode to see selection process

### Wrong Animation Category
- Check that the ability has the correct keywords
- Verify Strike keyword presence for attack vs buff detection
- Confirm damage type is being passed correctly

### Missing Element Variants
- Ensure all DS animations are imported (30 total entries)
- Check AA Menu Manager for incomplete imports

## Files in This Distribution

- `module.json` - Module manifest
- `ds-aa-bridge.bundle.mjs` - Main module bundle
- `ds-aa.json` - DS animation menu for import
- `README.md` - This documentation

## To be Added
 - Monster (claw, bite, etc) animations
 - Ranged weapon vs ranged without weapon
 - Build specific animations for some abilties and/or make it easy for the community to submit them.

## Recent Changes (v2.1.0)
 - ✅ **Status Condition Animations**: Added automatic animations for status conditions applied via abilities
 - ✅ **Supported Conditions**: Dazed, Slowed, Bleeding, Blinded, Charmed, Frightened, Poisoned, Restrained, Stunned
 - ✅ **AA Integration**: Uses AA database entries ([DS] Status Name) for consistent animations
 - ✅ **Brief Visual Effects**: OnToken animations trigger when conditions are applied


## License

This module bridges Draw Steel to Automated Animations. Please ensure you have proper licenses for all dependent modules.

