# Accéder à la base de données et aux logs d’audit

## 1. Prisma Studio (toutes les tables : users, audit_logs, patients, etc.)

**Prisma Studio** ouvre une interface web pour parcourir et modifier les données.

```bash
cd apps/api
npm run prisma:studio
```

- Une fenêtre s’ouvre dans le navigateur (souvent **http://localhost:5555**).
- Les tables sont listées à gauche : **users**, **audit_logs**, **patients**, **refresh_tokens**, etc.
- Clique sur une table pour voir les enregistrements, filtrer, éditer.

La connexion utilise la variable **DATABASE_URL** du fichier `apps/api/.env`. Vérifie que Docker (PostgreSQL) tourne avant (`docker compose up -d`).

---

## 2. Connexion directe à la base (pgAdmin, DBeaver, psql, etc.)

Tu peux te connecter avec n’importe quel client PostgreSQL en utilisant l’URL de `apps/api/.env` :

- **Variable** : `DATABASE_URL`
- **Format** : `postgresql://USER:PASSWORD@HOST:PORT/DATABASE?schema=public`
- **En dev avec Docker** : souvent `postgresql://postgres:postgres@localhost:5432/idel_care` (à confirmer dans ton `.env`).

Exemples :
- **psql** : `psql "postgresql://postgres:postgres@localhost:5432/idel_care"`
- **pgAdmin / DBeaver** : créer une connexion avec les mêmes paramètres (host, port, user, password, database).

Tu peux alors exécuter du SQL (ex. `SELECT * FROM audit_logs ORDER BY "createdAt" DESC LIMIT 100;`, `SELECT * FROM users;`).

---

## 3. API : consulter les logs d’audit (réservé ADMIN)

L’API expose un endpoint pour lister les **derniers logs d’audit** sans ouvrir la base :

- **URL** : `GET /api/audit`
- **Authentification** : **Bearer** token JWT (utilisateur connecté).
- **Droits** : réservé aux utilisateurs avec le rôle **ADMIN**.

Paramètres de requête (optionnels) :
- `limit` : nombre max d’entrées (défaut 100, max 500).
- `offset` : décalage pour la pagination.

Exemple (avec un token ADMIN) :

```bash
curl -H "Authorization: Bearer VOTRE_ACCESS_TOKEN" "http://localhost:3000/api/audit?limit=50"
```

Pour avoir un utilisateur ADMIN en dev : modifier en base le champ `role` d’un user de `NURSE` à `ADMIN` (via Prisma Studio ou SQL), puis te connecter avec ce compte pour récupérer un token et appeler `GET /api/audit`.

---

## Récapitulatif

| Besoin | Méthode |
|--------|--------|
| Voir / éditer **users**, **patients**, **audit_logs**, etc. | **Prisma Studio** : `cd apps/api && npm run prisma:studio` |
| Requêtes SQL, scripts, autre outil | Connexion PostgreSQL avec **DATABASE_URL** (voir `apps/api/.env`) |
| Consulter les logs d’audit depuis l’app ou un script | **GET /api/audit** avec un JWT d’un utilisateur **ADMIN** |
