// Verificar se o content-type é JSON antes de tentar ler
      const contentType = response.headers.get("content-type");
      if (!contentType || !contentType.includes("application/json")) {
        const responseText = await response.text();
        console.error(
          "📦 [CaixaContext] Resposta não é JSON:",
          responseText.substring(0, 200),
        );
        throw new Error(
          `Resposta não é JSON. Content-Type: ${contentType}. Resposta: ${responseText.substring(0, 100)}...`,
        );
      }

      // Tentar fazer parse da resposta JSON
      let lancamentosDoBanco;
      try {
        lancamentosDoBanco = await response.json();
      } catch (parseError) {
        console.error("📦 [CaixaContext] Erro ao fazer parse do JSON:", parseError);
        throw new Error(`Erro ao fazer parse da resposta JSON: ${parseError}`);
      }

      // Verificar se a resposta foi bem sucedida após fazer o parse
      if (!response.ok) {
        console.error("📦 [CaixaContext] Erro na resposta:", lancamentosDoBanco);
        const errorMessage = lancamentosDoBanco?.message || lancamentosDoBanco?.error || 'Erro desconhecido';
        throw new Error(
          `Erro ao carregar lançamentos: ${response.status} - ${errorMessage}`,
        );
      }
