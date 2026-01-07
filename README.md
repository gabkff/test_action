# Prototype Tauri - Application Borne Tactile / iPad

Application multi-plateforme développée avec Tauri v2 et Vue 3, conçue pour fonctionner sur des bornes tactiles Windows et des iPads.

## 🎯 Fonctionnalités

- **Architecture dynamique** : Pages construites dynamiquement via des blocs (page builder)
- **Deux modes de fonctionnement** :
  - **Mode Borne (kiosk)** : Cache local avec rafraîchissement périodique
  - **Mode iPad** : Données toujours live depuis l'API
- **Gestion des assets** : Téléchargement et stockage local des images/vidéos pour mode borne
- **Système de cache** : IndexedDB pour métadonnées + système de fichiers Tauri pour assets
- **Rafraîchissement automatique** : Mise à jour périodique en mode borne

## 🏗️ Architecture

```
src/
├── components/
│   ├── blocks/         # Composants de blocs (Hero, Text, Image, etc.)
│   └── layout/         # Composants de mise en page
├── config/             # Configuration de l'application
├── router/             # Configuration Vue Router
├── services/           # Services (API, Cache, Assets)
├── stores/             # Stores Pinia
├── types/              # Types TypeScript
├── utils/              # Utilitaires
└── views/              # Vues principales
```

## 🚀 Installation

### Prérequis

- Node.js 18+
- Rust 1.70+
- Yarn

Pour Windows (bornes tactiles) :
- Visual Studio Build Tools

Pour iOS/iPadOS :
- macOS avec Xcode
- Apple Developer Account (pour side-loading)

### Installation des dépendances

```bash
yarn install
```

## ⚙️ Configuration

Créez un fichier `.env` à la racine du projet :

```env
# Mode de l'application : kiosk (borne) ou ipad
VITE_APP_MODE=ipad

# URL de l'API
VITE_API_URL=http://localhost:3000/api

# Intervalle de rafraîchissement pour les bornes (ms)
VITE_REFRESH_INTERVAL=300000
```

## 🖥️ Développement

### Mode développement

```bash
yarn tauri dev
```

### Build pour production

```bash
yarn tauri build
```

### Build pour des plateformes spécifiques

**Windows (borne tactile) :**
```bash
yarn tauri build --target x86_64-pc-windows-msvc
```

**iOS/iPadOS :**
```bash
# Initialiser le projet iOS (première fois)
yarn tauri ios init

# Développement iOS
yarn tauri ios dev

# Build iOS
yarn tauri ios build
```

## 📱 Déploiement iPad (sans App Store)

Pour déployer sur iPad sans passer par l'App Store, vous pouvez utiliser :

1. **TestFlight** : Pour les tests internes
2. **Enterprise Distribution** : Avec un compte Apple Developer Enterprise
3. **Ad-Hoc Distribution** : Pour un nombre limité d'appareils (max 100)
4. **MDM (Mobile Device Management)** : Pour déploiement en entreprise

## 🎨 Structure des données API

L'application attend une structure JSON de ce format :

```json
{
  "meta": {
    "timestamp": 1763491548000,
    "execution_time": "Time: 00:00.162, Memory: 8.00 MB",
    "site": {
      "id": 1,
      "name": "FR",
      "handle": "fr_CA",
      "language": "fr-CA",
      "primary": true
    }
  },
  "data": {
    "page-slug": {
      "id": 11130,
      "url": null,
      "title": "Page Title",
      "slug": "page-slug",
      "dates": {
        "created": 1763491506000,
        "updated": 1763491515000,
        "posted": 1763491500000
      },
      "blocs": [
        {
          "id": 1,
          "type": "hero",
          "content": {
            "title": "Titre du bloc",
            "description": "Description",
            "image": {
              "src": "https://example.com/image.jpg",
              "alt": "Alt text"
            },
            "cta": {
              "label": "Bouton",
              "href": "https://example.com"
            }
          }
        }
      ],
      "translations": []
    }
  }
}
```

## 🧩 Ajouter un nouveau type de bloc

1. Créez le composant dans `src/components/blocks/` :

```vue
<!-- src/components/blocks/TextBlock.vue -->
<template>
  <div class="text-block">
    <h2 v-if="content.title">{{ content.title }}</h2>
    <p v-if="content.text">{{ content.text }}</p>
  </div>
</template>

<script setup lang="ts">
import type { BlockContent } from '../../types/api.types';

interface Props {
  content: BlockContent;
}

defineProps<Props>();
</script>
```

2. Enregistrez-le dans `BlockRenderer.vue` :

```typescript
const blockComponents = {
  hero: HeroBlock,
  text: TextBlock, // Nouveau bloc
};
```

3. Ajoutez le type dans `src/types/api.types.ts` :

```typescript
export type BlockType = 'hero' | 'text' | 'image' | 'video';
```

## 🔧 Troubleshooting

### Les assets ne se téléchargent pas

- Vérifiez que `VITE_APP_MODE=kiosk` dans votre `.env`
- Vérifiez les permissions Tauri dans `src-tauri/capabilities/`
- Consultez les logs de la console

### Erreur lors du build iOS

- Assurez-vous d'avoir Xcode installé
- Vérifiez votre certificat de développement
- Consultez la documentation Tauri pour iOS

## 📚 Technologies utilisées

- **Tauri v2** : Framework pour applications multi-plateformes
- **Vue 3** : Framework JavaScript réactif
- **TypeScript** : Typage statique
- **Pinia** : Gestion d'état
- **Vue Router** : Routing
- **Vite** : Build tool
- **IndexedDB** : Cache local pour métadonnées
- **Tauri FS** : Système de fichiers pour assets

## 📄 Licence

MIT

## 👥 Contribution

Ce projet est un prototype. Pour toute question ou suggestion, veuillez créer une issue.
