# MONI UI 5.0 Animation System

This document explains the transition tokens and animation curves used to maintain clean animations:

## Keyframe Definitions

1. **Orb Pulse (`orb-pulse`)**:
   Pulsates scale values from `1.0` to `1.08` accompanied by glowing box shadows during speaking.

2. **Fluid Wave (`orb-wave`)**:
   Varies standard border-radius properties to present fluid shape shifts when the client is listening.

3. **Thinking Spin (`orb-rotate`)**:
   Applies smooth continuous rotations to symbolize back-end processing activity.

## Scale Transitions

All buttons and sidebar navigators implement:
```css
transition: transform 0.15s cubic-bezier(0.175, 0.885, 0.32, 1.275);
```
Preventing visual stuttering when selecting controls.
