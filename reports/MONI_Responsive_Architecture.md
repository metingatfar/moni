# MONI 2.0 Responsive Grid & Viewport Engine

## 1. Implementation
Viewport width is monitored using a React resize listener:
```typescript
const [isMobile, setIsMobile] = useState(() => window.innerWidth < 768);
```

## 2. Layout Grid Adaptation
* **Desktop:** CSS Flex/Grid layout with fixed left sidebar and right side utility drawer.
* **Laptop:** Resizes drawers or collapses left sidebar automatically.
* **Mobile:** Discards sidebars and renders the native bottom navigation bar.
