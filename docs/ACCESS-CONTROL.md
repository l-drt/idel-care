# Contrôle d'accès et partage — À venir

Ce document décrit l’architecture prévue pour la gestion des rôles et du **partage d’accès** (ex. un infirmier partage certains patients avec un médecin, d’autres avec un prestataire). L’API est conçue pour l’intégrer sans tout refondre.

---

## Rôles existants (Prisma)

- **NURSE** — Infirmier libéral (par défaut à l’inscription)
- **PRESCRIBER** — Médecin prescripteur
- **PROVIDER** — Prestataire
- **ADMIN** — Admin cabinet

---

## Modèle actuel

- **User** a un `role` global.
- **PatientAssignment** : lien infirmier ↔ patient (nurseId, patientId). Un infirmier « possède » une liste de patients assignés.

---

## Modèle cible (à implémenter)

### 1. Accès par rôle (RBAC)

- Certaines routes ou écrans ne sont accessibles qu’à certains rôles (ex. seul un ADMIN peut créer des utilisateurs, seul NURSE/PRESCRIBER/PROVIDER voient les dossiers patients).
- **À faire :** guards NestJS par rôle (ex. `@Roles('NURSE', 'ADMIN')`), et côté mobile afficher/masquer des onglets ou écrans selon le rôle de l’utilisateur connecté.

### 2. Partager un patient à un autre utilisateur

- Un **infirmier** peut partager **certains** de ses patients à un **médecin** (prescripteur) ou à un **prestataire**, sans leur donner accès à toute sa liste.
- **À faire :** introduire une entité du type **PatientAccessGrant** (ou `SharedPatient`) :
  - `patientId`, `grantedByUserId` (l’infirmier), `grantedToUserId` (médecin ou prestataire)
  - `scope` : ex. `VIEW` (lecture seule) / `EDIT` (saisie soins) / `SHARE` (peut re-partager)
  - dates de validité optionnelles
- Pour « l’infirmier voit ses patients, le médecin voit ceux qu’on lui a partagés » : une même route (ex. `GET /patients`) pourra s’appuyer sur un **service d’accès** qui retourne :
  - pour un NURSE : les patients via `PatientAssignment` + ceux reçus en partage si besoin ;
  - pour un PRESCRIBER/PROVIDER : les patients pour lesquels il existe un `PatientAccessGrant` vers lui.

### 3. Service central « peut accéder à cette ressource »

- Un **AccessControlService** (ou `PermissionsService`) pour centraliser la logique :
  - `canAccessPatient(userId, patientId, scope?)` : true si l’utilisateur est assigné (nurse) ou a un grant sur ce patient avec le scope demandé.
  - À utiliser dans les guards, les services métier (patients, vitals, documents) et, à terme, côté mobile pour cacher/désactiver des actions.

### 4. Évolutions possibles

- Invitation par email (médecin/prestataire) avant de créer le grant.
- Révoquer un partage (suppression ou désactivation du grant).
- Audit : qui a partagé quoi, quand.

---

## Où coder tout ça

- **API :** module dédié `access-control` ou `permissions` (guards, AccessControlService, DTOs), puis table Prisma `PatientAccessGrant` (ou équivalent) quand on l’ajoute.
- **Mobile :** stocker le `role` (et plus tard les permissions si besoin) après login ; adapter les écrans et la navigation selon le rôle ; appeler uniquement les endpoints autorisés.

---

**Résumé :** l’inscription ouverte crée des utilisateurs avec le rôle NURSE. L’architecture (User.role, PatientAssignment, et un futur modèle de partage + service d’accès) est prête pour ajouter la gestion des rôles et le partage infirmier → médecin / prestataire sans refonte.
