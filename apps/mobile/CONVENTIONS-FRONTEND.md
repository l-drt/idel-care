# Conventions frontend — IDEL Care (mobile)

## Règle principale : composants réutilisables

**Tout élément d’UI doit passer par un composant réutilisable** (boutons, champs, cartes, titres, etc.).

- **Pourquoi :** un changement de design (couleur, taille, bordure, etc.) se fait **à un seul endroit**.
- **Où :** `components/` — un composant par type d’élément (Button, Input, Card, etc.).
- **Usage :** les écrans (`app/`) n’utilisent **que** ces composants, pas directement les primitives (Button Paper, TextInput Paper, etc.) pour tout ce qui est commun.

### À faire

- Boutons → `components/Button.tsx` (variantes : primary, secondary, text)
- Champs de formulaire → `components/Input.tsx` ✓
- Cartes → `components/Card.tsx`
- Textes titres / sous-titres → `components/Text.tsx` ou variantes
- etc.

### À ne pas faire

- Mettre `<Button>` ou `<TextInput>` de React Native Paper **directement** dans les écrans pour un usage standard (couleur, style commun). Passer par les composants de `components/`.

### Exception

- Utilisation directe de Paper (ou autre lib) autorisée **uniquement** pour un cas très spécifique à un écran et qui ne doit pas être réutilisé.

---

**Résumé :** un seul composant par type d’UI → un seul fichier à modifier pour changer le design partout.
