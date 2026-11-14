# Plano de implementação

## Entregue
- Catálogo público responsivo com busca, categorias, favoritos e interesse local.
- Schema SQL de produtos, admins, interesses e visualizações com RLS.
- Leitura pública opcional de produtos via Supabase, quando configurado.

## Pendente antes de produção
1. Criar projeto Supabase e executar schema SQL; configurar .env localmente.
2. Criar autenticação de admin e interface de CRUD com checagem de perfil admin.
3. Criar endpoint servidor para interesse e visualizações com validação, rate limiting e antifraude.
4. Implementar painel de métricas sem dados pessoais desnecessários.
5. Consentimento, privacidade, testes e deploy.

A tabela interests não aceita escrita anônima direta de propósito: não seria confiável nem segura. Não anunciar métricas reais até a API estar conectada.
