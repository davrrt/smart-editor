/**
 * SmartEditor
 * A WYSIWYG editor with visual templates, powered by CKEditor 5 and custom plugins.
 */

/**
 * SmartEditor main React component
 */
export { SmartEditor } from './SmartEditor';

/**
 * Main hook for SmartEditor
 */
export { useSmartEditor } from './useSmartEditor';

/**
 * Optional sub-hooks for advanced use
 */
export { useLiveEditor } from './useLiveEditor';
export { useTemplateStore } from './useTemplateStore';

/**
 * Public types
 */
export * from './types/variable';
export * from './types/condition';
export * from './types/loop';
export * from './types/signature';
export * from './types/contract';
export * from './types/dynamicTable';

/**
 * Backend utilities - 2 helpers essentiels
 */
export * from './backend/templateContractBuilder';
export * from './backend/signatureScanner';

/**
 * Version information
 */
export const version = '1.0.0';

/**
 * Package information
 */
export const packageInfo = {
  name: 'smart-editor',
  description: 'A powerful visual template editor with CKEditor 5, developed by EquiSafe.',
  author: 'EquiSafe Team'
};
