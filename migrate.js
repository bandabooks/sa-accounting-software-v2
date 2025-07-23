const { execSync } = require('child_process');

try {
  // Run the migration with automatic "create table" selection
  const command = 'echo -e "\\n\\n\\n\\n\\n\\n\\n\\n\\n\\n\\n\\n\\n\\n\\n\\n\\n\\n\\n\\n\\n\\n\\n\\n\\n\\n\\n\\n\\n\\n" | npx drizzle-kit push';
  execSync(command, { stdio: 'inherit' });
} catch (error) {
  console.error('Migration failed:', error);
  process.exit(1);
}