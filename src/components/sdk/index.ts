/**
 * SDK Components - Centralized Exports
 * 
 * PURPOSE: This file provides a single entry point for all SDK-related components.
 * 
 * BEST PRACTICE - Barrel Exports:
 * Instead of importing from multiple files:
 *   import { WhatIsSDK } from './components/sdk/WhatIsSDK';
 *   import { APIReference } from './components/sdk/APIReference';
 *   import { SDKIntegrationTab } from './components/sdk/SDKIntegrationTab';
 * 
 * You can import from one place:
 *   import { WhatIsSDK, APIReference, SDKIntegrationTab } from './components/sdk';
 * 
 * BENEFITS:
 * - Cleaner imports (one line instead of many)
 * - Easier refactoring (change file structure without updating all imports)
 * - Clear module boundaries (shows what's public API vs internal)
 * - Better IDE support (autocomplete shows all available exports)
 * 
 * WHEN TO USE:
 * - When you have multiple related components/files
 * - When components are used together frequently
 * - When you want to hide internal file structure
 * 
 * WHEN NOT TO USE:
 * - Single component files (no need for barrel export)
 * - Very large modules (can slow down IDE)
 */

// Export components (the UI pieces)
export { WhatIsSDK } from './WhatIsSDK';
export { SDKIntegrationTab } from './SDKIntegrationTab';
export { APIReference } from './APIReference';

// Export data (the API endpoints configuration)
export { apiEndpoints } from './apiEndpoints';

// Export types (TypeScript interfaces - only used for type checking, not runtime)
export type { ApiEndpoint } from './apiEndpoints';

