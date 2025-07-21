const js = require('@eslint/js');
const tsParser = require('@typescript-eslint/parser');
const tsPlugin = require('@typescript-eslint/eslint-plugin');
const reactHooks = require('eslint-plugin-react-hooks');
const reactRefresh = require('eslint-plugin-react-refresh');

module.exports = [
  {
    files: ['**/*.{js,jsx,ts,tsx}'],
    languageOptions: {
      parser: tsParser,
      parserOptions: {
        ecmaVersion: 2020,
        sourceType: 'module',
        ecmaFeatures: {
          jsx: true,
        },
      },
      globals: {
        // Browser globals
        window: 'readonly',
        document: 'readonly',
        navigator: 'readonly',
        localStorage: 'readonly',
        sessionStorage: 'readonly',
        alert: 'readonly',
        confirm: 'readonly',
        console: 'readonly',
        setTimeout: 'readonly',
        clearTimeout: 'readonly',
        setInterval: 'readonly',
        clearInterval: 'readonly',
        requestAnimationFrame: 'readonly',
        atob: 'readonly',
        btoa: 'readonly',
        fetch: 'readonly',
        Response: 'readonly',
        Request: 'readonly',
        RequestInit: 'readonly',
        Headers: 'readonly',
        FormData: 'readonly',
        File: 'readonly',
        FileReader: 'readonly',
        TextDecoder: 'readonly',
        TextEncoder: 'readonly',
        ReadableStream: 'readonly',
        StorageEvent: 'readonly',

        // HTML Element types
        HTMLElement: 'readonly',
        HTMLDivElement: 'readonly',
        HTMLInputElement: 'readonly',
        HTMLButtonElement: 'readonly',
        HTMLTextAreaElement: 'readonly',
        HTMLImageElement: 'readonly',
        HTMLLabelElement: 'readonly',

        // Event types
        MouseEvent: 'readonly',
        Event: 'readonly',

        // DOM types
        Node: 'readonly',

        // React types
        React: 'readonly',

        // Node.js globals
        process: 'readonly',
        Buffer: 'readonly',
        __dirname: 'readonly',
        __filename: 'readonly',
        exports: 'writable',
        global: 'readonly',
        module: 'writable',
        require: 'readonly',

        // jQuery (for Cypress)
        JQuery: 'readonly',
      },
    },
    plugins: {
      '@typescript-eslint': tsPlugin,
      'react-hooks': reactHooks,
      'react-refresh': reactRefresh,
    },
    rules: {
      ...js.configs.recommended.rules,
      ...tsPlugin.configs.recommended.rules,
      'react-hooks/rules-of-hooks': 'error',
      'react-hooks/exhaustive-deps': 'off', // Turn off missing dependencies warnings
      'react-refresh/only-export-components': 'off', // Turn off fast refresh warnings
      '@typescript-eslint/no-unused-vars': 'off', // Turn off unused variables warnings
      '@typescript-eslint/no-explicit-any': 'off', // Already off
      //'@typescript-eslint/ban-types': 'warn',
      '@typescript-eslint/no-var-requires': 'off', // Turn off require() warnings
      '@typescript-eslint/no-namespace': 'warn',
      '@typescript-eslint/no-duplicate-enum-values': 'error', // Keep this as error
      'no-undef': 'error', // Keep this as error
      'no-useless-escape': 'warn', // Downgrade from error to warning
      'no-empty': 'off', // Turn off empty block warnings
      'no-constant-condition': 'off', // Turn off constant condition warnings
    },
  },
  // Test files configuration
  {
    files: ['**/*.test.{js,jsx,ts,tsx}', '**/*.spec.{js,jsx,ts,tsx}', '**/tests/**/*', '**/cypress/**/*', '**/setupTests.ts'],
    languageOptions: {
      globals: {
        // Jest globals
        describe: 'readonly',
        it: 'readonly',
        test: 'readonly',
        expect: 'readonly',
        beforeEach: 'readonly',
        afterEach: 'readonly',
        beforeAll: 'readonly',
        afterAll: 'readonly',
        jest: 'readonly', // Explicitly define jest as a global

        // Cypress globals
        cy: 'readonly',
        Cypress: 'readonly',

        // All other globals from the main config
        window: 'readonly',
        document: 'readonly',
        navigator: 'readonly',
        localStorage: 'readonly',
        sessionStorage: 'readonly',
        alert: 'readonly',
        confirm: 'readonly',
        console: 'readonly',
        setTimeout: 'readonly',
        clearTimeout: 'readonly',
        setInterval: 'readonly',
        clearInterval: 'readonly',
        requestAnimationFrame: 'readonly',
        atob: 'readonly',
        btoa: 'readonly',
        fetch: 'readonly',
        Response: 'readonly',
        Request: 'readonly',
        RequestInit: 'readonly',
        Headers: 'readonly',
        FormData: 'readonly',
        File: 'readonly',
        FileReader: 'readonly',
        TextDecoder: 'readonly',
        TextEncoder: 'readonly',
        ReadableStream: 'readonly',
        StorageEvent: 'readonly',
        HTMLElement: 'readonly',
        HTMLDivElement: 'readonly',
        HTMLInputElement: 'readonly',
        HTMLButtonElement: 'readonly',
        HTMLTextAreaElement: 'readonly',
        HTMLImageElement: 'readonly',
        HTMLLabelElement: 'readonly',
        MouseEvent: 'readonly',
        Event: 'readonly',
        Node: 'readonly',
        React: 'readonly',
        JQuery: 'readonly',
      },
    },
  },
  // Cypress test files configuration
  {
    files: [
      '**/*.cy.{js,jsx,ts,tsx}',
      'cypress/**/*.ts',
      'cypress/**/*.js',
      'src/components/ui/*.cy.{js,jsx,ts,tsx}',
    ],
    languageOptions: {
      globals: {
        cy: 'readonly',
        Cypress: 'readonly',
        describe: 'readonly',
        it: 'readonly',
        before: 'readonly',
        after: 'readonly',
        beforeEach: 'readonly',
        afterEach: 'readonly',
        expect: 'readonly',
        window: 'readonly',
        document: 'readonly',
        navigator: 'readonly',
        localStorage: 'readonly',
        sessionStorage: 'readonly',
        alert: 'readonly',
        confirm: 'readonly',
        console: 'readonly',
        setTimeout: 'readonly',
        clearTimeout: 'readonly',
        setInterval: 'readonly',
        clearInterval: 'readonly',
        requestAnimationFrame: 'readonly',
        atob: 'readonly',
        btoa: 'readonly',
        fetch: 'readonly',
        Response: 'readonly',
        Request: 'readonly',
        RequestInit: 'readonly',
        Headers: 'readonly',
        FormData: 'readonly',
        File: 'readonly',
        FileReader: 'readonly',
        TextDecoder: 'readonly',
        TextEncoder: 'readonly',
        ReadableStream: 'readonly',
        StorageEvent: 'readonly',
        HTMLElement: 'readonly',
        HTMLDivElement: 'readonly',
        HTMLInputElement: 'readonly',
        HTMLButtonElement: 'readonly',
        HTMLTextAreaElement: 'readonly',
        HTMLImageElement: 'readonly',
        HTMLLabelElement: 'readonly',
        MouseEvent: 'readonly',
        Event: 'readonly',
        Node: 'readonly',
        React: 'readonly',
        JQuery: 'readonly',
      },
    },
  },
  {
    ignores: [
      'dist/**',
      'node_modules/**',
      'coverage/**',
      'build/**',
      'cypress/**', // <-- Exclude all Cypress files/folders
      'src/components/ui/*.cy.{js,jsx,ts,tsx}', // <-- Exclude UI Cypress component tests
      '**/*.cy.{js,jsx,ts,tsx}', // <-- Exclude any other Cypress test files
    ],
  },
];