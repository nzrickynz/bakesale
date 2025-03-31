const { execSync } = require('child_process');

console.log('🔄 Resetting database...');
try {
  execSync('npx prisma db push --force-reset', { stdio: 'inherit' });
} catch (error) {
  console.error('❌ Error resetting database:', error);
  process.exit(1);
}

console.log('🌱 Seeding database...');
try {
  execSync('npx prisma db seed', { stdio: 'inherit' });
} catch (error) {
  console.error('❌ Error seeding database:', error);
  process.exit(1);
}

console.log('✅ Reset and seed complete!'); 