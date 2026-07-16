/** @type {import('dependency-cruiser').IConfiguration} */
export default {
  forbidden: [
    {
      name: 'no-circular',
      severity: 'error',
      comment: 'Circular dependencies make modules harder to extract.',
      from: {},
      to: { circular: true },
    },
    {
      name: 'users-not-to-auth-or-reports',
      severity: 'error',
      comment: 'Users must not depend on auth or reports implementations.',
      from: { path: '^src/modules/users' },
      to: { path: '^src/modules/(auth|reports)' },
    },
    {
      name: 'reports-not-to-users-or-auth',
      severity: 'error',
      comment: 'Reports must not depend on users or auth implementations.',
      from: { path: '^src/modules/reports' },
      to: { path: '^src/modules/(users|auth)' },
    },
    {
      name: 'shared-not-to-modules-except-composition-root',
      severity: 'error',
      comment:
        'Shared code must not import modules except the HTTP composition root and workers.',
      from: {
        path: '^src/shared',
        pathNot: '^src/shared/infra/http/(app\\.ts|.*\\.routes\\.ts)',
      },
      to: { path: '^src/modules' },
    },
    {
      name: 'services-not-to-http-dtos',
      severity: 'error',
      comment: 'Application services must not import HTTP-layer DTOs.',
      from: { path: '^src/modules/.+/services' },
      to: { path: '^src/modules/.+/http' },
    },
  ],
  options: {
    doNotFollow: {
      path: ['node_modules', 'src/shared/infra/database/client'],
    },
    exclude: {
      path: ['node_modules', 'src/shared/infra/database/client', '\\.spec\\.ts$', '\\.test\\.ts$'],
    },
    tsPreCompilationDeps: true,
    tsConfig: {
      fileName: 'tsconfig.json',
    },
    enhancedResolveOptions: {
      exportsFields: ['exports'],
      conditionNames: ['import', 'require', 'node', 'default', 'types'],
      mainFields: ['types', 'module', 'main'],
      extensions: ['.ts', '.js', '.mjs'],
    },
  },
};
