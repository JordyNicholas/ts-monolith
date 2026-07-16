import js from '@eslint/js';

/** Minimal ESLint until typescript-eslint officially supports TypeScript 7. Architecture boundaries are enforced by dependency-cruiser (`npm run lint:architecture`). */
export default [
  {
    ignores: [
      'dist/**',
      'node_modules/**',
      'src/**',
      'prisma/**',
      'coverage/**',
      'eslint.config.js',
    ],
  },
  js.configs.recommended,
];
