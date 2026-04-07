#!/usr/bin/env node
/**
 * scripts/pre-commit.js
 * Alias local del hook de pre-commit.
 */
require(path.resolve(__dirname, '../.claude/hooks/beforeCommit.js'));
