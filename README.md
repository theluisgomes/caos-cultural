<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# Run and deploy your AI Studio app

This contains everything you need to run your app locally.

View your app in AI Studio: https://ai.studio/apps/drive/1kS8B6_A6odu76UbWoj5ZT-WIDWxinGQw

## Run Locally

**Prerequisites:**  Node.js


1. Install dependencies:
   `npm install`
2. Set the `GEMINI_API_KEY` in [.env.local](.env.local) to your Gemini API key
3. Run the app:
   `npm run dev`

## Banco de dados

Firestore é a fonte de verdade (ver `CONTEXT.md`, `docs/data/collections.md`, ADR `docs/adr/0001-firestore-only-mvp.md`). Data Connect/Postgres está em `archive/`.

### Emuladores locais

```bash
# Terminal 1
npx firebase emulators:start

# Terminal 2 — apps/web
VITE_USE_FIREBASE_EMULATORS=true npm run dev
```

Portas: Auth `9099`, Firestore `8080`, Storage `9199`, Functions `5001`, UI `4000`.

## Deploy (Vercel + domínio)

1. Configure as variáveis de ambiente na Vercel (Project Settings -> Environment Variables):
   - `VITE_FIREBASE_API_KEY`
   - `VITE_FIREBASE_AUTH_DOMAIN`
   - `VITE_FIREBASE_PROJECT_ID`
   - `VITE_FIREBASE_STORAGE_BUCKET`
   - `VITE_FIREBASE_MESSAGING_SENDER_ID`
   - `VITE_FIREBASE_APP_ID`
   - `VITE_FIREBASE_MEASUREMENT_ID` (opcional)
2. Garanta que o domínio de produção esteja em Firebase Authentication -> Settings -> Authorized domains.
3. Este projeto usa SPA routing; o rewrite para `index.html` está em `vercel.json` para permitir abrir rotas diretas como `/agenda`.
