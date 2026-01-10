/**
 * PostCSS Configuration
 * 
 * PURPOSE: Configure PostCSS plugins for CSS processing
 * 
 * BEST PRACTICE: TailwindCSS looks for config at root level by default.
 * No need to specify path explicitly - it will find tailwind.config.js automatically.
 * 
 * Plugins:
 * - tailwindcss: Processes TailwindCSS directives
 * - autoprefixer: Adds vendor prefixes for browser compatibility
 */
module.exports = {
  plugins: {
    tailwindcss: {},  // Uses tailwind.config.js at root level (default)
    autoprefixer: {},
  },
}
