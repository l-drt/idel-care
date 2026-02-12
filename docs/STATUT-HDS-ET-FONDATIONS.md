# Statut HDS et fondations — Avant le développement des fonctionnalités métier

Ce document fait le point sur ce qui est **prêt** et ce qui **reste à faire** côté HDS, gestion des comptes/utilisateurs et des données, **avant** de développer les fonctionnalités opérationnelles (patients, soins, tournées, etc.).

---

## ✅ Ce qui est bon (prêt pour la suite)

### Authentification et comptes (HDS)

| Élément | Statut |
|--------|--------|
| Inscription (infirmier) | ✅ |
| 2FA à chaque connexion (TOTP, SMS, Email) | ✅ |
| Mots de passe hashés (bcrypt) | ✅ |
| JWT + refresh token (15 min / 7 j) | ✅ |
| Rate limiting sur l’auth (5 req / 15 min) | ✅ |
| Changer le mot de passe | ✅ |
| Déconnexion + invalidation des sessions | ✅ |
| Face ID / Touch ID (optionnel) + déverrouillage par mot de passe | ✅ |

### RGPD côté utilisateur connecté

| Élément | Statut |
|--------|--------|
| Données collectées (écran d’information) | ✅ |
| Export des données personnelles (portabilité) | ✅ GET /auth/me/export |
| Suppression de compte (droit à l’oubli, anonymisation) | ✅ POST /auth/me/delete-account |

### Audit

| Élément | Statut |
|--------|--------|
| Modèle `AuditLog` + AuditService | ✅ |
| Événements auth loggés (LOGIN_*, LOGOUT, ACCOUNT_DELETED) avec IP / userAgent | ✅ |
| GET /api/audit (réservé ADMIN) | ✅ |

### Données (code)

| Élément | Statut |
|--------|--------|
| Pas de mots de passe / tokens en clair dans les réponses | ✅ |
| Codes 2FA loggés uniquement si `NODE_ENV !== 'production'` | ✅ |
| Modèle Patient avec `consentGiven`, `consentDate`, `deletedAt` | ✅ (champs en base) |

### Infra / déploiement (documentation)

| Élément | Statut |
|--------|--------|
| Checklist déploiement (DEPLOIEMENT.md) | ✅ |
| Rappel HDS (obligatoire / optionnel, notifications) | ✅ |

---

## ⚠️ À faire avant ou en tout début de dev métier

Ces points concernent la **base** (HDS, RGPD, contrôle d’accès) et sont à traiter **avant** ou **dès le début** du développement des fonctionnalités (CRUD patients, soins, constantes, etc.).

### 1. Patients : API et accès

| À faire | Détail |
|---------|--------|
| **CRUD patients (API)** | Le module `patients` est vide (pas de controller/service). À ajouter : création, lecture, mise à jour, liste (filtrée par infirmier connecté via `PatientAssignment`). |
| **Filtrage `deletedAt`** | Dans toute requête patient : exclure les patients avec `deletedAt` non null (soft delete). |
| **Audit sur les accès patients** | À chaque action sensible (consultation dossier, création/édition patient, etc.) appeler `AuditService.log()` (ex. `PATIENT_VIEW`, `PATIENT_CREATE`, `PATIENT_UPDATE`). |

### 2. RGPD patients

| À faire | Détail |
|---------|--------|
| **Consentement obligatoire** | À la création/édition patient : exiger `consentGiven` + `consentDate` (validation API + écrans). Voir annexe « Consentement patient » en fin de document. |
| **Droit à l’oubli patient** | Logique de soft delete : mettre `deletedAt`, et/ou anonymiser les champs identifiants (nom, prénom, contact). Ne pas supprimer en dur pour garder la traçabilité. |
| **Portabilité patient** | Endpoint d’export des données **d’un patient** (JSON/PDF) pour la personne concernée ou l’infirmier (ex. pour remise au patient). À prévoir quand le flux métier est clair. |

### 3. Contrôle d’accès (recommandé dès le début)

| À faire | Détail |
|---------|--------|
| **Accès patient = infirmier assigné** | Pour chaque route patient (GET/PUT/DELETE, etc.) : vérifier que l’utilisateur connecté est bien l’infirmier assigné (PatientAssignment) pour ce patient. Sinon 403. |
| **Guards par rôle (optionnel maintenant)** | Si vous ouvrez des écrans réservés à certains rôles plus tard, réutiliser ou étendre le `RolesGuard` existant. |

Le partage (infirmier → médecin / prestataire / patient) est décrit dans `ACCESS-CONTROL.md` mais peut être développé **après** que le CRUD patient et l’audit soient en place.

### 4. Logs en production

| À faire | Détail |
|---------|--------|
| **Vérifier l’env** | En prod : `NODE_ENV=production` pour ne jamais logger les codes 2FA. Déjà prévu dans le code, à confirmer au déploiement. |

---

## 🔜 À faire pendant le dev métier (par feature)

- **Constantes / soins / tournées / documents** : pour chaque module qui touche aux données de santé, appeler `AuditService.log()` sur les actions sensibles (création, modification, consultation).
- **Documents** : quand le module sera implémenté, stockage sécurisé (Object Storage HDS, chiffrement) comme indiqué dans HDS-OBLIGATOIRE-VS-OPTIONNEL.md.

---

## 🚀 Au moment du déploiement (pas dans le code actuel)

- **TLS** : tout en HTTPS (reverse proxy, certificat).
- **Hébergement HDS** : PostgreSQL (et éventuellement Redis, stockage fichiers) chez un hébergeur certifié.
- **Sauvegardes** : automatiques, testées.
- **PRA** : documenté et testé.
- **Variables d’environnement** : JWT_SECRET fort, DATABASE_URL prod, envoi réel des codes 2FA (SMS/email) en prod, pas de valeurs par défaut sensibles.
- **Conservation des logs d’audit** : politique 3 ans (purge/archivage ou hébergeur).

---

## Résumé : bon pour démarrer le dev métier ?

| Domaine | Prêt ? | Action recommandée |
|---------|--------|--------------------|
| **Auth / comptes / 2FA** | ✅ Oui | Aucune. |
| **RGPD utilisateur (export, suppression compte)** | ✅ Oui | Aucune. |
| **Audit (auth)** | ✅ Oui | Étendre l’audit aux actions patients dès que le CRUD patient existe. |
| **Données (logs, modèles)** | ✅ Oui | Vérifier NODE_ENV en prod. |
| **Patients (API + accès)** | ❌ Non | Implémenter le CRUD patients, filtrage `deletedAt`, contrôle d’accès (assignation), audit sur chaque action. |
| **RGPD patients (consentement, droit à l’oubli)** | ❌ Partiel | Imposer consentement à la création/édition ; brancher soft delete / anonymisation. |
| **Partage (médecin / patient)** | ❌ Non | Après CRUD + audit ; voir ACCESS-CONTROL.md. |

---

## Annexe : comment fonctionne le consentement patient ?

Le patient **ne se connecte pas** à l'app : c'est l'**infirmier** qui crée la fiche patient. Le consentement ne se fait donc pas par le patient dans l'app, mais comme suit :

- **Dans la réalité** : l'infirmier obtient l'accord du patient (oral, signature sur un formulaire papier, etc.) pour traiter ses données dans l'application.
- **Dans l'app** : l'infirmier **atteste** que le patient a donné son accord en cochant une case (ex. « Le patient a donné son consentement pour le traitement de ses données ») et en enregistrant la **date** du consentement (`consentGiven` + `consentDate`). L'API et les écrans doivent exiger ces champs pour être conformes RGPD : on ne sauvegarde pas de fiche patient sans trace de consentement.
- En résumé : ce n'est **pas** le patient qui clique « J'accepte » dans l'app ; c'est l'infirmier qui **enregistre** le fait que le patient a consenti (à un moment donné, en dehors de l'app ou lors d'un échange).

---

En une phrase : **l’auth, les comptes, l’export/suppression de compte et l’audit auth sont conformes HDS et prêts.** Pour que la base soit complète avant le reste du développement, il reste à **ajouter le CRUD patients avec contrôle d’accès, audit sur les actions patients, et la gestion du consentement + soft delete**. Une fois cela en place, vous pouvez enchaîner sereinement sur les fonctionnalités opérationnelles (soins, constantes, tournées, etc.) en continuant à logger les actions sensibles dans l’audit.
