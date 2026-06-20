# React + TypeScript + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Oxc](https://oxc.rs)
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/)

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the ESLint configuration

If you are developing a production application, we recommend updating the configuration to enable type-aware lint rules:

```js
export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      // Other configs...

      // Remove tseslint.configs.recommended and replace with this
      tseslint.configs.recommendedTypeChecked,
      // Alternatively, use this for stricter rules
      tseslint.configs.strictTypeChecked,
      // Optionally, add this for stylistic rules
      tseslint.configs.stylisticTypeChecked,

      // Other configs...
    ],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.node.json', './tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
])
```

You can also install [eslint-plugin-react-x](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-x) and [eslint-plugin-react-dom](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-dom) for React-specific lint rules:

```js
// eslint.config.js
import reactX from 'eslint-plugin-react-x'
import reactDom from 'eslint-plugin-react-dom'

export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      // Other configs...
      // Enable lint rules for React
      reactX.configs['recommended-typescript'],
      // Enable lint rules for React DOM
      reactDom.configs.recommended,
    ],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.node.json', './tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
])
```

---

# MONI Mobil Paketleme Rehberi (Capacitor)

MONI projesi, Capacitor altyapısı entegre edilerek Android ve iOS platformlarında yerel bir mobil uygulama gibi çalıştırılacak şekilde yapılandırılmıştır.

## Mobil Paketleme Altyapısı
*   **Uygulama Adı:** MONI
*   **Paket / Bundle ID:** `com.moni.assistant`
*   **İzinler:** Mikrofon izinleri (`android.permission.RECORD_AUDIO`, `NSMicrophoneUsageDescription`) yapılandırılmıştır.

---

## 🛠️ Derleme ve Eşitleme (Vite + Capacitor Sync)

Herhangi bir kod değişikliğinden sonra web varlıklarını derleyip mobil platform klasörlerine aktarmak için tek bir komut yeterlidir:
```bash
npm run build
```
Bu komut sırasıyla:
1.  Vite derlemesini (`npm run build`) yapar.
2.  Çıktıları platformlara senkronize eder (`npx cap sync`).

---

## 🤖 Android APK / AAB Üretim Adımları

Android Studio ile uygulamanızı yerel cihazda test etmek veya yayın paketi üretmek için:

1.  **Android Studio'yu Açın:**
    ```bash
    npx cap open android
    ```
2.  **Gradle Senkronizasyonunun Tamamlanmasını Bekleyin.**
3.  **Yerel Cihazda Çalıştırma:**
    *   Telefonunuzu USB ile bağlayın (USB Hata Ayıklama modu açık olmalıdır).
    *   Üst menüdeki yeşil **Run** butonuna basarak uygulamayı cihaza kurun.
4.  **Test APK'sı Üretme (Debug APK):**
    *   **Build** > **Build Bundle(s) / APK(s)** > **Build APK(s)** seçeneğini tıklayın.
5.  **Google Play Yayını İçin İmzasız/İmzalı AAB (Android App Bundle) Üretme:**
    *   **Build** > **Generate Signed Bundle / APK...** seçeneğini tıklayın.
    *   **Android App Bundle** seçimini yapın.
    *   Keystore şifrelerinizi girip adımları tamamlayarak `.aab` dosyasını oluşturun.

---

## 🍏 iOS Xcode & iPhone Kurulum Adımları

Mac bilgisayarınızda Xcode kullanarak test ve derleme yapmak için:

1.  **Xcode Projesini Açın:**
    ```bash
    npx cap open ios
    ```
2.  **İmzalama Ayarlarını Yapın (Signing & Capabilities):**
    *   Sol menüden ana `App` projesini seçin.
    *   **Signing & Capabilities** sekmesine geçin.
    *   **Automatically manage signing** kutusunu işaretleyin.
    *   Apple Developer hesabınızı **Team** alanından seçin.
3.  **Gerçek iPhone Cihazına Kurulum:**
    *   iPhone'u Mac'e kablo ile bağlayın ve kilidini açın.
    *   Xcode üst araç çubuğunda hedef cihaz olarak kendi iPhone'unuzu seçin.
    *   Sol üstteki **Play / Run** butonuna basarak uygulamayı telefonunuza yükleyin.

---

## 📦 App Store & Google Play Store Yayını İçin Gereksinimler

Uygulamanızı mağazalarda yayınlamadan önce tamamlamanız gereken görsel ve yasal gereksinimler listesi:

*   **Uygulama İkonu (Icon):**
    *   Android ve iOS için farklı boyutlarda üretilmelidir.
    *   `resources/` klasörü altına ana ikon yerleştirilip `cordova-res` veya `capacitor-assets` aracıyla otomatik oluşturulabilir.
*   **Splash Ekranı (Açılış Görseli):**
    *   Uygulama yüklenirken görünecek dikey açılış görseli.
*   **Gizlilik Politikası (Privacy Policy):**
    *   Uygulamanın mikrofon verisini sadece yerel STT/ses tanıma için kullandığını, üçüncü şahıslarla paylaşmadığını belirten bir web bağlantısı (URL).
*   **Uygulama Açıklaması (Store Description):**
    *   Moni'nin kişisel asistanlık, hafıza yönetimi ve sesli komut yeteneklerini anlatan açıklama metni.
*   **Mağaza Ekran Görüntüleri (Screenshots):**
    *   Uygulamanın içinden alınmış, dashboard ve sesli asistan paneli görselleri.
*   **Mikrofon Kullanım Açıklaması (Hard Permission Purpose String):**
    *   *Önemli (iOS için):* Plist içindeki `NSMicrophoneUsageDescription` açıklaması kullanıcıyı rahatsız etmeyecek, doğrudan mikrofonun sesli komutlar için gerekli olduğunu açıklayacak şekilde yazılmalıdır.

