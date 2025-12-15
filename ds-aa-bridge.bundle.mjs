/**
 * Draw Steel + Automated Animations Bridge v2.0.0
 * Bridge Draw Steel ability uses to Automated Animations via public APIs
 *
 * BUNDLED FOR REVIEW PURPOSES
 * Generated: 2025-12-15T21:18:30.525Z
 *
 * Authors: Steve Greenberg
 * Repository: https://github.com/steve/ds-aa-bridge
 *
 * This is a bundled version for code review purposes.
 * For production use, install via Foundry VTT module manager.
 */


// ======================================
// File: main.js
// ======================================

// Import from: ./constants.js;
// Import from: ./hooks/draw-steel-hook.js;

/**
 * Main module class for ds-aa-bridge
 */
class DSAABridge {
  constructor() {
    this.drawSteelHook = null;
  }

  /**
   * Internal logging method with debug mode support
   * @param {string} level - Log level ('info', 'warn', 'error', 'debug')
   * @param {string} message - Log message
   * @param {...*} args - Additional arguments to log
   */
  _log(level, message, ...args) {
    // Try to get debug setting, but don't fail if settings aren't registered yet
    let isDebug = false;
    try {
      isDebug = this.getSetting(SETTING_DEBUG_MODE);
    } catch (error) {
      // Settings not registered yet, assume debug is false
    }

    if (level === 'debug' && !isDebug) {
      return;
    }

    const logMessage = `[${MODULE_ID}] ${message}`;

    switch (level) {
      case 'error':
        console.error(logMessage, ...args);
        break;
      case 'warn':
        console.warn(logMessage, ...args);
        break;
      case 'debug':
        console.debug(logMessage, ...args);
        break;
      default:
        console.log(logMessage, ...args);
    }
  }

  /**
   * Initialize the module
   */
  init() {
    // Register settings first
    this.registerSettings();

    
    // Now we can safely log
    this._log('info', 'Initializing Draw Steel + AA Bridge');

    // Initialize hook if enabled
    if (this.getSetting(SETTING_ENABLED)) {
      this.enableHook();
    }
  }

  /**
   * Setup module when ready
   */
  setup() {
    this._log('info', 'Setting up Draw Steel + AA Bridge');
    this.checkDependencies();
    this.setupAAIntegration();
  }

  /**
   * Ready module - called when game is fully loaded
   */
  async ready() {
    console.log('[ds-aa-bridge] Draw Steel + AA Bridge ready');
    this._log('info', 'Draw Steel + AA Bridge ready');

    // Check if DS fallback animations are loaded after AA is ready
    Hooks.once('automatedAnimationsReady', async () => {
        await this.checkAAFallbacksLoaded();
    });

    // Fallback timer if automatedAnimationsReady doesn't fire
    setTimeout(async () => {
        await this.checkAAFallbacksLoaded();
    }, 5000);
  }

  /**
   * Register module settings
   */
  registerSettings() {
    game.settings.register(MODULE_ID, SETTING_ENABLED, {
      name: 'Enable AA Integration',
      hint: 'Enable animation integration with Automated Animations',
      scope: 'world',
      config: true,
      default: true,
      type: Boolean,
      onChange: (value) => {
        if (value) {
          this.enableHook();
        } else {
          this.disableHook();
        }
      }
    });

    game.settings.register(MODULE_ID, SETTING_DEBUG_MODE, {
      name: 'Debug Mode',
      hint: 'Enable debug logging for troubleshooting',
      scope: 'client',
      config: true,
      default: false,
      type: Boolean
    });
  }

  /**
   * Get a setting value
   * @param {string} key - The setting key
   * @returns {*} The setting value
   */
  getSetting(key) {
    try {
      return game.settings.get(MODULE_ID, key);
    } catch (error) {
      console.error(`[${MODULE_ID}] Error getting setting ${key}:`, error);
      return null;
    }
  }

  /**
   * Enable the Draw Steel hook
   * @returns {boolean} True if hook was enabled successfully
   */
  enableHook() {
    try {
      if (this.drawSteelHook) {
        this._log('debug', 'Hook already enabled');
        return true;
      }

      this.drawSteelHook = new DrawSteelHook();
      this.drawSteelHook.register();

      this._log('info', 'Draw Steel hook enabled');
      return true;
    } catch (error) {
      this._log('error', 'Failed to enable Draw Steel hook', error);
      return false;
    }
  }

  /**
   * Disable the Draw Steel hook
   * @returns {boolean} True if hook was disabled successfully
   */
  disableHook() {
    try {
      if (this.drawSteelHook) {
        this.drawSteelHook.deregister();
        this.drawSteelHook = null;
        this._log('info', 'Draw Steel hook disabled');
        return true;
      }
      this._log('debug', 'Hook was not enabled');
      return true;
    } catch (error) {
      this._log('error', 'Failed to disable Draw Steel hook', error);
      return false;
    }
  }

  /**
   * Setup integration with Automated Animations UI
   */
  setupAAIntegration() {
    // No UI integration needed - using AA's native database
    this._log('debug', 'AA integration configured for database seeding');
  }

  
  
  /**
   * Check if required dependencies are available
   * @returns {Object} Dependency status object
   */
  checkDependencies() {
    const dependencies = {
      'autoanimations': game.modules.get('autoanimations'),
      'sequencer': game.modules.get('sequencer')
    };

    const missingDeps = Object.entries(dependencies)
      .filter(([name, module]) => !module?.active)
      .map(([name]) => name);

    // Log missing dependencies
    missingDeps.forEach(dep => {
      this._log('warn', `${dep} module not active`);
    });

    // Show notification if any dependencies are missing
    if (missingDeps.length > 0) {
      const message = missingDeps.length === 1
        ? `${missingDeps[0]} not available. Animations will not play.`
        : `Automated Animations and/or Sequencer not available. Animations will not play.`;

      if (ui?.notifications) {
        ui.notifications.warn(`ds-aa-bridge: ${message}`, { permanent: true });
      }
    }

    return {
      allAvailable: missingDeps.length === 0,
      missing: missingDeps,
      available: Object.keys(dependencies).filter(name => !missingDeps.includes(name))
    };
  }

  
  /**
   * Check if DS fallback animations are loaded in AA database
   * @returns {boolean} True if DS entries are found, false otherwise
   */
  async checkAAFallbacksLoaded() {
    // Only GMs can import menu entries
    if (!game.user.isGM) return true;

    // Wait for AA to be ready
    if (!game.modules.get('autoanimations')?.active) {
      this._log('debug', 'Automated Animations not active, skipping validation');
      return false;
    }

    try {
      // In v13, AA stores each menu category as a separate setting
      const melee = game.settings.get('autoanimations', 'aaAutorec-melee') || [];
      const range = game.settings.get('autoanimations', 'aaAutorec-range') || [];
      const ontoken = game.settings.get('autoanimations', 'aaAutorec-ontoken') || [];

      const dsEntries = {
        melee: melee.filter(e => e.label?.startsWith('[DS]')).length,
        range: range.filter(e => e.label?.startsWith('[DS]')).length,
        ontoken: ontoken.filter(e => e.label?.startsWith('[DS]')).length
      };

      const totalDS = dsEntries.melee + dsEntries.range + dsEntries.ontoken;

      // Check for partial entries
      const hasPartialEntries = totalDS > 0 && totalDS < 27;
      const hasMissingCategory = [dsEntries.melee, dsEntries.range, dsEntries.ontoken].some(count => count === 0);

      if (totalDS === 0 || hasPartialEntries || hasMissingCategory) {
        const message = totalDS === 0
          ? `[DS-AA-Bridge] No Draw Steel fallback animations found.`
          : `[DS-AA-Bridge] Incomplete Draw Steel animations found (${totalDS}/27 entries).`;

        if (typeof ui !== 'undefined' && ui.notifications) {
          ui.notifications.warn(
            `${message} Import ds-aa.json from the ds-aa-bridge module directory via Automated Animations > Menu Manager > Merge Menu`
          );
        }

        this._log('warn', `DS fallback animations missing or incomplete (${totalDS} entries found)`);
        return false;
      }

      this._log('info', `Found ${totalDS} DS fallback animations (${dsEntries.melee} melee, ${dsEntries.range} range, ${dsEntries.ontoken} ontoken)`);
      return true;

    } catch (error) {
      this._log('error', 'Failed to validate DS fallback entries:', error);
      return false;
    }
  }

  /**
   * Clean up when module is unloaded
   * @returns {boolean} True if cleanup was successful
   */
  unload() {
    try {
      this._log('info', 'Unloading Draw Steel + AA Bridge');
      const success = this.disableHook();

      // Clean up any additional resources if needed
      this.drawSteelHook = null;

      return success;
    } catch (error) {
      this._log('error', 'Error during module unload', error);
      return false;
    }
  }
}

// Create and register the module
let dsAABridge;

try {
  dsAABridge = new DSAABridge();

  // Hook into Foundry lifecycle
  Hooks.on('init', () => {
    try {
      dsAABridge.init();
    } catch (error) {
      console.error(`[${MODULE_ID}] Error during init:`, error);
    }
  });

  Hooks.on('setup', () => {
    try {
      dsAABridge.setup();
    } catch (error) {
      console.error(`[${MODULE_ID}] Error during setup:`, error);
    }
  });

  Hooks.on('ready', () => {
    try {
      dsAABridge.ready();
    } catch (error) {
      console.error(`[${MODULE_ID}] Error during ready:`, error);
    }
  });

  Hooks.on('unload', () => {
    try {
      dsAABridge.unload();
    } catch (error) {
      console.error(`[${MODULE_ID}] Error during unload:`, error);
    }
  });

  // Make module and classes available globally
  if (typeof window !== 'undefined') {
    window.dsAABridge = dsAABridge;
    window.DSAABridge = DSAABridge;
  }

} catch (error) {
  console.error(`[${MODULE_ID}] Failed to initialize module:`, error);
}


// ======================================
// File: apis\aa-api-bridge.js
// ======================================

// Import from: ../constants.js;

/**
 * Bridge to Automated Animations public APIs
 */
class AAAnimationBridge {
  constructor() {
    console.log(`[${MODULE_ID}] AAAnimationBridge v2.0.0 - HARDENED FALLBACK SYSTEM LOADED`);
    this.aaAvailable = this.checkAAAvailability();
    this.debugLogging = game.settings.get(MODULE_ID, SETTING_DEBUG_MODE) ?? false;
  }

  /**
   * Check if Automated Animations is available and has public APIs
   */
  checkAAAvailability() {
    try {
      // Check if AA module is active
      if (!game.modules.get('autoanimations')?.active) {
        console.warn(`[${MODULE_ID}] Automated Animations module not active`);
        return false;
      }

      // Check for Sequencer dependency
      if (!game.modules.get('sequencer')?.active) {
        console.warn(`[${MODULE_ID}] Sequencer module not active (required by AA)`);
        return false;
      }

      // Check if AA has public API available
      if (typeof AutomatedAnimations === 'undefined' ||
          !AutomatedAnimations.playAnimation) {
        console.warn(`[${MODULE_ID}] Automated Animations public API not available`);
        return false;
      }

      return true;
    } catch (error) {
      console.error(`[${MODULE_ID}] Error checking AA availability:`, error);
      return false;
    }
  }

  /**
   * Guard method to check if animation should play based on ownership and availability
   * @param {Object} animData - Animation data
   * @returns {boolean} Whether animation should be played
   */
  shouldPlayAnimation(animData) {
    // Check ownership
    const isOwner = animData.source?.actor?.ownership[game.user.id] === true;
    const isGM = game.user.isGM;

    if (!isOwner && !isGM) {
      if (this.debugLogging) this.debug('Skipping animation - user is not owner or GM');
      return false;
    }

    if (!this.aaAvailable) {
      if (this.debugLogging) this.debug('Skipping animation - AA not available');
      return false;
    }

    return true;
  }

  /**
   * Validate animation data structure
   * @param {Object} animData - Animation data to validate
   * @returns {boolean} Whether data is valid
   */
  validateAnimationData(animData) {
    if (!animData) {
      console.warn(`[${MODULE_ID}] No animation data provided`);
      return false;
    }

    if (!animData.source) {
      console.warn(`[${MODULE_ID}] No source token in animation data`);
      return false;
    }

    const targets = this.resolveTargets(animData);
    if (!targets || !targets.length) {
      console.warn(`[${MODULE_ID}] No valid targets found`);
      return false;
    }

    return true;
  }

  /**
   * Resolve targets with fallback chain
   * @param {Object} animData - Animation data
   * @returns {Array} Array of target tokens
   */
  resolveTargets(animData) {
    // Priority fallback for target resolution
    const targets = animData.targets
      || animData.hitTargets
      || Array.from(game.user.targets)
      || [animData.source]; // Self-target last resort

    if (!targets.length) {
      if (this.debugLogging) this.debug('No targets resolved');
      return null;
    }

    if (this.debugLogging) this.debug(`Resolved ${targets.length} targets:`, targets.map(t => t.name));
    return targets;
  }

  /**
   * Debug logging helper
   * @param {string} message - Message to log
   * @param {*} data - Optional data to log
   */
  debug(message, data = null) {
    if (this.debugLogging) {
      if (data) {
        console.log(`[${MODULE_ID}] ${message}`, data);
      } else {
        console.log(`[${MODULE_ID}] ${message}`);
      }
    }
  }

  
  /**
   * Try to play animation via AA
   * @param {Object} animData - Animation data
   * @param {string} animationName - Name of animation to try
   * @returns {boolean} Whether animation was successful
   */
  async tryAAAnimation(animData, animationName) {
    if (!this.aaAvailable) {
      if (this.debugLogging) this.debug('AA not available for fallback');
      return false;
    }

    try {
      if (this.debugLogging) this.debug(`Trying AA animation: ${animationName}`);

      const itemToPass = { name: animationName };
      const aaOptions = {
        targets: animData.targets,
        hitTargets: animData.hitTargets
      };

      await AutomatedAnimations.playAnimation(
        animData.source,
        itemToPass,
        aaOptions
      );

      if (this.debugLogging) this.debug(`✅ AA animation played: ${animationName}`);
      return true;
    } catch (error) {
      if (this.debugLogging) this.debug(`AA animation failed for ${animationName}:`, error);
      return false;
    }
  }

  /**
   * Simple animation resolution - exact name match or safe default
   * @param {Object} animData - Animation data from Draw Steel hook
   * @returns {boolean} Whether animation was successfully played
   */
  async playViaKeyword(animData) {
    // Priority 1: Custom animation from item flags
    const customAnimation = animData.item?.flags?.['ds-aa-bridge']?.animation;
    if (customAnimation) {
      if (this.debugLogging) this.debug(`Found custom animation: ${customAnimation}`);
      return await this.playCustomAnimation(animData, customAnimation);
    }

    // Priority 2: Check if ability exists in AA database, then play it
    if (this.isAnimationInDatabase(animData.abilityName)) {
      if (this.debugLogging) this.debug(`Found "${animData.abilityName}" in AA database, playing it`);
      return await this.tryAAAnimation(animData, animData.abilityName);
    } else {
      if (this.debugLogging) this.debug(`"${animData.abilityName}" not found in AA database, using DS fallback`);
    }

    // Priority 3: Use new DS animation selection logic
    const selectedAnimation = this.selectDSAnimation(animData);

    if (selectedAnimation) {
      if (this.debugLogging) this.debug(`Using DS animation: ${selectedAnimation}`);
      return await this.tryAAAnimation(animData, selectedAnimation);
    }

    // No animation found
    if (this.debugLogging) this.debug('No animation found');
    return false;
  }

  /**
   * Play a specific JB2A animation via Sequencer using proper public API.
   *
   * This method uses the public `new Sequence()` constructor instead of
   * internal Sequencer APIs to ensure compatibility and stability.
   * Implements single-target-per-victim approach for clear visual feedback.
   *
   * @param {Object} animData - Animation data from Draw Steel hook
   * @param {Token} animData.source - Source token for animation origin
   * @param {Token[]} animData.targets - Target tokens for animation destination
   * @param {string} jb2aPath - JB2A animation file path (validated)
   * @returns {boolean} Whether animation was successfully played
   *
   * @example
   * // Single target animation
   * const singleTarget = {
   *   source: sourceToken,
   *   targets: [targetToken]
   * };
   * await bridge.playCustomAnimation(singleTarget, 'jb2a.fire_bolt.red');
   * // Result: Fire bolt from source to target
   *
   * @example
   * // Multi-target animation (AoE)
   * const multiTarget = {
   *   source: sourceToken,
   *   targets: [target1, target2, target3]
   * };
   * await bridge.playCustomAnimation(multiTarget, 'jb2a.fire_bolt.red');
   * // Result: Individual fire bolts to each target
   *
   * @throws {Error} When Sequencer is not available or animation fails
   */
  async playCustomAnimation(animData, jb2aPath) {
    if (typeof Sequence === 'undefined') {
      if (this.debugLogging) this.debug('Sequencer not available, falling back to AA name lookup');
      return await this.tryAAAnimation(animData, animData.abilityName);
    }

    try {
      if (this.debugLogging) this.debug(`Playing animation via Sequencer: ${jb2aPath}`);

      // Use Sequencer's public Sequence constructor API
      let sequence = new Sequence();

      // Single-target-per-victim approach
      for (const target of animData.targets) {
        sequence
          .effect()
          .file(jb2aPath)
          .atLocation(animData.source)
          .stretchTo(target);
      }

      await sequence.play();

      console.log(`[${MODULE_ID}] ✅ Animation played via Sequencer: ${jb2aPath} (${animData.targets.length} target${animData.targets.length !== 1 ? 's' : ''})`);
      return true;

    } catch (error) {
      console.error(`[${MODULE_ID}] Sequencer error:`, error.message);
      if (this.debugLogging) this.debug(`Sequencer failed, falling back to AA lookup`);

      // Fallback to AA name lookup
      return await this.tryAAAnimation(animData, animData.abilityName);
    }
  }

  /**
   * Play animation with simple resolution
   * @param {Object} animData - Animation data from extractor
   */
  async playAnimation(animData) {
    if (this.debugLogging) {
      this.debug('playAnimation called with', {
        abilityName: animData.abilityName,
        source: animData.source?.name,
        targets: animData.targets?.map(t => t.name)
      });
    }

    // Guard checks - early return if should not play
    if (!this.shouldPlayAnimation(animData)) {
      return;
    }

    // Validate animation data
    if (!this.validateAnimationData(animData)) {
      return;
    }

    // Resolve targets with fallback chain
    const targets = this.resolveTargets(animData);
    if (!targets) {
      return;
    }

    // Update animData with resolved targets
    animData.targets = targets;

    try {
      // Try to play animation via simple keyword resolution
      await this.playViaKeyword(animData);
    } catch (error) {
      console.error(`[${MODULE_ID}] Error in playAnimation:`, error);
    }
  }

  
  /**
   * Select DS animation based on the new logic hierarchy
   * @param {Object} animData - Animation data
   * @returns {string|null} Selected animation name
   */
  selectDSAnimation(animData) {
    const keywords = animData.keywords || [];
    const lowerKeywords = keywords.map(k => k.toLowerCase());

    if (this.debugLogging) {
      this.debug('Selecting DS animation with keywords:', keywords);
    }

    // First check: Strike keyword determines buff/debuff vs attack
    const hasStrike = lowerKeywords.includes('strike');

    if (!hasStrike) {
      // Buff/Debuff - always use OnToken animations
      return this.selectOnTokenAnimation(lowerKeywords, animData.damageType);
    } else {
      // Attack - determine melee vs ranged
      const hasRanged = lowerKeywords.includes('ranged');
      const hasMelee = lowerKeywords.includes('melee');

      if (hasRanged || (hasRanged && hasMelee)) {
        // Ranged attack (or both - prefer ranged)
        return this.selectRangedAnimation(lowerKeywords, animData.damageType);
      } else if (hasMelee) {
        // Melee attack
        return this.selectMeleeAnimation(lowerKeywords, animData.damageType);
      } else {
        // Strike without melee/ranged - default to melee
        return this.selectMeleeAnimation(lowerKeywords, animData.damageType);
      }
    }
  }

  /**
   * Select OnToken animation for buffs/debuffs
   */
  selectOnTokenAnimation(keywords, damageType) {
    // Check for element keywords first
    const elementKeywords = ['fire', 'cold', 'lightning', 'acid', 'poison', 'thunder', 'psychic', 'radiant', 'necrotic', 'force', 'holy'];
    const foundElement = keywords.find(k => elementKeywords.includes(k));

    if (foundElement) {
      return `[DS] On Token + ${foundElement.charAt(0).toUpperCase() + foundElement.slice(1)}`;
    }

    // Check damage type as fallback (including 'none')
    if (damageType) {
      const lowerDamageType = damageType.toLowerCase();
      const allDamageTypes = [...elementKeywords, 'none'];
      if (allDamageTypes.includes(lowerDamageType)) {
        return `[DS] On Token + ${lowerDamageType.charAt(0).toUpperCase() + lowerDamageType.slice(1)}`;
      }
    }

    // If no damage type, use None
    return '[DS] On Token + None';
  }

  /**
   * Select Range animation for ranged attacks
   */
  selectRangedAnimation(keywords, damageType) {
    // Check for element keywords first
    const elementKeywords = ['fire', 'cold', 'lightning', 'acid', 'poison', 'thunder', 'psychic', 'radiant', 'necrotic', 'force', 'holy'];
    const foundElement = keywords.find(k => elementKeywords.includes(k));

    if (foundElement) {
      return `[DS] Range + ${foundElement.charAt(0).toUpperCase() + foundElement.slice(1)}`;
    }

    // Check damage type as fallback (including 'none')
    if (damageType) {
      const lowerDamageType = damageType.toLowerCase();
      const allDamageTypes = [...elementKeywords, 'none'];
      if (allDamageTypes.includes(lowerDamageType)) {
        return `[DS] Range + ${lowerDamageType.charAt(0).toUpperCase() + lowerDamageType.slice(1)}`;
      }
    }

    // Check for weapon keyword (future enhancement)
    if (keywords.includes('weapon')) {
      // TODO: Different weapon animations
    }

    // If no damage type, use None
    return '[DS] Range + None';
  }

  /**
   * Select Melee animation for melee attacks
   */
  selectMeleeAnimation(keywords, damageType) {
    // Check for element keywords first
    const elementKeywords = ['fire', 'cold', 'lightning', 'acid', 'poison', 'thunder', 'psychic', 'radiant', 'necrotic', 'force', 'holy'];
    const foundElement = keywords.find(k => elementKeywords.includes(k));

    if (foundElement) {
      return `[DS] Melee + ${foundElement.charAt(0).toUpperCase() + foundElement.slice(1)}`;
    }

    // Check damage type as fallback (including 'none')
    if (damageType) {
      const lowerDamageType = damageType.toLowerCase();
      const allDamageTypes = [...elementKeywords, 'none'];
      if (allDamageTypes.includes(lowerDamageType)) {
        return `[DS] Melee + ${lowerDamageType.charAt(0).toUpperCase() + lowerDamageType.slice(1)}`;
      }
    }

    // Check for weapon keyword (future enhancement)
    if (keywords.includes('weapon')) {
      // TODO: Different weapon animations
    }

    // If no damage type, use None
    return '[DS] Melee + None';
  }

  /**
   * Check if an animation name exists in AA database
   * @param {string} animationName - Name to check
   * @returns {boolean} True if animation with that name exists
   */
  isAnimationInDatabase(animationName) {
    try {
      // Check each AA category for animations
      const melee = game.settings.get('autoanimations', 'aaAutorec-melee') || [];
      const range = game.settings.get('autoanimations', 'aaAutorec-range') || [];
      const ontoken = game.settings.get('autoanimations', 'aaAutorec-ontoken') || [];

      const allAnimations = [...melee, ...range, ...ontoken]
        .map(e => e.label);

      return allAnimations.includes(animationName);
    } catch (error) {
      this.debug('Error checking AA animation database:', error);
      return false;
    }
  }

  /**
   * Get safe default animation for each delivery method
   * @param {string} deliveryMethod - Delivery method key
   * @param {boolean} hasStrike - Whether ability has Strike keyword (is an attack)
   * @returns {string|null} Default animation name
   */
  getDefaultFallback(deliveryMethod, hasStrike = false) {
    const defaults = {
      'weapon': hasStrike ? '[DS] Melee + Fire' : '[DS] On Token + Fire',   // Attack vs Buff
      'ranged': hasStrike ? '[DS] Range + Fire' : '[DS] On Token + Fire',    // Attack vs Buff
      'magic': '[DS] On Token + Fire',      // Non-attack abilities use ontoken
      'area': '[DS] On Token + Fire',       // Area effects use ontoken for now
      'spell': '[DS] On Token + Fire'       // Default to ontoken
    };

    return defaults[deliveryMethod] || '[DS] On Token + Fire';
  }
}


// ======================================
// File: constants.js
// ======================================

const MODULE_ID = 'ds-aa-bridge';
const SETTING_ENABLED = 'enabled';
const SETTING_DEBUG_MODE = 'debug-mode';

/**
 * Debug logging utility function
 * Only logs when debug mode is enabled
 * @param {string} message - Debug message to log
 * @param {...*} args - Additional arguments to log
 */
function debugLog(message, ...args) {
  // Try to get debug setting, fall back to false if not available
  let isDebug = false;
  try {
    isDebug = game.settings.get(MODULE_ID, SETTING_DEBUG_MODE);
  } catch (error) {
    // Settings not available, assume debug is false
  }

  if (isDebug) {
    console.debug(`[${MODULE_ID}] ${message}`, ...args);
  }
}


// ======================================
// File: hooks\draw-steel-hook.js
// ======================================

// Import from: ../constants.js;
// Import from: ../apis/aa-api-bridge.js;

/**
 * Hook handler for Draw Steel chat messages
 */
class DrawSteelHook {
  constructor() {
    this.aaBridge = new AAAnimationBridge();
    this.dsHookId = null;
  }

  /**
   * Register the ds-quick-strike hook
   */
  register() {
    if (this.dsHookId) {
      console.debug(`[${MODULE_ID}] ds-quick-strike hook already registered`);
      return;
    }

    // Register the ds-quick-strike hook for animation triggering
    this.dsHookId = Hooks.on('ds-quick-strike:damageApplied', (hookPayload) => {
      debugLog('DS-QUICK-STRIKE HOOK: Received damageApplied hook', hookPayload);
      this.handleDsQuickStrikeHook(hookPayload);
    });

    console.log(`[${MODULE_ID}] Registered ds-quick-strike hook`);
  }

  /**
   * Deregister the ds-quick-strike hook
   */
  deregister() {
    if (this.dsHookId) {
      Hooks.off('ds-quick-strike:damageApplied', this.dsHookId);
      this.dsHookId = null;
      console.log(`[${MODULE_ID}] Deregistered ds-quick-strike hook`);
    }
  }

  
  
  /**
   * Handle ds-quick-strike damageApplied hook (preferred method).
   *
   * This method receives complete ability data from ds-socket and processes
   * it for animation triggering. It handles damage filtering, data conversion,
   * and error recovery with comprehensive fallback support.
   *
   * @param {Object} hookPayload - The ds-quick-strike hook payload
   * @param {string} hookPayload.sourceActorId - ID of the source actor
   * @param {string} [hookPayload.sourceTokenId] - ID of the source token
   * @param {string} [hookPayload.targetTokenId] - ID of the target token
   * @param {number} hookPayload.amount - Damage amount
   * @param {string} [hookPayload.damageType] - Type of damage
   * @param {boolean} hookPayload.isHealing - Whether this is healing (skipped)
   * @param {string[]} [hookPayload.keywords] - Draw Steel keywords
   * @param {string} [hookPayload.sourceItemName] - Name of source item
   * @param {Object} [hookPayload.sourceItem] - Full source item object
   * @returns {Promise<void>}
   *
   * @example
   * // Fire damage to target
   * const payload = {
   *   sourceActorId: 'abc123',
   *   targetTokenId: 'def456',
   *   amount: 15,
   *   damageType: 'fire',
   *   isHealing: false,
   *   keywords: ['Fire', 'Magic'],
   *   sourceItemName: 'Firebolt'
   * };
   * await hook.handleDsQuickStrikeHook(payload);
   */
  async handleDsQuickStrikeHook(hookPayload) {
    debugLog('DS-HOOK: Processing ds-quick-strike damageApplied hook');

    // Skip healing - only trigger animations for damage
    if (hookPayload.isHealing) {
      debugLog('DS-HOOK: Skipping healing event');
      return;
    }

    try {
      // Convert hook payload to our expected AA format
      const animData = await this.convertHookPayloadToAaData(hookPayload);

      if (!animData) {
        console.warn(`[${MODULE_ID}] DS-HOOK: Failed to convert hook payload to AA data`);
        return;
      }

      console.log(`[${MODULE_ID}] Animation triggered for ${animData.abilityName}`);

      // Play the animation via AA bridge
      await this.aaBridge.playAnimation(animData);

    } catch (error) {
      console.error(`[${MODULE_ID}] DS-HOOK: Error processing ds-quick-strike hook:`, error);
    }
  }

  /**
   * Find the source token from hook payload
   * @param {Object} hookPayload - The ds-quick-strike hook payload
   * @param {Actor} sourceActor - The source actor
   * @returns {Token|null} The source token or null if not found
   */
  findSourceToken(hookPayload, sourceActor) {
    let sourceToken = null;

    if (hookPayload.sourceTokenId) {
      sourceToken = canvas.tokens.get(hookPayload.sourceTokenId);
    } else {
      // Find token by actor ID
      const actorTokens = canvas.tokens.placeables.filter(t => t.actor?.id === sourceActor.id);
      if (actorTokens.length > 0) {
        sourceToken = actorTokens[0];
      }
    }

    if (!sourceToken) {
      console.warn(`[${MODULE_ID}] DS-HOOK: Source token not found for ${sourceActor.name}`);
      return null;
    }

    return sourceToken;
  }

  /**
   * Find the target token from hook payload
   * @param {Object} hookPayload - The ds-quick-strike hook payload
   * @returns {Token|null} The target token or null if not found
   */
  findTargetToken(hookPayload) {
    let targetToken = null;
    if (hookPayload.targetTokenId) {
      targetToken = canvas.tokens.get(hookPayload.targetTokenId);
    }

    if (!targetToken) {
      console.warn(`[${MODULE_ID}] DS-HOOK: Target token not found`);
      return null;
    }

    return targetToken;
  }

  /**
   * Select primary keyword based on priority system
   * @param {string[]} keywords - Array of keywords to prioritize
   * @returns {string|null} The selected primary keyword
   */
  selectPrimaryKeyword(keywords) {
    const ELEMENT_KEYWORDS = ['earth', 'fire', 'green', 'void', 'rot'];
    const PSYCHIC_KEYWORDS = ['psionic', 'telekinesis', 'telepathy', 'animapathy', 'chronopathy', 'resopathy'];
    const SPECIAL_KEYWORDS = ['metamorphosis', 'performance', 'cryokinesis', 'pyrokinesis'];
    const AREA_KEYWORDS = ['area'];
    const COMBAT_KEYWORDS = ['melee', 'ranged', 'charge'];

    const PRIORITY_ORDER = [ELEMENT_KEYWORDS, PSYCHIC_KEYWORDS, SPECIAL_KEYWORDS, AREA_KEYWORDS, COMBAT_KEYWORDS];

    for (const priorityList of PRIORITY_ORDER) {
      const match = keywords.find(k => priorityList.includes(k.toLowerCase()));
      if (match) return match;
    }

    return keywords[0] || null;
  }

  /**
   * Resolve the item from hook payload using multiple fallback strategies
   * @param {Object} hookPayload - The ds-quick-strike hook payload
   * @param {Actor} sourceActor - The source actor
   * @returns {Object} The resolved item (real or fallback)
   */
  resolveItem(hookPayload, sourceActor) {
    let item = null;

    // First, try to get the item from the hook payload if it's a real item
    if (hookPayload.sourceItem && hookPayload.sourceItem.id) {
      item = hookPayload.sourceItem;
      debugLog(`DS-HOOK: Using real sourceItem from hook:`, item.name, `(ID: ${item.id})`);
    }
    // Try to find the item by sourceItemId in the actor's inventory
    else if (hookPayload.sourceItemId && sourceActor.items) {
      item = sourceActor.items.get(hookPayload.sourceItemId);
      if (item) {
        debugLog(`DS-HOOK: Found source item by ID: ${item.name} (ID: ${item.id})`);
      }
    }
    // Try to find item by name matching in the actor's inventory
    else if (hookPayload.sourceItemName && sourceActor.items) {
      const itemsByName = sourceActor.items.filter(i => i.name === hookPayload.sourceItemName);
      if (itemsByName.length > 0) {
        item = itemsByName[0];
        debugLog(`DS-HOOK: Found source item by name: ${item.name} (ID: ${item.id})`);
      }
    }

    // Only use fallback if we truly can't find the real item
    if (!item) {
      const abilityName = hookPayload.sourceItemName || sourceActor.name || 'Attack';
      const isRanged = hookPayload.keywords?.includes('Ranged') || false;

      // Generate unique ID for synthetic item
      const syntheticId = `synthetic-${abilityName.toLowerCase().replace(/\s+/g, '-')}-${Date.now()}`;

      debugLog(`DS-HOOK: Using fallback item for: ${abilityName}`);

      item = {
        id: syntheticId,
        name: abilityName,
        type: 'weapon',
        system: {
          damage: {
            parts: [[hookPayload.amount || 1, hookPayload.damageType || 'bludgeoning']]
          },
          weaponType: isRanged ? 'simpleRanged' : 'simpleMelee',
          actionType: isRanged ? 'rwak' : 'mwak',
          properties: {
            ranged: isRanged,
            melee: !isRanged
          }
        },
        flags: {
          'ds-aa-bridge': {
            isRanged: isRanged,
            isMelee: !isRanged,
            originalAbility: abilityName,
            keywords: hookPayload.keywords || []
          }
        }
      };

      debugLog(`DS-HOOK: Created fallback item:`, item.name);
    } else {
      debugLog(`DS-HOOK: Successfully found REAL item with ID: ${item.id}`);
    }

    return item;
  }

  /**
   * Build the final animation data object for AA bridge.
   *
   * Constructs the complete animation data object with all necessary
   * information for the hardened fallback system. Extracts keywords,
   * determines damage type and combat properties, and ensures all
   * fields are properly populated for the keyword mapper.
   *
   * @param {Token} sourceToken - The source token initiating the ability
   * @param {Token} targetToken - The target token receiving the ability
   * @param {Object} item - The resolved item (real or synthetic fallback)
   * @param {Object} hookPayload - The original ds-quick-strike hook payload
   * @returns {Object} The complete animation data object for AA processing
   *
   * @returns {Object} returns.animationData - The animation data object
   * @returns {Token} returns.animationData.source - Source token
   * @returns {Object} returns.animationData.item - Item object with flags
   * @returns {Token[]} returns.animationData.targets - Array of target tokens
   * @returns {string} returns.animationData.abilityName - Name of the ability
   * @returns {string|null} returns.animationData.keyword - Primary keyword
   * @returns {string[]} returns.animationData.keywords - All keywords
   * @returns {string|null} returns.animationData.damageType - Damage type
   * @returns {boolean} returns.animationData.isRanged - Whether ranged attack
   * @returns {boolean} returns.animationData.isMagic - Whether magical effect
   * @returns {boolean} returns.animationData.shouldPlay - Whether to animate
   * @returns {boolean} returns.animationData.isSuccess - Success status
   *
   * @example
   * const animData = hook.buildAnimationData(sourceToken, targetToken, item, payload);
   * console.log(animData.keyword); // 'Fire'
   * console.log(animData.isMagic); // true
   * console.log(animData.damageType); // 'fire'
   */
  buildAnimationData(sourceToken, targetToken, item, hookPayload) {
    const shouldPlay = hookPayload.amount > 0;

    // Extract keywords from item system if available (real Draw Steel items)
    let keywords = [];
    if (item.system?.keywords) {
      keywords = Array.from(item.system.keywords);
    } else if (hookPayload.keywords) {
      keywords = hookPayload.keywords;
    }

    // Select primary keyword using simplified priority system
    const primaryKeyword = this.selectPrimaryKeyword(keywords);

    
    
    return {
      source: sourceToken,
      item: item,  // ← PASS the real item object we found
      targets: [targetToken],
      abilityName: item.name || 'Attack',
      keywords: keywords, // Pass all keywords for mapper
      damageType: hookPayload.damageType || null,
      hitTargets: shouldPlay ? [targetToken] : []
    };
  }

  /**
   * Convert ds-quick-strike hook payload to AA animation data
   */
  async convertHookPayloadToAaData(hookPayload) {
    try {
      debugLog('DS-HOOK: Processing payload with sourceActorId:', hookPayload.sourceActorId);

      // Get the source actor using the sourceActorId from hook payload
      const sourceActor = game.actors.get(hookPayload.sourceActorId);

      if (!sourceActor) {
        console.warn(`[${MODULE_ID}] DS-HOOK: Source actor not found with ID: ${hookPayload.sourceActorId}`);
        return null;
      }

      debugLog(`DS-HOOK: Found source actor:`, sourceActor.name);

      // Get the source token
      const sourceToken = this.findSourceToken(hookPayload, sourceActor);
      if (!sourceToken) {
        return null;
      }

      // Get target token
      const targetToken = this.findTargetToken(hookPayload);
      if (!targetToken) {
        return null;
      }

      // Resolve the item using multiple fallback strategies
      const item = this.resolveItem(hookPayload, sourceActor);

      // Build and return the animation data
      return this.buildAnimationData(sourceToken, targetToken, item, hookPayload);

    } catch (error) {
      console.error(`[${MODULE_ID}] DS-HOOK: Error converting hook payload:`, error);
      return null;
    }
  }
}

