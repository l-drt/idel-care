# Checklist déploiement – IDEL Care (HDS)

À faire **lors du déploiement** en production (staging / prod). Ce qui est déjà fait dans le code (audit, rate limiting, 2FA, etc.) n’est pas listé ici.

---

## 1. Variables d’environnement

### API (`apps/api/.env` en prod : secrets manager ou env injectés)

- [ ] **NODE_ENV=production**
- [ ] **JWT_SECRET** : chaîne longue et aléatoire (générer avec `openssl rand -base64 48`), **jamais** la valeur par défaut.
- [ ] **DATABASE_URL** : URL PostgreSQL de prod (hébergement HDS).
- [ ] **REDIS_URL** : Redis de prod (session/cache si utilisé).
- [ ] **JWT_EXPIRES_IN** / **REFRESH_TOKEN_EXPIRES_IN** : laisser 15m / 7d ou ajuster selon la politique.
- [ ] **ALLOWED_ORIGINS** : origines autorisées (ex. `https://app.idel-care.fr`), pas `*` en prod.
- [ ] **S3_*** (Object Storage) : si module documents utilisé (bucket HDS, clés, région).
- [ ] **BREVO_API_KEY** (ou équivalent) : envoi des codes 2FA par email en prod.
- [ ] **OVH_SMS_*** : envoi des codes 2FA par SMS en prod (remplacer le stub dev).
- [ ] **SENTRY_DSN** / monitoring : optionnel mais recommandé.

### Mobile (build EAS / CI)

- [ ] **EXPO_PUBLIC_API_URL** : URL de l’API en prod (ex. `https://api.idel-care.fr/api`), définie au build.

---

## 2. Logs et données sensibles

- [ ] Vérifier qu’**aucun code 2FA** (SMS/Email) n’est loggé en prod : le code actuel ne logue ces codes que si `NODE_ENV !== 'production'`. Ne pas définir de mode “debug” en prod qui loggerait les codes.
- [ ] Ne pas logger mots de passe, tokens, ou données santé en clair (déjà respecté dans le code).
- [ ] Configurer la rétention des logs applicatifs (ex. 90 jours) selon la politique.

---

## 3. Audit

- [ ] Les événements **LOGIN_FAILURE**, **LOGIN_STEP1_SUCCESS**, **LOGIN_2FA_SUCCESS**, **LOGOUT** sont déjà enregistrés dans `audit_logs` (AuditService).
- [ ] Lors de l’implémentation des accès aux dossiers patients (CRUD patients, constantes, etc.) : appeler **AuditService.log()** pour chaque accès/action sensible (ex. `PATIENT_VIEW`, `PATIENT_UPDATE`, `VITAL_CREATE`).
- [ ] Définir une **politique de conservation** des logs d’audit : **3 ans minimum** (exigence HDS). À mettre en œuvre par purge/archivage (job ou procédure) ou conservation par l’hébergeur.

---

## 4. HTTPS / TLS

- [ ] **Tout le trafic** API et front doit passer en **HTTPS** (TLS 1.2 minimum, idéalement 1.3).
- [ ] Certificat SSL/TLS valide (Let’s Encrypt ou fourni par l’hébergeur).
- [ ] Pas d’exposition directe du backend sur le net : placer l’API derrière un **reverse proxy** (Nginx, Traefik, load balancer OVH) qui gère TLS et coupe HTTP.

---

## 5. Hébergement HDS (OVHcloud ou autre certifié)

- [ ] Utiliser des **services certifiés HDS** (liste : https://esante.gouv.fr/offres-services/hds).
- [ ] **PostgreSQL** : base managée HDS ou VM avec chiffrement disque.
- [ ] **Redis** (si utilisé) : instance HDS ou équivalent.
- [ ] **Object Storage** (documents) : bucket HDS (S3-compatible), chiffrement activé.
- [ ] **Backups** : sauvegardes automatiques quotidiennes (base + fichiers si besoin), testées régulièrement.
- [ ] **PRA (plan de reprise d’activité)** : documenté et testé (restauration, RTO/RPO).
- [ ] **Firewall** : règles restrictives (ex. seule la sortie HTTP/HTTPS et les ports nécessaires).
- [ ] **WAF** (optionnel) : protection des couches applicatives.

---

## 6. RGPD (à finaliser côté métier)

- [ ] **Consentement patient** : imposer `consentGiven` + `consentDate` à la création/édition patient (écrans + API).
- [ ] **Droit à l’oubli** : logique de soft delete / anonymisation (filtrage `deletedAt`, purge ou anonymisation des champs identifiants).
- [ ] **Portabilité** : endpoint d’**export des données** patient (JSON et/ou PDF) pour la personne concernée.
- [ ] **Minimisation** : ne pas ajouter de champs inutiles ; garder le modèle actuel cohérent.

---

## 7. Application mobile (build prod)

- [ ] Build EAS **production** (pas seulement development) avec **EXPO_PUBLIC_API_URL** pointant vers l’API prod.
- [ ] Vérifier que Face ID / déverrouillage par mot de passe fonctionnent sur build natif (pas Expo Go).
- [ ] Politique de confidentialité / mentions légales accessibles (écran ou lien).

---

## 8. Sécurité complémentaire

- [ ] **Rate limiting** : déjà en place sur les routes auth (5 tentatives / 15 min). Vérifier en prod (proxy peut aussi limiter).
- [ ] **CORS** : `ALLOWED_ORIGINS` correctement renseigné, pas d’origine `*` en prod.
- [ ] **Helmet** : déjà utilisé côté NestJS ; vérifier les en-têtes de sécurité en prod.
- [ ] Mises à jour de dépendances (npm audit, Dependabot) avant chaque déploiement.

---

## 9. Après le déploiement

- [ ] Exécuter les **migrations Prisma** : `npx prisma migrate deploy` (avec `DATABASE_URL` prod).
- [ ] Tester un **cycle complet** : inscription → choix 2FA → connexion → déconnexion ; connexion avec 2FA ; déverrouillage par mot de passe si Face ID activé.
- [ ] Vérifier les **logs d’audit** en base (`audit_logs`) pour les événements auth.
- [ ] Monitoring / alertes (disque, CPU, erreurs 5xx, Sentry si configuré).

---

## Références

- **Architecture** : [ARCHITECTURE.md](./ARCHITECTURE.md)
- **Accès base et logs d’audit** : [docs/ACCES-BASE-ET-AUDIT.md](./docs/ACCES-BASE-ET-AUDIT.md) (Prisma Studio, DATABASE_URL, GET /api/audit)
- **HDS obligatoire / optionnel** : [docs/HDS-OBLIGATOIRE-VS-OPTIONNEL.md](./docs/HDS-OBLIGATOIRE-VS-OPTIONNEL.md)
- **Checklist conformité** : [docs/HDS-COMPLIANCE.md](./docs/HDS-COMPLIANCE.md)
- **Démarrage dev** : [DEMARRAGE.md](./DEMARRAGE.md)
