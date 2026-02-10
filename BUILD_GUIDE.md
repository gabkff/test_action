# Guide de Build - Windows & iOS

Ce guide vous accompagne pour compiler et déployer l'application sur Windows (bornes tactiles) et iOS (iPads).

## 📋 Table des matières

- [Build Windows](#build-windows)
- [Build iOS](#build-ios)
- [Configuration des modes](#configuration-des-modes)
- [Troubleshooting](#troubleshooting)

---

## 🪟 Build Windows

### Prérequis

1. **Rust** (déjà installé)
2. **Visual Studio Build Tools** (pour Windows)
   - Téléchargez : https://visualstudio.microsoft.com/downloads/
   - Installez "Desktop development with C++"

### Étapes de build

#### 1. Vérifier la configuration

Assurez-vous que `.env` est configuré pour le mode borne :

```env
VITE_APP_MODE=kiosk
VITE_USE_MOCK_DATA=false
VITE_API_URL=https://votre-api-production.com/api
```

#### 2. Build de développement

Pour tester localement :

```bash
yarn tauri build --debug
```

Fichiers générés dans `src-tauri/target/debug/`

#### 3. Build de production

```bash
yarn tauri build
```

#### 4. Fichiers générés

Après le build, vous trouverez dans `src-tauri/target/release/bundle/` :

- **MSI Installer** : `src-tauri/target/release/bundle/msi/Proto Tauri_0.1.0_x64_en-US.msi`
- **NSIS Installer** : `src-tauri/target/release/bundle/nsis/Proto Tauri_0.1.0_x64-setup.exe`
- **Exécutable** : `src-tauri/target/release/tcn-app.exe`

#### 5. Installation sur les bornes

**Option A : MSI (recommandé pour entreprise)**
```powershell
msiexec /i "Proto Tauri_0.1.0_x64_en-US.msi" /qn
```

**Option B : NSIS**
- Double-cliquez sur le `.exe`
- Suivez l'assistant d'installation

**Option C : Exécutable portable**
- Copiez `tcn-app.exe` sur la borne
- Créez un raccourci au démarrage Windows

### Configuration du mode kiosk Windows

Pour un mode plein écran au démarrage :

**1. Modifier `tauri.conf.json` :**

```json
{
  "app": {
    "windows": [
      {
        "title": "Proto Tauri",
        "width": 1920,
        "height": 1080,
        "fullscreen": true,
        "decorations": false,
        "resizable": false
      }
    ]
  }
}
```

**2. Lancement automatique au démarrage Windows :**

Créez un fichier `.bat` :

```batch
@echo off
start "" "C:\Program Files\Proto Tauri\Proto Tauri.exe"
```

Placez-le dans : `C:\ProgramData\Microsoft\Windows\Start Menu\Programs\StartUp`

---

## 📱 Build iOS

### Prérequis

⚠️ **Le build iOS nécessite macOS avec Xcode**

1. **macOS** (Catalina ou supérieur)
2. **Xcode 14+**
   ```bash
   xcode-select --install
   ```
3. **Apple Developer Account**
   - Compte gratuit : pour tester sur vos propres appareils (max 3)
   - Compte payant ($99/an) : pour distribution Ad-Hoc ou Enterprise

4. **Rust targets iOS**
   ```bash
   rustup target add aarch64-apple-ios
   rustup target add x86_64-apple-ios
   rustup target add aarch64-apple-ios-sim
   ```

### Étapes de build

#### 1. Initialiser le projet iOS (première fois uniquement)

```bash
yarn tauri ios init
```

Cette commande :
- Crée le dossier `src-tauri/gen/apple/`
- Configure le projet Xcode
- Génère les fichiers de configuration iOS

#### 2. Configuration de l'identifiant

Modifiez `src-tauri/tauri.conf.json` :

```json
{
  "identifier": "com.votreentreprise.prototauri"
}
```

⚠️ **Important** : Utilisez un identifiant unique (reverse domain notation)

#### 3. Build pour simulateur iOS (test)

```bash
yarn tauri ios dev
```

Cela va :
- Compiler l'application
- Lancer le simulateur iOS
- Installer et démarrer l'app

#### 4. Build pour iPad physique

**A. Connectez votre iPad via USB**

**B. Ouvrez le projet dans Xcode :**

```bash
open src-tauri/gen/apple/tcn-app.xcodeproj
```

**C. Dans Xcode :**

1. Sélectionnez votre iPad dans la liste des appareils
2. Allez dans "Signing & Capabilities"
3. Sélectionnez votre "Team" (compte Apple Developer)
4. Xcode va automatiquement créer un profil de provisioning

**D. Build et installation :**

```bash
yarn tauri ios build
```

Ou directement dans Xcode : `Product > Run` (⌘R)

#### 5. Build pour distribution

**Distribution Ad-Hoc (sans App Store) :**

1. **Dans Xcode, allez dans "Product > Archive"**

2. **Une fois l'archive créée, cliquez sur "Distribute App"**

3. **Choisissez "Ad Hoc"**

4. **Sélectionnez votre méthode de distribution :**
   - **Development** : Pour vos propres appareils (max 3)
   - **Ad Hoc** : Pour max 100 appareils enregistrés
   - **Enterprise** : Distribution illimitée (nécessite compte Enterprise)

5. **Exportez l'IPA**

6. **Installation sur les iPads :**

   **Option A : Xcode Devices**
   - Window > Devices and Simulators
   - Sélectionnez l'iPad
   - Glissez-déposez le fichier .ipa

   **Option B : Apple Configurator**
   - Téléchargez Apple Configurator 2
   - Connectez les iPads
   - Déployez l'application

   **Option C : MDM (Mobile Device Management)**
   - Pour déploiement à grande échelle
   - Utilisez une solution MDM (Jamf, Intune, etc.)

### Configuration iOS spécifique

**Mode plein écran sur iPad :**

Éditez `src-tauri/gen/apple/tcn-app_iOS/Info.plist` :

```xml
<key>UIStatusBarHidden</key>
<true/>
<key>UIViewControllerBasedStatusBarAppearance</key>
<false/>
<key>UIRequiresFullScreen</key>
<true/>
<key>UISupportedInterfaceOrientations</key>
<array>
    <string>UIInterfaceOrientationLandscapeLeft</string>
    <string>UIInterfaceOrientationLandscapeRight</string>
</array>
```

---

## ⚙️ Configuration des modes

### Mode Borne (Windows)

`.env` :
```env
VITE_APP_MODE=kiosk
VITE_USE_MOCK_DATA=false
VITE_API_URL=https://api-production.com
VITE_REFRESH_INTERVAL=300000
VITE_FORCE_RETOUR=300000
```

Fonctionnalités :
- ✅ Cache local (IndexedDB)
- ✅ Assets téléchargés localement
- ✅ Rafraîchissement automatique toutes les 5 min
- ✅ Retour à la home après inactivité (délai configurable via `VITE_FORCE_RETOUR` / `forceRetour`)
- ✅ Fonctionne hors ligne

### Mode iPad

`.env` :
```env
VITE_APP_MODE=ipad
VITE_USE_MOCK_DATA=false
VITE_API_URL=https://api-production.com
```

Fonctionnalités :
- ✅ Toujours en ligne
- ❌ Pas de cache local
- ✅ Données en temps réel

### Fichier `app-config.json` (mode kiosk)

En mode borne (exe Tauri), la configuration peut être surchargée au runtime par un fichier **`app-config.json`** à la racine du projet, bundlé à côté de `site-config.md`. Toutes les clés sont optionnelles ; les valeurs absentes restent celles du `.env` / build.

Exemple (voir `app-config.example.json`) :
```json
{
  "apiUrl": "https://api-production.com/api",
  "refreshInterval": 300000,
  "apiSite": "votre-code-site",
  "apiKey": "votre-clé-api",
  "useMockData": false,
  "defaultLocale": "fr",
  "googleMapKey": "",
  "googleMapId": "",
  "apiAuthUser": "",
  "apiAuthPass": "",
  "isDev": false
}
```

Toutes les clés sont optionnelles. Correspondance avec le `.env` :

| Clé app-config     | Variable .env           | Description |
|--------------------|-------------------------|-------------|
| apiUrl             | VITE_API_URL            | URL de base de l’API |
| refreshInterval    | VITE_REFRESH_INTERVAL   | Intervalle de rafraîchissement (ms) |
| forceRetour        | VITE_FORCE_RETOUR       | Délai d'inactivité avant retour à la home (ms) |
| apiSite            | site-config.md / VITE_API_SITE | Code site (prioritaire sur site-config si présent) |
| apiKey             | VITE_API_KEY            | Clé API |
| useMockData        | VITE_USE_MOCK_DATA      | `true` = données mock |
| defaultLocale      | VITE_DEFAULT_LOCALE     | Locale par défaut (ex. `fr`) |
| googleMapKey       | VITE_GOOGLE_MAP_KEY     | Clé Google Maps JavaScript API |
| googleMapId        | VITE_GOOGLE_MAP_ID      | ID de carte Google (Map ID) |
| apiAuthUser        | VITE_API_AUTH_USER      | Utilisateur HTTP Basic (dev) |
| apiAuthPass        | VITE_API_AUTH_PASS      | Mot de passe HTTP Basic (dev) |
| isDev              | VITE_IS_DEV             | `true` = active l’auth Basic si user/pass présents |

---

## 🔧 Troubleshooting

### Windows

#### Le build échoue avec une erreur WebView2

**Solution :**
```bash
# Installez WebView2 Runtime
winget install Microsoft.EdgeWebView2Runtime
```

#### L'application ne démarre pas

**Vérifiez :**
1. WebView2 est installé
2. L'antivirus n'a pas bloqué l'exe
3. Les logs dans `%APPDATA%\com.proto.tauri\logs`

### iOS

#### "No provisioning profiles found"

**Solution :**
1. Ouvrez Xcode
2. Preferences > Accounts
3. Ajoutez votre compte Apple Developer
4. Téléchargez les profils

#### "Untrusted Developer"

Sur l'iPad :
1. Settings > General > VPN & Device Management
2. Trouvez votre profil de développeur
3. Tapez "Trust"

#### L'app crash au lancement

**Vérifiez :**
1. Les permissions dans `Info.plist`
2. Les logs dans Xcode : Window > Devices and Simulators > View Device Logs

### Général

#### Les variables d'environnement ne sont pas prises en compte

**Solution :**
```bash
# Supprimez le cache de build
rm -rf src-tauri/target
rm -rf dist
yarn tauri build
```

#### Les assets ne se téléchargent pas

**Vérifiez :**
1. `VITE_APP_MODE=kiosk`
2. Les permissions dans `src-tauri/capabilities/default.json`
3. La connexion internet pour le premier lancement

---

## 📦 Scripts npm utiles

Ajoutez dans `package.json` :

```json
{
  "scripts": {
    "build:windows": "yarn tauri build --target x86_64-pc-windows-msvc",
    "build:ios": "yarn tauri ios build",
    "build:all": "yarn build:windows && yarn build:ios",
    "dev:ios": "yarn tauri ios dev",
    "init:ios": "yarn tauri ios init"
  }
}
```

---

## 📋 Checklist de déploiement

### Avant le build

- [ ] Vérifier la version dans `package.json` et `tauri.conf.json`
- [ ] Configurer les variables d'environnement (`.env`)
- [ ] Tester l'application en mode dev
- [ ] Vérifier que les données de l'API sont correctes

### Windows

- [ ] Build l'application
- [ ] Tester l'installeur sur une machine test
- [ ] Vérifier le mode plein écran
- [ ] Tester le cache et les assets
- [ ] Configurer le lancement automatique

### iOS

- [ ] Créer l'archive dans Xcode
- [ ] Exporter l'IPA
- [ ] Tester sur un iPad physique
- [ ] Vérifier les permissions
- [ ] Déployer sur les iPads de production

---

## 🔗 Ressources

- [Documentation Tauri](https://tauri.app/v2/guides/)
- [Tauri iOS Guide](https://tauri.app/v2/guides/building/ios/)
- [Apple Developer](https://developer.apple.com/)
- [TestFlight](https://developer.apple.com/testflight/)

---

## 📝 Notes importantes

1. **Signatures de code** : Sur macOS/iOS, les applications doivent être signées
2. **WebView2** : Sur Windows, WebView2 est requis (inclus dans Windows 11, optionnel sur Windows 10)
3. **Mises à jour** : Pour les mises à jour, utilisez Tauri Updater ou redéployez manuellement
4. **Sécurité** : Ne commitez jamais les fichiers `.env` avec des clés API de production

---

Bonne chance avec vos builds ! 🚀
