import React, { useEffect, useRef, useState } from 'react';
import { MoniPseudoLiveAvatar } from './MoniPseudoLiveAvatar';

export interface MoniLive2DProps {
  status: 'idle' | 'listening' | 'thinking' | 'speaking' | 'error';
  isSpeaking: boolean;
  audioLevel?: number;
  mood?: 'neutral' | 'happy' | 'focused' | 'thinking' | 'alert';
  avatarType?: 'image' | 'svg';
  eyeColor?: string;
  animationsEnabled?: boolean;
  mouthAnimationEnabled?: boolean;
  effectsIntensity?: 'low' | 'medium' | 'high';
}

export const MoniLive2D: React.FC<MoniLive2DProps> = (props) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [modelAvailable, setModelAvailable] = useState<boolean>(false);
  const [live2dLoaded, setLive2dLoaded] = useState<boolean>(false);
  const modelInstanceRef = useRef<any>(null);
  const pixiAppRef = useRef<any>(null);

  // Check if live2d model definition file exists
  useEffect(() => {
    fetch('/live2d/moni/moni.model3.json', { method: 'HEAD' })
      .then((res) => {
        if (res.ok) {
          setModelAvailable(true);
        } else {
          setModelAvailable(false);
        }
      })
      .catch(() => {
        setModelAvailable(false);
      });
  }, []);

  // Dynamically load cubism and pixi libraries if model is available
  useEffect(() => {
    if (!modelAvailable) return;

    let isMounted = true;

    const loadScripts = async () => {
      try {
        // 1. Load Live2D Cubism Core runtime script if not already loaded
        if (!(window as any).Live2DCubismCore) {
          const coreScript = document.createElement('script');
          coreScript.src = 'https://cubism.live2d.com/sdk-web/bin/cubismcore/live2dcubismcore.min.js';
          document.head.appendChild(coreScript);
          await new Promise((r) => (coreScript.onload = r));
        }

        // 2. Load PixiJS
        if (!(window as any).PIXI) {
          const pixiScript = document.createElement('script');
          pixiScript.src = 'https://cdnjs.cloudflare.com/ajax/libs/pixi.js/7.3.2/pixi.min.js';
          document.head.appendChild(pixiScript);
          await new Promise((r) => (pixiScript.onload = r));
        }

        // 3. Load pixi-live2d-display engine extension
        if (!(window as any).PIXI?.live2d) {
          const live2dDisplayScript = document.createElement('script');
          live2dDisplayScript.src = 'https://cdn.jsdelivr.net/npm/pixi-live2d-display/dist/index.min.js';
          document.head.appendChild(live2dDisplayScript);
          await new Promise((r) => (live2dDisplayScript.onload = r));
        }

        if (isMounted) {
          setLive2dLoaded(true);
          console.log('[MONI Live2D] Pixi and Live2D libraries loaded successfully.');
        }
      } catch (err) {
        console.error('[MONI Live2D] Failed to load scripts:', err);
      }
    };

    loadScripts();

    return () => {
      isMounted = false;
    };
  }, [modelAvailable]);

  // Initialize PixiApp and Live2D Model
  useEffect(() => {
    if (!live2dLoaded || !canvasRef.current) return;

    const PIXI = (window as any).PIXI;
    if (!PIXI || !PIXI.live2d) return;

    const app = new PIXI.Application({
      view: canvasRef.current,
      autoStart: true,
      backgroundAlpha: 0,
      resizeTo: containerRef.current || undefined
    });
    pixiAppRef.current = app;

    PIXI.live2d.Live2DModel.from('/live2d/moni/moni.model3.json')
      .then((model: any) => {
        modelInstanceRef.current = model;
        app.stage.addChild(model);

        // Center and scale model based on canvas dimension
        model.anchor.set(0.5, 0.5);
        model.x = app.screen.width / 2;
        model.y = app.screen.height / 2;
        
        const scaleX = app.screen.width / model.width;
        const scaleY = app.screen.height / model.height;
        const scale = Math.min(scaleX, scaleY) * 0.9;
        model.scale.set(scale, scale);

        console.log('[MONI Live2D] Model loaded successfully.');
      })
      .catch((err: any) => {
        console.error('[MONI Live2D] Failed to load model instance:', err);
      });

    return () => {
      if (modelInstanceRef.current) {
        try {
          app.stage.removeChild(modelInstanceRef.current);
          modelInstanceRef.current.destroy();
        } catch (_) {}
        modelInstanceRef.current = null;
      }
      if (app) {
        try {
          app.destroy(true, { children: true, texture: true, baseTexture: true });
        } catch (_) {}
        pixiAppRef.current = null;
      }
    };
  }, [live2dLoaded]);

  // Sync state parameters (Status, Mood, LipSync Volume) into Live2D model params
  useEffect(() => {
    const model = modelInstanceRef.current;
    if (!model) return;

    // Trigger motions based on current status
    if (model.internalModel?.motionManager) {
      const motionManager = model.internalModel.motionManager;
      switch (props.status) {
        case 'listening':
          motionManager.startMotion('listening', 0);
          break;
        case 'thinking':
          motionManager.startMotion('thinking', 0);
          break;
        case 'speaking':
          motionManager.startMotion('speaking', 0);
          break;
        case 'error':
          motionManager.startMotion('error', 0);
          break;
        case 'idle':
        default:
          motionManager.startMotion('idle', 0);
          break;
      }
    }

    // Audio level lip sync hook altyapısı (Cubism 3/4 ParamMouthOpen)
    if (props.status === 'speaking' && props.mouthAnimationEnabled) {
      const volume = props.audioLevel !== undefined ? props.audioLevel : Math.random() * 0.5 + 0.3;
      model.internalModel.coreModel.setParameterValueById('ParamMouthOpen', volume);
    } else {
      model.internalModel.coreModel.setParameterValueById('ParamMouthOpen', 0);
    }
  }, [props.status, props.audioLevel, props.mood, props.mouthAnimationEnabled]);

  // Render Fallback 2D Avatar if Live2D is offline or still loading
  if (!modelAvailable || !live2dLoaded) {
    return <MoniPseudoLiveAvatar {...props} />;
  }

  return (
    <div
      ref={containerRef}
      style={{
        width: '100%',
        height: '100%',
        position: 'relative',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'transparent'
      }}
    >
      <canvas ref={canvasRef} style={{ width: '100%', height: '100%' }} />
    </div>
  );
};
