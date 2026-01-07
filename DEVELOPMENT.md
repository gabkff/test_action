# Guide de développement

## 🚀 Démarrage rapide

### Installation

```bash
yarn install
```

### Lancer l'application en mode développement

```bash
yarn tauri dev
```

Cela lancera :
1. Le serveur de développement Vite (frontend)
2. L'application Tauri (backend Rust)

## 🔧 Configuration des modes

### Mode iPad (Live)

Dans `.env`:
```env
VITE_APP_MODE=ipad
VITE_USE_MOCK_DATA=true
```

Ce mode :
- ✅ Récupère toujours les données en temps réel
- ✅ Pas de cache local
- ✅ Pas de téléchargement d'assets

### Mode Borne (Kiosk)

Dans `.env`:
```env
VITE_APP_MODE=kiosk
VITE_USE_MOCK_DATA=true
```

Ce mode :
- ✅ Cache les données localement (IndexedDB)
- ✅ Télécharge les assets (images/vidéos) localement
- ✅ Rafraîchissement périodique en arrière-plan
- ✅ Fallback sur le cache en cas d'erreur réseau

## 📦 Architecture du projet

### Services

#### `api.service.ts`
Gère les appels à l'API externe :
- Récupération des données
- Gestion du cache selon le mode
- Mode mock pour le développement

#### `cache.service.ts`
Gère le cache IndexedDB :
- Sauvegarde des métadonnées
- Récupération rapide des données
- Versionning du cache

#### `assets.service.ts`
Gère le téléchargement et le stockage local des assets :
- Téléchargement d'images/vidéos
- Stockage dans le dossier `appData`
- Génération d'URLs locales via Tauri

### Stores (Pinia)

#### `app.store.ts`
Store principal de l'application :
- État des données API
- État de chargement
- Gestion des erreurs
- Getters pour accéder aux pages

### Composants

#### `BlockRenderer.vue`
Composant pivot qui rend dynamiquement les blocs selon leur type :
```vue
<BlockRenderer :block="block" />
```

#### `HeroBlock.vue`
Exemple de composant de bloc. Créez vos propres blocs en suivant ce modèle.

## 🎨 Ajouter un nouveau type de bloc

### 1. Créer le composant

Créez `src/components/blocks/TextBlock.vue` :

```vue
<template>
  <section class="text-block">
    <h2 v-if="content.title">{{ content.title }}</h2>
    <div v-if="content.text" v-html="content.text"></div>
  </section>
</template>

<script setup lang="ts">
import type { BlockContent } from '../../types/api.types';

interface Props {
  content: BlockContent;
}

defineProps<Props>();
</script>

<style scoped>
.text-block {
  padding: 3rem 2rem;
  max-width: 800px;
  margin: 0 auto;
}
</style>
```

### 2. Enregistrer le composant

Dans `src/components/blocks/BlockRenderer.vue` :

```typescript
import HeroBlock from './HeroBlock.vue';
import TextBlock from './TextBlock.vue'; // Nouveau

const blockComponents = {
  hero: HeroBlock,
  text: TextBlock, // Nouveau
};
```

### 3. Ajouter le type TypeScript

Dans `src/types/api.types.ts` :

```typescript
export type BlockType = 'hero' | 'text' | 'image' | 'video' | 'gallery';
```

### 4. Tester avec des données mock

Dans `src/services/mock-data.ts`, ajoutez un bloc de test :

```typescript
blocs: [
  {
    id: 2,
    type: 'text',
    content: {
      title: 'Mon titre',
      text: '<p>Mon contenu HTML</p>',
    },
  },
]
```

## 🖼️ Gestion des assets

### Utiliser des images dans les blocs

```vue
<script setup lang="ts">
import { computed } from 'vue';
import { assetsService } from '../../services/assets.service';

const imageUrl = computed(() => {
  if (!props.content.image) return '';
  return assetsService.getAssetUrl(props.content.image);
});
</script>

<template>
  <img :src="imageUrl" alt="..." />
</template>
```

La méthode `getAssetUrl` :
- En mode **iPad** : retourne l'URL distante
- En mode **Borne** : retourne l'URL locale (si téléchargée)

## 🔄 Système de rafraîchissement

Le rafraîchissement automatique ne fonctionne qu'en **mode borne**.

Configuration dans `.env` :
```env
# Rafraîchir toutes les 5 minutes (300000 ms)
VITE_REFRESH_INTERVAL=300000
```

Le système :
1. Lance un `setInterval` au démarrage
2. Récupère les nouvelles données de l'API
3. Télécharge les nouveaux assets
4. Met à jour le store Pinia

## 🧪 Tests et développement

### Utiliser les données mock

Par défaut, l'application utilise des données mock :

```env
VITE_USE_MOCK_DATA=true
```

Cela permet de développer sans avoir besoin d'une API backend.

### Désactiver les données mock

```env
VITE_USE_MOCK_DATA=false
VITE_API_URL=https://votre-api.com/endpoint
```

## 📱 Build pour différentes plateformes

### Windows (Borne tactile)

```bash
yarn tauri build
```

Génère un `.exe` et un installeur dans `src-tauri/target/release/`.

### iOS/iPadOS

**Prérequis** : macOS avec Xcode

```bash
# Première fois : initialiser
yarn tauri ios init

# Build
yarn tauri ios build
```

## 🐛 Debugging

### Console de développement

En mode dev, ouvrez les DevTools :
- **macOS** : `Cmd + Option + I`
- **Windows/Linux** : `Ctrl + Shift + I`

### Logs Tauri

Les `console.log` dans le frontend apparaissent dans les DevTools.

Les logs Rust apparaissent dans le terminal où vous avez lancé `yarn tauri dev`.

### Inspecter le cache

```javascript
// Dans la console du navigateur
const db = await indexedDB.open('tcn-app-cache');
```

## 🔐 Permissions Tauri

Les permissions sont définies dans `src-tauri/capabilities/`.

Pour ajouter des permissions :

1. Modifier `src-tauri/capabilities/default.json`
2. Ajouter les permissions nécessaires (fs, http, etc.)

## 🎯 Bonnes pratiques

### Performance
- ✅ Utilisez `lazy loading` pour les images
- ✅ Téléchargez les assets en arrière-plan
- ✅ Utilisez le cache IndexedDB pour les métadonnées

### Sécurité
- ✅ Validez toujours les données de l'API
- ✅ Sanitisez le HTML dans les blocs text
- ✅ Utilisez HTTPS pour l'API en production

### UX Tactile
- ✅ Boutons suffisamment grands (min 44x44px)
- ✅ Feedback visuel sur les interactions
- ✅ Pas de hover effects (uniquement tap)
- ✅ Gestes simples et intuitifs

## 📚 Ressources

- [Documentation Tauri](https://tauri.app)
- [Documentation Vue 3](https://vuejs.org)
- [Documentation Pinia](https://pinia.vuejs.org)
- [Documentation TypeScript](https://www.typescriptlang.org)

## 🆘 Problèmes courants

### Le build Rust échoue

Installez les dépendances Rust/Tauri selon votre OS :
- [Guide Linux](https://tauri.app/start/prerequisites/#linux)
- [Guide Windows](https://tauri.app/start/prerequisites/#windows)
- [Guide macOS](https://tauri.app/start/prerequisites/#macos)

### Les assets ne se téléchargent pas

1. Vérifiez `VITE_APP_MODE=kiosk`
2. Vérifiez les permissions dans `src-tauri/capabilities/`
3. Consultez les logs dans la console

### L'application ne démarre pas

1. Vérifiez que les dépendances sont installées : `yarn install`
2. Vérifiez le fichier `.env`
3. Essayez de supprimer `node_modules` et `yarn.lock`, puis réinstallez
