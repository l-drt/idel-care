# Fonctionnement métier — Qui fait quoi ?

Ce document explique **qui crée quoi** et **qui a accès à quoi** dans IDEL Care.

---

## 1. Qui crée son compte (inscription) ?

- **L’infirmier(ère)** crée **son** compte dans l’app (email, mot de passe, 2FA). C’est le seul flux d’inscription ouvert aujourd’hui. Le rôle par défaut est **NURSE**.
- **Le patient** (la personne soignée) **ne crée pas** de compte par défaut : c’est une fiche créée par l’infirmier dans l’app, pas un utilisateur qui se connecte.
- **Le médecin** ou **le prestataire** : aujourd’hui ils n’ont pas d’inscription dédiée ; le partage vers eux est prévu (voir plus bas) mais pas encore en place.

En résumé : **c’est l’infirmier qui a un compte** ; il crée et gère les **dossiers patients** dans l’app.

---

## 2. Qui crée les patients dans l’app ?

- **L’infirmier** crée lui‑même les patients dans **sa** base : il ajoute un patient (nom, prénom, date de naissance, adresse, etc.).  
- À chaque patient créé, une **assignation** est créée : ce patient est **assigné** à cet infirmier (**PatientAssignment** = « cet infirmier est responsable de ce patient »).  
- Donc : **ce n’est pas le patient qui crée sa fiche** ; c’est l’infirmier qui crée la fiche du patient et la met dans sa liste.

---

## 3. « Envoyer » / partager le dossier patient (médecin, prescripteur, patient)

C’est bien **l’objectif** que tu décris :

1. **L’infirmier** crée ses patients dans l’app.
2. Il peut **partager** (envoyer l’accès à) un dossier patient vers :
   - un **médecin** (prescripteur) qui a son compte → le médecin pourra accéder à ce dossier ;
   - un **prestataire** qui a son compte → idem ;
   - ou, à terme, **le patient lui‑même** s’il a un compte → accès à son propre dossier (espace patient).

Aujourd’hui dans le code :

- Les **rôles** existent (NURSE, PRESCRIBER, PROVIDER, ADMIN).
- Le lien **infirmier ↔ patient** existe (**PatientAssignment**).
- Le **partage** (infirmier → médecin / prestataire / patient) est **prévu** dans l’architecture (voir `docs/ACCESS-CONTROL.md`) mais **pas encore implémenté** : il manque par exemple une table du type **PatientAccessGrant** (ou « SharedPatient ») et les écrans / API pour « partager ce patient à ce médecin » ou « donner au patient l’accès à son dossier ».

Donc : **le but est bien** que l’infirmier puisse envoyer/partager le dossier à un médecin, un prestataire ou au patient ; la logique métier est décrite, le code pour le partage reste à développer.

---

## 4. Récapitulatif

| Question | Réponse |
|----------|--------|
| Qui crée son compte ? | L’**infirmier** (inscription). Pas le patient, pour l’instant. |
| Qui crée les patients dans l’app ? | L’**infirmier** : il crée la fiche patient et elle est dans **sa** base. |
| C’est quoi PatientAssignment ? | Le lien « cet infirmier est responsable de ce patient » (sa liste de patients). |
| Qui peut avoir accès au dossier ? | Aujourd’hui : l’infirmier assigné. À venir : médecin / prestataire / patient via un **partage** (à coder). |
| Objectif « envoyer au médecin / au patient » ? | Oui : partage prévu (médecin ou patient avec compte qui accède au dossier), à implémenter (API + écrans). |

En une phrase : **l’infirmier crée son compte et crée lui‑même les patients dans son app ; l’objectif est qu’il puisse ensuite partager (envoyer) l’accès à un dossier au médecin, au prestataire ou au patient** — cette partie partage est à développer à partir de `docs/ACCESS-CONTROL.md`.
