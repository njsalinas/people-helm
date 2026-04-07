#!/usr/bin/env node
/**
 * scripts/docs-generator.js
 * Generador universal de documentación.
 * Puede ejecutarse standalone o desde el pre-commit hook.
 *
 * Uso: npm run docs:generate
 */

const path = require('path');

// Reutiliza la lógica del hook beforeCommit
require(path.resolve(__dirname, '../.claude/hooks/beforeCommit.js'));
