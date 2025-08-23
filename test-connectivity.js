// Script simples para testar conectividade com as APIs
const testAPIs = async () => {
  const baseURL = 'http://localhost:8080';
  const endpoints = [
    '/api/campanhas',
    '/api/caixa',
    '/api/funcionarios',
    '/api/clientes'
  ];

  console.log('🧪 Testando conectividade com APIs...\n');

  for (const endpoint of endpoints) {
    try {
      const startTime = Date.now();
      const response = await fetch(`${baseURL}${endpoint}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Cache-Control': 'no-cache'
        },
        signal: AbortSignal.timeout(5000) // 5 segundos timeout
      });
      
      const endTime = Date.now();
      const duration = endTime - startTime;
      
      if (response.ok) {
        const data = await response.json();
        console.log(`✅ ${endpoint}: OK (${duration}ms) - ${Array.isArray(data) ? data.length : 'N/A'} items`);
      } else {
        console.log(`❌ ${endpoint}: ${response.status} ${response.statusText} (${duration}ms)`);
      }
    } catch (error) {
      console.log(`❌ ${endpoint}: ${error.message}`);
    }
  }
  
  console.log('\n🧪 Teste de conectividade concluído');
};

testAPIs();
