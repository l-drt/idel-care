## À faire à chaque fois (lancer l’app)

### Option A — Avec Expo Go (QR code)

```bash
cd d:\DEV\SelamatConsult\idel-care
docker compose up -d
npm run api:dev
# 2e terminal :
npm run expo:start
# Scanner le QR code avec Expo Go
```

### Option B — App dev sur iPhone (sans Expo Go)

**Une seule fois :** construire et installer l’app dev sur ton iPhone.

```bash
cd d:\DEV\SelamatConsult\idel-care\apps\mobile
npm run build:dev:ios
```

(EAS te demandera de te connecter à Expo si besoin. À la fin, tu récupères un lien pour installer l’app sur l’iPhone.)

**À chaque fois :** lancer le bundler, puis ouvrir l’app « IDEL Care » sur l’iPhone (même WiFi que le PC).

```bash
cd d:\DEV\SelamatConsult\idel-care\apps\mobile
npm run start:dev
```

L’app dev sur l’iPhone se connecte au bundler ; plus besoin d’Expo Go.

---

## En résumé

| Question | Réponse |
|----------|--------|
| La base est créée par qui ? | Docker crée la base vide. Prisma (migrate) crée les tables dedans. |
| Comment je sais si les tables existent ? | Tu lances `npx prisma studio` dans `apps\api` : si les tables s’affichent, c’est bon. |
| Je refais la migration à chaque fois ? | Non. Une seule fois (ou quand on te dit de la refaire après un changement de schéma). |
| L’API ne démarre pas, erreur DATABASE_URL ? | Vérifie que `apps\api\.env` existe et contient la ligne `DATABASE_URL=...`. |
