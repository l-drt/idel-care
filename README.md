# IDEL Care

Application SaaS de suivi patient pour infirmiers libéraux.  
Conformité **HDS** + **RGPD**.

## Stack

- **Mobile** : Expo (React Native) + TypeScript + expo-router + Zustand
- **API** : NestJS + Prisma + PostgreSQL
- **Infra** : Docker Compose (dev), OVHcloud HDS (prod)

## Structure (monorepo)

```
idel-care/
├── apps/
│   ├── api/          # Backend NestJS
│   └── mobile/       # App Expo
├── packages/
│   ├── types/        # Types partagés
│   └── utils/        # Utilitaires
├── docs/
├── docker-compose.yml
└── ARCHITECTURE.md   # Architecture technique détaillée
```

## Démarrage rapide (dev)

1. **Services (PostgreSQL + Redis)**  
   `docker compose up -d`

2. **API**  
   `cd apps/api && npm install && npx prisma migrate dev && npm run start:dev`

3. **Mobile**  
   `cd apps/mobile && npm install && npx expo start`

Voir [ARCHITECTURE.md](./ARCHITECTURE.md) pour le guide complet et les variables d'environnement.
