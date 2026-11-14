# Ativação do primeiro administrador

O login do painel Supabase (dashboard) não é automaticamente uma conta de cliente do Supabase Auth.

1. Acesse https://supabase.com/dashboard/project/oecgjbqbwtxpakembgpr/auth/users
2. Em **Add user**, crie uma conta para seu e-mail com uma senha forte e privada, ou convide o e-mail (se a opção estiver disponível).
3. Não envie senha ao ChatGPT e não salve senha no GitHub.
4. Depois que o usuário aparecer em Authentication > Users, copie o **UUID** desse usuário.
5. No SQL Editor, execute (substituindo o UUID):
   ```sql
   insert into public.admin_users(user_id) values ('COLE_UUID_AQUI')
   on conflict (user_id) do nothing;
   ```
6. Faça login no botão **Admin** do catálogo com o e-mail e senha dessa conta.

A aplicação usa uma chave publicável no frontend, não uma chave secreta. As políticas RLS determinam quem pode criar, editar e excluir produtos. O banco está vazio e não há pedidos ou coleta de contatos ainda.

Para testar o site, rode `npm install` e `npm run build` ou consulte GitHub Actions. O site ainda precisa de hospedagem.
