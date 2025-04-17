// tailwind.config.js
module.exports = {
	theme: {
	  extend: {},
	},
	// Ajoute ceci pour désactiver `oklch`
	experimental: {
	  optimizeUniversalDefaults: true,
	},
	corePlugins: {
	  preflight: false, // optionnel, mais peut aider à désactiver les styles de base qui posent problème
	},
  }
  