# Statut HDS et fondations — Conformité et reste à faire

Ce document fait le point sur ce qui est **prêt** (conforme HDS/RGPD) et ce qui **reste à faire**, pour avoir une trace claire de l’avancement.

**Dernière mise à jour :** 2025-02-18 — Mise en conformité patients (filtrage deletedAt, audit, consentement obligatoire, soft delete), mise à jour de ce fichier.

---

## ✅ Ce qui est bon (prêt / conforme)

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
| **Événements patients** : PATIENT_CREATE, PATIENT_LIST, PATIENT_VIEW, PATIENT_SOFT_DELETE (IP / userAgent) | ✅ |
| GET /api/audit (réservé ADMIN) | ✅ |

### Données (code)

| Élément | Statut |
|--------|--------|
| Pas de mots de passe / tokens en clair dans les réponses | ✅ |
| Codes 2FA loggés uniquement si `NODE_ENV !== 'production'` | ✅ |
| Modèle Patient avec `consentGiven`, `consentDate`, `deletedAt` | ✅ (champs en base) |

### Patients : API et accès

| Élément | Statut |
|--------|--------|
| CRUD patients (API) | ✅ POST /patients, GET /patients, GET /patients/:id |
| Filtrage `deletedAt` | ✅ Liste et détail n’affichent pas les patients avec `deletedAt` renseigné. |
| Audit sur les accès patients | ✅ PATIENT_CREATE, PATIENT_LIST, PATIENT_VIEW, PATIENT_SOFT_DELETE. |
| Accès = infirmier assigné | ✅ Toutes les routes patient vérifient `PatientAssignment` (nurseId = user connecté). |

### RGPD patients

| Élément | Statut |
|--------|--------|
| Consentement obligatoire | ✅ API : `consentGiven` + `consentDate` requis si `consentGiven` (validation DTO). App : envoi de la date à la création. |
| Droit à l’oubli patient | ✅ Soft delete : DELETE /patients/:id met `deletedAt` ; liste et détail excluent ces patients. Pas d’anonymisation automatique pour l’instant (traçabilité conservée). |

### Infra / déploiement (documentation)

| Élément | Statut |
|--------|--------|
| Checklist déploiement (DEPLOIEMENT.md) | ✅ |
| Rappel HDS (obligatoire / optionnel, notifications) | ✅ |

---

## ⚠️ Reste à faire

### RGPD patients (optionnel / plus tard)

| À faire | Détail |
|---------|--------|
| **Portabilité patient** | Endpoint d’export des données **d’un patient** (JSON/PDF) pour remise au patient ou à l’infirmier. À prévoir quand le flux métier est clair. |
| **Anonymisation** | Optionnel : lors du soft delete ou après délai, anonymiser nom/prénom/contact pour renforcer le droit à l’oubli tout en gardant la traçabilité. |

### Contrôle d’accès (plus tard)

| À faire | Détail |
|---------|--------|
| **Partage (médecin / patient)** | Décrit dans ACCESS-CONTROL.md ; à développer après CRUD + audit (déjà en place). |
| **Guards par rôle** | Réutiliser/étendre `RolesGuard` si écrans réservés à certains rôles. |

### Logs et production

| À faire | Détail |
|---------|--------|
| **En prod** | `NODE_ENV=production` pour ne jamais logger les codes 2FA. À confirmer au déploiement. |
| **Conservation des logs d’audit** | Politique 3 ans (purge/archivage ou hébergeur). Voir DEPLOIEMENT.md. |

### Au moment du déploiement (pas dans le code)

| À faire | Détail |
|---------|--------|
| **TLS** | Tout en HTTPS (reverse proxy, certificat). |
| **Hébergement HDS** | PostgreSQL (et éventuellement Redis, stockage fichiers) chez un hébergeur certifié. |
| **Sauvegardes / PRA** | Automatiques, testées, documentées. |
| **Variables d’environnement** | JWT_SECRET fort, DATABASE_URL prod, envoi réel 2FA (SMS/email), pas de valeurs par défaut sensibles. |

### Par feature (soins, constantes, tournées, documents)

- Appeler `AuditService.log()` sur les actions sensibles (création, modification, consultation).
- **Documents** : stockage sécurisé (Object Storage HDS, chiffrement) comme indiqué dans HDS-OBLIGATOIRE-VS-OPTIONNEL.md.

---

## Résumé : prêt pour le dev métier ?

| Domaine | Prêt ? | Note |
|---------|--------|------|
| **Auth / comptes / 2FA** | ✅ Oui | — |
| **RGPD utilisateur (export, suppression compte)** | ✅ Oui | — |
| **Audit (auth + patients)** | ✅ Oui | PATIENT_* loggés. |
| **Données (logs, modèles)** | ✅ Oui | Vérifier NODE_ENV en prod. |
| **Patients (API + accès + soft delete)** | ✅ Oui | Liste, détail, création, soft delete ; filtrage deletedAt ; audit. |
| **RGPD patients (consentement, droit à l’oubli)** | ✅ Oui | Consentement obligatoire (consentDate si consentGiven) ; soft delete en place. |
| **Portabilité patient** | ❌ Non | Export JSON/PDF à prévoir. |
| **Partage (médecin / patient)** | ❌ Non | Voir ACCESS-CONTROL.md. |
| **Infrastructure (TLS, HDS, backups, PRA)** | ❌ Non | Au déploiement. |

---

## Annexe : consentement patient

Le patient **ne se connecte pas** à l’app : c’est l’**infirmier** qui crée la fiche. Le consentement est enregistré comme suit :

- **En réalité** : l’infirmier obtient l’accord du patient (oral, formulaire papier, etc.) pour traiter ses données.
- **Dans l’app** : l’infirmier **atteste** du consentement (case + date `consentGiven` / `consentDate`). L’API exige ces champs (validation DTO) ; l’app envoie la date à la création.

---

En une phrase : **l’auth, les comptes, l’audit (auth + patients), le CRUD patients avec contrôle d’accès, le consentement obligatoire et le soft delete sont en place et conformes HDS/RGPD.** Il reste la portabilité patient (export), le partage de dossiers si besoin, et la mise en œuvre infra au déploiement.
