# Options 2FA et conformité HDS

La certification HDS exige une **authentification forte** (au moins deux facteurs), mais **ne impose pas une seule méthode**. Plusieurs options sont acceptables.

---

## Options possibles (conformes à l’authentification forte)

| Méthode | Description | Implémenté IDEL Care | Remarque |
|--------|-------------|----------------------|----------|
| **TOTP (app)** | Code à 6 chiffres via Google Authenticator, Authy, etc. | ✅ Oui | Souvent considérée comme la plus robuste ; pas de dépendance SMS. |
| **SMS** | Code envoyé par SMS sur le numéro du professionnel | ✅ Oui | Option proposée au choix ; en prod brancher OVH SMS (cf. ARCHITECTURE.md). |
| **Email** | Code envoyé par email | ✅ Oui | Option proposée au choix ; en prod brancher Brevo ou équivalent. |
| **Clé matérielle (FIDO2 / WebAuthn)** | Clé USB type YubiKey, badge sans contact | Non | Très sécurisé ; à prévoir côté API (WebAuthn) et UX. |
| **Carte à puce** | Carte CPx ou carte d’établissement | Non | Souvent en environnement hospitalier. |
| **Face ID / Touch ID** | Déverrouillage local de l’app (optionnel) | ✅ Oui | **Ne remplace pas** le 2e facteur : utilisé uniquement pour déverrouiller l’app après connexion. La vraie connexion reste email + mot de passe + code 2FA (TOTP/SMS/Email). |

L’utilisateur **choisit** son mode 2FA à la première connexion (TOTP, SMS ou Email). TOTP reste recommandé ; SMS et Email sont conformes HDS tant qu’un second facteur est en place.

---

## Conformité HDS – Authentification

- **Authentification forte** : ✅ Au moins deux facteurs à chaque connexion (mot de passe + TOTP ou SMS ou Email).
- **Choix du 2e facteur** : ✅ TOTP, SMS ou Email selon le choix de l’utilisateur.
- **Face ID / Touch ID** : Utilisés uniquement pour le **déverrouillage local** de l’app (tokens déjà en SecureStore). En cas d’échec (lunettes, chapeau, etc.), l’utilisateur peut **déverrouiller avec son mot de passe** sans se déconnecter : l’API vérifie le mot de passe (endpoint `unlock-with-password`) sans créer de nouvelle session. La session (2FA déjà validée) reste inchangée. Alternative : « Se déconnecter » pour refaire un login complet (email + mot de passe + 2FA). La biométrie ne se substitue pas au 2e facteur au moment du login.
- **JWT** : Expiration courte + refresh tokens (cf. ARCHITECTURE.md).
- **Mots de passe** : Hash bcrypt (cost 12).

En l’état, le dispositif d’authentification est **conforme aux exigences HDS** pour l’authentification forte. Le reste de la conformité (hébergement HDS, chiffrement, audit, RGPD) est décrit dans [HDS-COMPLIANCE.md](./HDS-COMPLIANCE.md) et [ARCHITECTURE.md](../ARCHITECTURE.md).

---

## Évolutions possibles

- **FIDO2 / clé matérielle** : pour des profils à haut niveau d’exposition (ex. admin), ajout possible plus tard.
- **En prod** : brancher l’envoi réel des codes SMS (OVH SMS) et email (Brevo) au lieu du stub en dev.
