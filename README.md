# GUARAPARI 360°

Base Expo Router (Android, iOS e Web/PWA) para o guia turístico de Guarapari.

## Executar

1. Copie `.env.example` para `.env` e informe apenas chaves públicas de cliente.
2. Execute `npm install`.
3. Execute `npm run start` ou `npm run web`.

## Integrações

- Google Maps usa o SDK nativo/Web e abre a navegação do Google Maps.
- Google Places é consumido pela Edge Function `nearby-places`; mantenha a chave de servidor somente nos secrets da função.
- OpenWeather é tipado em `src/services/weather.ts`.
- Supabase tem schema normalizado e RLS em `supabase/migrations`.

Defina `GOOGLE_PLACES_API_KEY` como secret da Edge Function `nearby-places`; ela não deve ser uma variável `EXPO_PUBLIC_`.

## Assinaturas Cakto

Configure `CAKTO_CHECKOUT_URL`, `CAKTO_WEBHOOK_TOKEN`, `SUPABASE_SERVICE_ROLE_KEY` somente nos secrets das Edge Functions. Aponte o webhook Cakto para `cakto-webhook` e envie o token no cabeçalho configurado. Eventos são idempotentes por `provider_event_id`; o aplicativo só lê a própria assinatura por RLS.

As imagens de praias não são geradas por IA e não foram incluídas sem licença verificável. Envie acervo real, com atribuição e URL de licença, para o Storage antes da publicação.

## Web PWA e Vercel

O projeto exporta uma SPA responsiva e instalável. Para validar o build de produção, execute `npm run build:web`; os arquivos serão gerados em `dist/`.

Na Vercel, importe o repositório GitHub e mantenha as configurações detectadas pelo arquivo `vercel.json`. Cadastre as variáveis de ambiente de Produção e Preview:

- `EXPO_PUBLIC_SUPABASE_URL`
- `EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY`
- `EXPO_PUBLIC_GOOGLE_MAPS_API_KEY` (quando o mapa web estiver configurado)
- `EXPO_PUBLIC_OPENWEATHER_API_KEY` (quando o clima estiver configurado)

Depois de obter o domínio público, inclua no Supabase Auth as Redirect URLs `https://SEU-DOMINIO/auth/callback` e `https://SEU-DOMINIO/auth/redefinir-senha`, além de definir a Site URL como `https://SEU-DOMINIO`. Isso preserva login, recuperação de senha, sessão e assinatura no aplicativo web.
