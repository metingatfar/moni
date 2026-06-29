# MONI UI 5.0 Dependency Map

This map outlines structural dependency hierarchies and mount trees in MONI UI 5.0.

## Dependency Tree

```
src/main.tsx
  └── src/App.tsx
        └── src/presentation/ui5/AppShell.tsx
              ├── src/presentation/ui5/providers/ThemeProvider.tsx
              ├── src/presentation/ui5/providers/LayoutProvider.tsx
              ├── src/presentation/ui5/providers/WorkspaceProvider.tsx
              ├── src/presentation/ui5/providers/ChatProvider.tsx
              ├── src/presentation/ui5/layouts/Layouts.tsx
              ├── src/presentation/ui5/components/DesktopPanels.tsx
              │     └── src/core/knowledge/ProviderHealthMonitor.ts
              └── src/presentation/ui5/views/DesktopViews.tsx
                    └── src/core/coordinator/MoniInteractionCoordinator.ts
```

## Component Tree

```
<AppShell>
  <ThemeProvider>
    <LayoutProvider>
      <WorkspaceProvider>
        <ChatProvider>
          <DesktopLayout>
            <Sidebar />
            <Header />
            <HomeView / ChatView />
            <AssistantPanel />
            <BottomDashboard />
            <StatusBar />
          </DesktopLayout>
        </ChatProvider>
      </WorkspaceProvider>
    </LayoutProvider>
  </ThemeProvider>
</AppShell>
```

## Render Tree (Mobile Mode)

```
<AppShell>
  <MobileLayout nav={<Dock />}>
    <MobileHome />
  </MobileLayout>
</AppShell>
```
