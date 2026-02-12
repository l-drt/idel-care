# HDS : obligatoire vs optionnel

Ce document récapitule ce qui est **exigé par la certification HDS** (données de santé) et ce qui est **optionnel** (choix utilisateur ou confort).

---

## ✅ OBLIGATOIRE (exigences HDS)

### Connexion / Authentification

| Exigence | Description | IDEL Care |
|----------|-------------|-----------|
| **Authentification forte (2FA)** | À chaque **connexion**, au moins **2 facteurs** : quelque chose que l’utilisateur sait (mot de passe) + quelque chose qu’il a / reçoit (code TOTP, SMS ou email). | ✅ Obligatoire à chaque login : mot de passe + code 2FA (TOTP, SMS ou Email au choix). |
| **Mots de passe** | Stockage sécurisé (hash, pas en clair). | ✅ bcrypt, cost 12. |
| **Sessions** | Tokens avec expiration courte, refresh contrôlé. | ✅ JWT 15 min, refresh 7 jours. |
| **Limitation des tentatives** | Limiter les tentatives de connexion (bruteforce). | ✅ Rate limiting (à activer en prod si pas déjà fait). |

**Important :** Ce qui est obligatoire, c’est la **double authentification au moment de la connexion**. Dès que l’utilisateur s’est connecté avec mot de passe + 2FA, la session est considérée comme établie.

### Données

| Exigence | Description |
|----------|-------------|
| **Chiffrement au repos** | Données sensibles chiffrées en base (ex. PostgreSQL). |
| **Chiffrement en transit** | TLS (HTTPS) pour tout échange. |
| **Documents / pièces** | Stockage sécurisé (ex. Object Storage HDS, chiffrement). |
| **Pas de données sensibles en logs** | Pas de mots de passe, tokens ou données santé en clair dans les logs. |
| **Notifications push** | Conformité HDS : **aucune donnée de santé** ne doit figurer dans le contenu des notifications push (titre, corps, données attachées). Les notifications peuvent indiquer qu’un rappel ou une alerte existe, sans détailler le patient ou le soin. |

### Audit et traçabilité

| Exigence | Description |
|----------|-------------|
| **Traçabilité des accès** | Qui a accédé à quoi, quand (logs d’accès aux dossiers patients). |
| **Conservation des logs** | Durée minimale (souvent 3 ans). |
| **Horodatage** | Date/heure sur les actions sensibles. |

### RGPD

| Exigence | Description |
|----------|-------------|
| **Consentement** | Consentement du patient pour le traitement des données. |
| **Droit à l’oubli** | Possibilité de suppression / anonymisation. |
| **Portabilité** | Export des données (ex. JSON/PDF). |
| **Minimisation** | Ne collecter que le nécessaire. |

### Infrastructure

| Exigence | Description |
|----------|-------------|
| **Hébergement certifié HDS** | Hébergeur figurant sur la liste HDS (ex. OVHcloud HDS). |
| **Sauvegardes** | Sauvegardes régulières, testées. |
| **Plan de reprise d’activité (PRA)** | Procédures en cas de sinistre. |

---

## 🔹 OPTIONNEL (confort / choix utilisateur)

### Écran de déverrouillage (Face ID / Touch ID / mot de passe)

| Élément | Obligatoire HDS ? | Description |
|--------|-------------------|-------------|
| **Écran « Déverrouiller l’app »** | **Non** | Cet écran n’apparaît **que si** l’utilisateur a choisi « Activer » lorsque l’app lui a proposé d’utiliser Face ID / Touch ID pour déverrouiller l’app à l’ouverture. |
| **Face ID / Touch ID** | **Non** | Option de confort pour déverrouiller l’app sans retaper le mot de passe. Pas une exigence HDS. |
| **Déverrouillage par mot de passe** (sans déconnexion) | **Non** | Alternative au Face ID quand il ne fonctionne pas : l’utilisateur prouve qu’il connaît le mot de passe pour accéder à la **session déjà établie** (déjà validée par 2FA). |

En résumé : **rien de tout cela n’est imposé par l’HDS**. L’HDS exige la 2FA **à la connexion**. Une fois connecté, proposer un verrouillage optionnel (Face ID ou mot de passe) à la réouverture de l’app est un **plus** pour la sécurité locale, pas une obligation réglementaire.

### Choix du 2e facteur (TOTP, SMS, Email)

| Élément | Obligatoire HDS ? | Description |
|--------|-------------------|-------------|
| **Choix entre TOTP, SMS, Email** | **Non** | L’HDS exige « au moins 2 facteurs ». Le fait de proposer plusieurs méthodes (TOTP, SMS, Email) est un choix de conception ; une seule méthode (ex. TOTP uniquement) peut suffire si elle assure bien 2 facteurs à la connexion. |

---

## Récapitulatif

| Thème | Obligatoire HDS | Optionnel |
|-------|-----------------|-----------|
| **Connexion** | 2FA à chaque connexion (mot de passe + 2e facteur), mots de passe hashés, sessions (JWT/refresh) sécurisées, **rate limiting** (5 tentatives / 15 min sur auth). | Choix du 2e facteur (TOTP / SMS / Email). |
| **Après connexion** | — | Verrouillage app (Face ID / mot de passe) à la réouverture ; écran de déverrouillage uniquement si l’utilisateur a activé l’option. |
| **Données** | Chiffrement au repos et en transit, pas de données sensibles en logs. | — |
| **Audit** | Traçabilité des accès, conservation des logs, horodatage. | — |
| **RGPD** | Consentement, droit à l’oubli, portabilité, minimisation. | — |
| **Infrastructure** | Hébergement HDS, sauvegardes, PRA. | — |

**En une phrase :** Pour l’HDS, l’obligation forte côté connexion est la **double authentification à chaque connexion**. L’écran de déverrouillage (Face ID / mot de passe) à la réouverture de l’app est **optionnel** et n’apparaît que si l’utilisateur a choisi de l’activer.

---

## État actuel du projet IDEL Care (Données, Audit, RGPD, Infra)

Pour les lignes **Données**, **Audit**, **RGPD** et **Infrastructure** du récapitulatif, voici ce qui est **déjà en place** vs **à finaliser** avant mise en production HDS.

| Thème | En place | À faire / à vérifier |
|-------|----------|----------------------|
| **Données** | Mots de passe non loggés. Pas de tokens en clair dans les réponses. | **Chiffrement au repos** : pris en charge par l’infra (PostgreSQL managé HDS en prod). **TLS** : HTTPS obligatoire en prod (reverse proxy / load balancer). **Logs** : en dev les codes 2FA (SMS/Email) sont loggés en console ; en prod ne pas les logger (ou uniquement en debug désactivé). **Documents** : Object Storage HDS + chiffrement à brancher (module documents à implémenter). |
| **Audit** | Modèle Prisma `AuditLog`, **AuditService** qui écrit en base. Événements auth déjà loggés : `LOGIN_FAILURE`, `LOGIN_STEP1_SUCCESS`, `LOGIN_2FA_SUCCESS`, `LOGOUT` (avec IP, userAgent). | Lors de l’implémentation des accès patients : appeler `AuditService.log()` pour chaque accès/action sensible (ex. consultation dossier). Conservation 3 ans = politique de rétention (infra / procédure). Voir [DEPLOIEMENT.md](../DEPLOIEMENT.md). |
| **RGPD** | Modèle `Patient` : `consentGiven`, `consentDate`, `deletedAt` (soft delete). Paramètres app : Données collectées, Exporter mes données, Supprimer mon compte (RGPD). | **Consentement** : obligatoire à la création/édition patient (à imposer dans les écrans et API). **Droit à l’oubli** : logique de soft delete / anonymisation à brancher (filtrage `deletedAt`, purge ou anonymisation). **Portabilité** : endpoint d’export des données patient (ex. JSON/PDF) à ajouter. **Minimisation** : respectée par le modèle et les écrans (ne pas collecter de champs inutiles). |
| **Infrastructure** | Documentée (ARCHITECTURE.md : OVHcloud HDS, backups, PRA). | **100 % déploiement** : hébergement certifié HDS, sauvegardes automatiques, PRA et tests de restauration à mettre en œuvre au moment du déploiement. Aucun code applicatif spécifique. |

En résumé : **connexion (2FA, JWT, bcrypt)** = bon. **Données / Audit / RGPD** = modèles et structure prêts, logique métier et écriture des logs d’audit à finaliser. **Infrastructure** = à mettre en place au déploiement (hébergeur HDS, TLS, sauvegardes, PRA).
