import React, { useEffect, useState } from 'react';

export function TesteCaixa() {
  const [dados, setDados] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const testarAPI = async () => {
      try {
        console.log('🧪 Testando API do Caixa...');
        const response = await fetch('/api/caixa?dataInicio=2025-08-21&dataFim=2025-08-22');
        const data = await response.json();
        
        console.log('📊 Dados recebidos da API:', data);
        
        // Processar dados igual ao CaixaContext
        const dadosProcessados = data.map((lancamento: any) => ({
          id: lancamento.id,
          valor: lancamento.valor,
          tipo: lancamento.tipo,
          categoria: lancamento.descricaoECategoria?.categoria || lancamento.descricao?.categoria || "Serviços",
          descricao: {
            nome: lancamento.descricaoECategoria?.nome || lancamento.descricao?.nome || "Serviço"
          },
          formaPagamento: lancamento.formaPagamento?.nome || "N/A",
          funcionario: lancamento.funcionario?.nome || null,
          cliente: lancamento.cliente?.nome || null,
          comissao: lancamento.comissao || 0,
          observacoes: lancamento.observacoes || null,
          numeroNota: lancamento.numeroNota || null,
          dadosOriginais: {
            descricao: lancamento.descricao,
            descricaoECategoria: lancamento.descricaoECategoria
          }
        }));
        
        console.log('✅ Dados processados:', dadosProcessados);
        setDados(dadosProcessados);
      } catch (error) {
        console.error('❌ Erro ao testar API:', error);
      } finally {
        setLoading(false);
      }
    };

    testarAPI();
  }, []);

  if (loading) {
    return <div className="p-4">🔄 Carregando teste...</div>;
  }

  return (
    <div className="p-4 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">🧪 Teste da API do Caixa</h1>
      
      <div className="space-y-4">
        {dados?.map((lancamento: any, index: number) => (
          <div key={lancamento.id} className="border p-4 rounded-lg bg-white shadow">
            <h3 className="font-bold text-lg mb-2">📋 Lançamento {index + 1}</h3>
            
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div><strong>ID:</strong> {lancamento.id}</div>
              <div><strong>Valor:</strong> R$ {lancamento.valor}</div>
              <div><strong>Tipo:</strong> {lancamento.tipo}</div>
              <div><strong>Categoria:</strong> {lancamento.categoria}</div>
              <div><strong>Descrição:</strong> {lancamento.descricao.nome}</div>
              <div><strong>Forma Pagamento:</strong> {lancamento.formaPagamento}</div>
              <div><strong>Funcionário:</strong> {lancamento.funcionario || 'N/A'}</div>
              <div><strong>Cliente:</strong> {lancamento.cliente || 'N/A'}</div>
              <div><strong>Comissão:</strong> R$ {lancamento.comissao}</div>
              <div><strong>Observações:</strong> {lancamento.observacoes || 'N/A'}</div>
              <div><strong>Número Nota:</strong> {lancamento.numeroNota || 'N/A'}</div>
            </div>
            
            <details className="mt-2">
              <summary className="cursor-pointer text-blue-600">🔍 Ver dados originais</summary>
              <pre className="mt-2 p-2 bg-gray-100 rounded text-xs overflow-auto">
                {JSON.stringify(lancamento.dadosOriginais, null, 2)}
              </pre>
            </details>
          </div>
        ))}
      </div>
      
      <div className="mt-6 p-4 bg-blue-50 rounded">
        <h3 className="font-bold">📝 Como verificar:</h3>
        <ol className="list-decimal list-inside mt-2 space-y-1 text-sm">
          <li>Se as descrições aparecem como "Serviço (corrigido X)" → API funcionando ✅</li>
          <li>Se aparecem números → há problema no cache ou normalização ❌</li>
          <li>Abra o console (F12) para ver os logs detalhados</li>
        </ol>
      </div>
    </div>
  );
}
