#!/usr/bin/env node
/**
 * docs-sync.js
 * Sincroniza la documentación manualmente (sin commit).
 * Equivale a ejecutar el beforeCommit hook de forma aislada.
 *
 * Uso: npm run docs:generate
 *      node .claude/commands/docs-sync.js
 */

const path = require('path');

// Reutiliza la misma lógica del beforeCommit hook
require(path.resolve(__dirname, '../hooks/beforeCommit.js'));
