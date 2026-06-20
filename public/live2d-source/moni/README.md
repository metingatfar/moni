# MONI Live2D Model Hazırlık ve Varlık Kılavuzu

Bu klasör, MONI dijital asistanının 2D görselinden katmanlı bir **Live2D Cubism** avatar modeline geçiş sürecinde kullanılacak referans ve ara çıktı deposudur.

> [!NOTE]
> Antigravity, Live2D kod entegrasyonunu ve runtime render motorunu dinamik olarak yönetir, ancak gerçek Live2D modeli elde etmek için katmanlı bir PSD dosyası ve Live2D Cubism rigging işlemi gereklidir.

---

## 📂 Klasör Yapısı

*   `reference/`: Moni karakter konsept görselleri, eskizleri ve stil referansları.
*   `psd/`: Katmanları ayrıştırılmış `.psd` dosyası konumu.
*   `layers/`: Ayrı ayrı dışa aktarılan PNG katman görsel dosyaları.
*   `textures/`: Live2D Cubism tarafından oluşturulan doku atlasları.
*   `motions/`: Karakterin yapacağı hareket dosyaları (`.motion3.json`).
*   `expressions/`: Karakterin mimik dosyaları (`.exp3.json`).
*   `export/`: Son derlenmiş üretim paketi çıktıları.

---

## 🔍 Referans Klasörü (`reference/`)
*   Bu klasörde Moni’nin referans görselleri bulunur.
*   PSD üretimi için kullanılacak ana karakter görünümü buraya konur.
*   PSD katmanları Live2D Cubism’e uygun hazırlanmalıdır.

---

## 🎨 Katman Listesi (`layers/`)

Katmanlı PSD dosyasında bulunması ve Live2D Cubism'e aktarılması gereken ideal katman listesi:
*   `01_Background`
*   `02_Body`
*   `03_Jacket`
*   `04_Neck`
*   `05_Collar_Light`
*   `06_Head`
*   `07_Face`
*   `08_Hair_Back`
*   `09_Hair_Front`
*   `10_Left_Eyebrow`
*   `11_Right_Eyebrow`
*   `12_Left_Eye_Open`
*   `13_Left_Eye_Closed`
*   `14_Right_Eye_Open`
*   `15_Right_Eye_Closed`
*   `16_Mouth_Closed`
*   `17_Mouth_A`
*   `18_Mouth_E`
*   `19_Mouth_O`
*   `20_Mouth_Smile`
*   `21_Mouth_Talk_1`
*   `22_Mouth_Talk_2`
*   `23_Neck_Light`
*   `24_Face_Glow`

---

## 📦 Beklenen Çıktı Listesi (`export/`)

Rigging işlemi bittikten sonra bu klasörden çıkması ve `public/live2d/moni/` klasörüne kopyalanması gereken dosyalar:
*   `moni.model3.json` (Model parametre ve dosya eşleme dosyası)
*   `moni.moc3` (Model binary dosyası)
*   `textures/` (Doku atlası görselleri)
*   `motions/` (Hareket animasyon dosyaları)
*   `expressions/` (Mimik ve duygu ifadeleri)
