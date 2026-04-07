#!/usr/bin/env node
/**
 * .github/scripts/update-claude-context.js
 * Versión CI del actualizador de CLAUDE.md.
 * Se ejecuta en GitHub Actions después de docs.yml.
 */

const path = require('path');
require(path.resolve(__dirname, '../../.claude/hooks/beforeCommit.js'));
