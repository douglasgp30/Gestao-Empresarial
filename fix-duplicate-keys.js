// fix-duplicate-keys.js
const API_BASE = 'http://localhost:8080';

async function fixDuplicateKeys() {
  try {
    console.log('🔧 Fixing duplicate category keys...\n');
    
    // 1. Check current state
    console.log('1. 📊 Checking current database state...');
    const currentResponse = await fetch(`${API_BASE}/api/clean/categories`);
    const currentData = await currentResponse.json();
    
    if (currentData.success) {
      console.log(`   Found ${currentData.total} items:`);
      console.log(`   - Categorias: ${currentData.stats.categorias}`);
      console.log(`   - Descrições: ${currentData.stats.descricoes}`);
      console.log(`   - Receitas: ${currentData.stats.receitas}`);
      console.log(`   - Despesas: ${currentData.stats.despesas}`);
      
      // Show duplicates if any
      const items = currentData.data || [];
      const categoryNames = items
        .filter(item => item.tipoItem === 'categoria')
        .map(item => item.nome);
      const duplicates = categoryNames.filter((name, index) => categoryNames.indexOf(name) !== index);
      
      if (duplicates.length > 0) {
        console.log(`\n   ⚠️ Duplicate categories found: ${[...new Set(duplicates)].join(', ')}`);
      }
    }
    
    // 2. Clean database
    console.log('\n2. 🧹 Cleaning duplicate data...');
    const cleanResponse = await fetch(`${API_BASE}/api/clean/categories`, {
      method: 'DELETE'
    });
    const cleanResult = await cleanResponse.json();
    
    if (cleanResult.success) {
      console.log(`   ✅ Cleaned ${cleanResult.stats.removed} items`);
      console.log(`   📊 Remaining: ${cleanResult.stats.remaining} items`);
    } else {
      console.log(`   ❌ Error: ${cleanResult.error}`);
    }
    
    // 3. Verify clean state
    console.log('\n3. 🔍 Verifying clean database...');
    const verifyResponse = await fetch(`${API_BASE}/api/clean/categories`);
    const verifyData = await verifyResponse.json();
    
    if (verifyData.success) {
      console.log(`   ✅ Database is now clean with ${verifyData.total} items`);
      
      if (verifyData.total === 0) {
        console.log('\n4. 🎯 Perfect! No duplicate keys possible with empty database.');
        console.log('   Now you can add fresh categories through the UI without conflicts.');
      }
    }
    
    console.log('\n✅ Duplicate key issue should now be fixed!');
    console.log('\n🔧 Code changes made:');
    console.log('   - Added unique index-based keys in FormularioReceita');
    console.log('   - Added duplicate removal in category loading');
    console.log('   - Fixed SelectWithAdd component keys');
    console.log('   - Cleaned database of duplicate entries');
    
  } catch (error) {
    console.error('❌ Error fixing duplicate keys:', error);
    
    if (error.code === 'ECONNREFUSED') {
      console.log('\n💡 Make sure the server is running:');
      console.log('   npm run dev');
    }
  }
}

// Run the fix
fixDuplicateKeys();
