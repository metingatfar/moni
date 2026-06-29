# MONI 2.0 — Avatar Identity Report (Phase 1)

## 1. Introduction
This report documents the implementation of the **MONI 2.0 Avatar Intelligence Engine (Phase 1)**. MONI has transitioned from a generic conversational indicator (Orb) to a stable digital identity using a unified female face portrait.

---

## 2. Avatar Asset & Component Setup
- **Digital Portrait:** Copied the approved visual asset `public/avatar_woman.png` to `public/moni_avatar.png` as MONI's official face.
- **Component file ([MoniAvatar.tsx](file:///c:/Users/user/Desktop/moni/src/presentation/ui5/components/MoniAvatar.tsx)):** Encapsulates the visual rendering and states using responsive styling layers and CSS-only triggers.

---

## 3. Implemented State Animations & Filters
- **IDLE:** Gentle scaling breathing (`avatar-breathe` keyframe) and two independent blinking lids overlays positioned precisely over the eyes area that flash opaque every 5 seconds (`avatar-blink`).
- **LISTENING:** Concentric green glowing outer ripple circles (`outer-ripple` keyframe) and a pulsating neon green/emerald neck LED positioned on the collar/neck area.
- **THINKING:** Head slightly tilted (`transform: rotate(2.5deg)`) with a morphing background blue/purple glow filter.
- **SPEAKING:** Active lip-sync overlay containing five animated vertical EQ bars (`speak-bar-bounce`) positioned dynamically over the mouth area.
- **HAPPY / SUCCESS:** Warm rose-pink brightness filters and a head-nod bounce gesture.
- **ERROR:** Dark sepia-indigo hue filters.
- **OFFLINE:** Grayscale styling and a prominent `"Bağlantı bekleniyor..."` overlay badge.

---

## 4. Female Voice Tuning
Updated [VoiceService.ts](file:///c:/Users/user/Desktop/moni/src/data/services/VoiceService.ts):
- **Preference Array:** Specifically searches local SpeechSynthesis voices for Microsoft Selin, Microsoft Zeynep, Microsoft Emel, or Google Türkçe female engines. Bypasses male voices (e.g. Tolga) unless no other engine is present.
- **Speech Style Config:**
  - `utterance.rate = 0.95`
  - `utterance.pitch = 1.08`
  - `utterance.volume = 1.0`

---

## 5. UI Layout Placement Integrations
1. **Desktop Right Panel:** A large `MoniAvatar` (size 150px) is displayed at the top header of `AssistantPanel` inside [DesktopPanels.tsx](file:///c:/Users/user/Desktop/moni/src/presentation/ui5/components/DesktopPanels.tsx).
2. **Left Sidebar:** The mini `Orb` inside the left sidebar is replaced with a `MoniAvatar` (size 36px/56px) for unified branding.
3. **Empty Chat Welcome View:** Placed a large `MoniAvatar` (size 120px) at the center of the welcome layout in [DesktopViews.tsx](file:///c:/Users/user/Desktop/moni/src/presentation/ui5/views/DesktopViews.tsx).
4. **Mobile Screens:** Replaced the Orb with `MoniAvatar` on the mobile home dashboard (size 130px) and voice screen (size 160px) in [MobileViews.tsx](file:///c:/Users/user/Desktop/moni/src/presentation/ui5/views/MobileViews.tsx).
5. **Settings Panels:** Embedded a dedicated digital identity info block showcasing MONI's profile and avatar in settings for both desktop and mobile layouts.
