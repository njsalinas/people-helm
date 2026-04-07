#!/usr/bin/env node
/**
 * scaffold.js
 * Generador de scaffolding para componentes, hooks y migraciones.
 *
 * Uso:
 *   node .claude/commands/scaffold.js component MyComponent
 *   node .claude/commands/scaffold.js hook useMyHook
 *   node .claude/commands/scaffold.js migration crear_tabla_example
 */

const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '../..');
const [,, type, name] = process.argv;

if (!type || !name) {
  console.error('Usage: scaffold.js <component|hook|migration> <Name>');
  process.exit(1);
}

// ─── Templates ────────────────────────────────────────────────────────────

const COMPONENT_TEMPLATE = (name) => `/**
 * @component ${name}
 * TODO: Describe this component
 *
 * @example
 * <${name} />
 */

'use client'

import { useState } from 'react'

interface ${name}Props {
  // TODO: Define props
}

export function ${name}({}: ${name}Props) {
  return (
    <div>
      {/* TODO: Implement ${name} */}
    </div>
  )
}
`;

const HOOK_TEMPLATE = (name) => `/**
 * @hook ${name}
 * TODO: Describe this hook
 *
 * @example
 * const result = ${name}()
 */

'use client'

import { useQuery } from '@tanstack/react-query'

export function ${name}() {
  // TODO: Implement hook
  return useQuery({
    queryKey: ['${name.replace('use', '').toLowerCase()}'],
    queryFn: async () => {
      throw new Error('Not implemented')
    },
  })
}
`;

const MIGRATION_TEMPLATE = (name) => `-- Migration: ${name}
-- Created: ${new Date().toISOString().split('T')[0]}

-- TODO: Implement migration

`;

// ─── Generators ───────────────────────────────────────────────────────────

function scaffoldComponent(name) {
  const dir = path.join(ROOT, 'src/components');
  const file = path.join(dir, `${name}.tsx`);
  if (fs.existsSync(file)) {
    console.error(`Component already exists: ${file}`);
    process.exit(1);
  }
  fs.writeFileSync(file, COMPONENT_TEMPLATE(name));
  console.log(`✅ Created component: src/components/${name}.tsx`);
}

function scaffoldHook(name) {
  const hookName = name.startsWith('use') ? name : `use${name}`;
  const dir = path.join(ROOT, 'src/hooks');
  const file = path.join(dir, `${hookName}.ts`);
  if (fs.existsSync(file)) {
    console.error(`Hook already exists: ${file}`);
    process.exit(1);
  }
  fs.writeFileSync(file, HOOK_TEMPLATE(hookName));
  console.log(`✅ Created hook: src/hooks/${hookName}.ts`);
}

function scaffoldMigration(name) {
  const migrationsDir = path.join(ROOT, 'supabase/migrations');
  const existing = fs.readdirSync(migrationsDir)
    .filter((f) => f.endsWith('.sql'))
    .sort();
  const nextNum = String((existing.length + 1)).padStart(3, '0');
  const filename = `${nextNum}_${name}.sql`;
  const file = path.join(migrationsDir, filename);
  fs.writeFileSync(file, MIGRATION_TEMPLATE(name));
  console.log(`✅ Created migration: supabase/migrations/${filename}`);
}

// ─── Run ──────────────────────────────────────────────────────────────────

switch (type) {
  case 'component':
    scaffoldComponent(name);
    break;
  case 'hook':
    scaffoldHook(name);
    break;
  case 'migration':
    scaffoldMigration(name);
    break;
  default:
    console.error(`Unknown type: ${type}. Use: component, hook, migration`);
    process.exit(1);
}
