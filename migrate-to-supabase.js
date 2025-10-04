#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

console.log('🔄 Migrating Ledgerly from Firebase to Supabase...');

// Files to update
const filesToUpdate = [
  'src/hooks/use-auth.tsx',
  'src/hooks/use-notifications.tsx',
  'src/lib/firebase.ts'
];

// Update imports
const updateImports = (content) => {
  return content
    .replace(/import.*firebase.*from.*firebase.*;/g, '')
    .replace(/import.*from.*@\/lib\/firebase.*;/g, '')
    .replace(/import.*useAuth.*from.*@\/hooks\/use-auth.*;/g, 'import { useAuth } from \'@/hooks/use-auth-supabase\';')
    .replace(/import.*useNotifications.*from.*@\/hooks\/use-notifications.*;/g, 'import { useNotifications } from \'@/hooks/use-notifications-supabase\';')
    .replace(/import.*db.*from.*@\/lib\/firebase.*;/g, 'import { supabase } from \'@/lib/supabase\';');
};

// Update Firestore queries to Supabase
const updateQueries = (content) => {
  return content
    // Collection queries
    .replace(/collection\(db, ['"]([^'"]+)['"]\)/g, 'supabase.from(\'$1\')')
    // Where clauses
    .replace(/where\(['"]([^'"]+)['"], ['"]==['"], ([^)]+)\)/g, '.eq(\'$1\', $2)')
    // Order by
    .replace(/orderBy\(['"]([^'"]+)['"], ['"]([^'"]+)['"]\)/g, '.order(\'$1\', { ascending: $2 === \'asc\' })')
    // Limit
    .replace(/limit\((\d+)\)/g, '.limit($1)')
    // OnSnapshot to real-time
    .replace(/onSnapshot\(([^,]+), ([^)]+)\)/g, 'on(\'postgres_changes\', { event: \'*\', schema: \'public\', table: \'$1\' }, $2)')
    // AddDoc
    .replace(/addDoc\(([^,]+), ([^)]+)\)/g, 'insert($2)')
    // UpdateDoc
    .replace(/updateDoc\(([^,]+), ([^)]+)\)/g, 'update($2)')
    // DeleteDoc
    .replace(/deleteDoc\(([^)]+)\)/g, 'delete()')
    // GetDoc
    .replace(/getDoc\(([^)]+)\)/g, 'select().single()');
};

// Process each file
filesToUpdate.forEach(filePath => {
  const fullPath = path.join(__dirname, filePath);
  
  if (fs.existsSync(fullPath)) {
    console.log(`📝 Updating ${filePath}...`);
    
    let content = fs.readFileSync(fullPath, 'utf8');
    content = updateImports(content);
    content = updateQueries(content);
    
    // Create backup
    fs.writeFileSync(fullPath + '.backup', fs.readFileSync(fullPath));
    
    // Write updated content
    fs.writeFileSync(fullPath, content);
    
    console.log(`✅ Updated ${filePath}`);
  } else {
    console.log(`⚠️  File not found: ${filePath}`);
  }
});

console.log('🎉 Migration complete!');
console.log('');
console.log('Next steps:');
console.log('1. Review the updated files');
console.log('2. Test your application');
console.log('3. Deploy to Vercel');
console.log('');
console.log('Backup files created with .backup extension');
