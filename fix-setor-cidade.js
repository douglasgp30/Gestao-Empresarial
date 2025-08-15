// Script para corrigir todas as referências a setor.cidade
// Este script substitui {setor.cidade} por uma versão defensiva que trata objetos e strings

const fs = require('fs');
const path = require('path');

const files = [
  'client/components/Caixa/ModalEditarLancamento.tsx',
  'client/components/Caixa/FormularioReceita.tsx',
  'client/components/Caixa/ModalReceita.tsx',
  'client/components/Caixa/ModalDespesa.tsx',
  'client/components/Caixa/ListaLancamentosSimples.tsx',
  'client/components/Caixa/ModalEditarLancamentoCompleto.tsx',
  'client/components/Caixa/FiltrosCaixaCompacto.tsx',
  'client/components/Caixa/ModalCidadeSetorSimples.tsx'
];

// Padrões para substituir
const patterns = [
  {
    from: /\{setor\.cidade\}/g,
    to: '{typeof setor.cidade === \'object\' ? setor.cidade?.nome : setor.cidade}'
  },
  {
    from: /setor\.cidade ===/g,
    to: '(typeof setor.cidade === \'object\' ? setor.cidade?.nome : setor.cidade) ==='
  },
  {
    from: /setor\.cidade ===/g,
    to: '(typeof setor.cidade === \'object\' ? setor.cidade?.nome : setor.cidade) ==='
  },
  {
    from: /\$\{setor\.nome\} - \$\{setor\.cidade\}/g,
    to: '${setor.nome} - ${typeof setor.cidade === \'object\' ? setor.cidade?.nome : setor.cidade}'
  },
  {
    from: /`\$\{setor\.nome\} - \$\{setor\.cidade\}`/g,
    to: '`${setor.nome} - ${typeof setor.cidade === \'object\' ? setor.cidade?.nome : setor.cidade}`'
  }
];

files.forEach(filePath => {
  if (fs.existsSync(filePath)) {
    let content = fs.readFileSync(filePath, 'utf8');
    let modified = false;
    
    patterns.forEach(pattern => {
      if (pattern.from.test(content)) {
        content = content.replace(pattern.from, pattern.to);
        modified = true;
      }
    });
    
    if (modified) {
      fs.writeFileSync(filePath, content);
      console.log(`Fixed: ${filePath}`);
    }
  }
});

console.log('Done!');
