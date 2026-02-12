# URLs et variables d'environnement (mobile)

## 1. Trouver l’IP de ton PC (Windows)

Quand tu testes l’app sur ton **iPhone** (build dev), le téléphone doit appeler l’API sur ton PC. Il faut donc utiliser l’**IP locale** du PC, pas `localhost`.

1. Ouvre **Invite de commandes** ou **PowerShell**.
2. Tape : `ipconfig`
3. Repère la section de ta connexion **Wi‑Fi** (carte « Carte réseau sans fil Wi-Fi » ou similaire).
4. Note l’**Adresse IPv4** (ex. `192.168.1.25`).

Dans `apps/mobile/.env` :

```env
EXPO_PUBLIC_API_URL=http://192.168.1.25:3000/api
```

(Remplace par ton IP.) Ton PC et ton iPhone doivent être sur le **même réseau Wi‑Fi**.

---

## 2. Comment ça marche selon l’environnement

| Situation | URL API utilisée | Où c’est défini |
|-----------|------------------|------------------|
| **Dev sur émulateur** | `http://localhost:3000/api` | `apps/mobile/.env` → `EXPO_PUBLIC_API_URL` |
| **Dev sur iPhone** (même Wi‑Fi) | `http://<IP_PC>:3000/api` | Même fichier `.env`, tu mets l’IP de ton PC |
| **App en production** (Store) | `https://api.idel-care.fr/api` (ex.) | Build EAS / production : variables d’environnement de **production** |

En **développement**, l’app lit `EXPO_PUBLIC_API_URL` depuis le fichier `.env` de `apps/mobile`. C’est ce que tu utilises tout de suite.

Quand tu mettras l’app **sur les stores** :

- Tu ne utilises plus `localhost` ni l’IP de ton PC.
- L’API sera hébergée en production (ex. OVHcloud) avec une URL du type `https://api.idel-care.fr`.
- Au moment du **build de production** (EAS Build ou autre), tu configures les **variables d’environnement de production** pour que `EXPO_PUBLIC_API_URL` soit cette URL (ex. `https://api.idel-care.fr/api`).
- L’app livrée sur l’App Store / Play Store est construite avec cette valeur, donc elle appellera toujours la bonne API en prod.

En résumé : **une URL en dev** (`.env` avec localhost ou IP PC), **une autre en prod** (configurée au build pour la prod). Le code ne change pas, seul l’environnement (et donc la valeur de `EXPO_PUBLIC_API_URL`) change.
