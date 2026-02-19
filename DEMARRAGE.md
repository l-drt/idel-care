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

**Une seule fois :** construire et installer l’app dev sur l’iPhone.

```bash
cd d:\DEV\SelamatConsult\idel-care\apps\mobile
npm run build:dev:ios
```

(EAS te guide : connexion Expo, Apple, certificats. À la fin, un lien permet d’installer l’app sur l’iPhone.)

**À chaque fois :** lancer l’API + le bundler, puis ouvrir l’app « IDEL Care » sur l’iPhone (même WiFi que le PC).

```bash
# Terminal 1
cd d:\DEV\SelamatConsult\idel-care
docker compose up -d
npm run api:dev

# Terminal 2
cd d:\DEV\SelamatConsult\idel-care\apps\mobile
npm run start:dev
```

Ouvre l’app **IDEL Care** sur l’iPhone : elle se connecte au bundler. Plus besoin d’Expo Go.

---

## En résumé

| Question | Réponse |
|----------|--------|
| La base est créée par qui ? | Docker crée la base vide. Prisma (migrate) crée les tables dedans. |
| Comment je sais si les tables existent ? | Tu lances `npm run prisma:studio` dans `apps/api` : si les tables s’affichent, c’est bon. |
| Où voir les users, l’audit, la base ? | Prisma Studio (`apps/api` → `npm run prisma:studio`) ou connexion PostgreSQL avec `DATABASE_URL`. Voir [docs/ACCES-BASE-ET-AUDIT.md](docs/ACCES-BASE-ET-AUDIT.md). |
| Je refais la migration à chaque fois ? | Non. Une seule fois (ou quand on te dit de la refaire après un changement de schéma). |
| L’API ne démarre pas, erreur DATABASE_URL ? | Vérifie que `apps/api/.env` existe et contient la ligne `DATABASE_URL=...`. |
| **« Network request failed »** (inscription / connexion) | Sur téléphone : crée `apps/mobile/.env` avec `EXPO_PUBLIC_API_URL=http://IP_DE_TON_MAC:3000/api`. Redémarre Expo. |
