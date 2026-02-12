# Guide de déploiement IDEL Care

Voir la section **Guide d’implémentation** et **Infrastructure HDS** dans [ARCHITECTURE.md](../ARCHITECTURE.md).

## Résumé

1. Environnement local : `docker-compose up -d` puis migrations Prisma et `npm run api:dev`.
2. Staging/Production : OVHcloud HDS, CI/CD GitHub Actions (à configurer).
