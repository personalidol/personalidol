import { WebGLRenderer } from "three/src/renderers/WebGLRenderer";

import { Director } from "@personalidol/framework/src/Director";
import { EffectComposer } from "@personalidol/three-modules/src/postprocessing/EffectComposer";
import { LoadingScreenScene } from "@personalidol/personalidol/src/LoadingScreenScene";
import { MainMenuScene } from "@personalidol/personalidol/src/MainMenuScene";
import { Renderer } from "@personalidol/three-renderer/src/Renderer";
import { SceneLoader } from "@personalidol/framework/src/SceneLoader";

import type { Logger } from "loglevel";

import type { EventBus } from "@personalidol/framework/src/EventBus.interface";
import type { MainLoop } from "@personalidol/framework/src/MainLoop.interface";
import type { ServiceManager } from "@personalidol/framework/src/ServiceManager.interface";

export function createScenes(
  devicePixelRatio: number,
  eventBus: EventBus,
  mainLoop: MainLoop,
  serviceManager: ServiceManager,
  canvas: HTMLCanvasElement | OffscreenCanvas,
  dimensionsState: Uint32Array,
  inputState: Int32Array,
  logger: Logger,
  domMessagePort: MessagePort,
  fontPreloaderMessagePort: MessagePort,
  md2MessagePort: MessagePort,
  progressMessagePort: MessagePort,
  quakeMapsMessagePort: MessagePort,
  texturesMessagePort: MessagePort
): void {
  const webGLRenderer = new WebGLRenderer({
    alpha: false,
    antialias: false,
    canvas: canvas,
  });

  // webGLRenderer.gammaOutput = true;
  // webGLRenderer.gammaFactor = 2.2;
  webGLRenderer.setPixelRatio(devicePixelRatio);
  webGLRenderer.shadowMap.enabled = false;
  webGLRenderer.shadowMap.autoUpdate = false;

  const effectComposer = new EffectComposer(webGLRenderer);

  const renderer = Renderer(dimensionsState, effectComposer, webGLRenderer);
  const currentSceneDirector = Director(logger, "Scene");
  const loadingSceneDirector = Director(logger, "LoadingScreen");
  const sceneLoader = SceneLoader(logger, webGLRenderer, currentSceneDirector, loadingSceneDirector);

  const currentSceneDirectorState = currentSceneDirector.state;

  // prettier-ignore
  currentSceneDirector.state.next = MainMenuScene(
    logger,
    effectComposer,
    currentSceneDirectorState,
    eventBus,
    dimensionsState,
    inputState,
    domMessagePort,
    fontPreloaderMessagePort,
    md2MessagePort,
    progressMessagePort,
    quakeMapsMessagePort,
    texturesMessagePort,
  );

  // prettier-ignore
  loadingSceneDirector.state.next = LoadingScreenScene(
    effectComposer,
    dimensionsState,
    domMessagePort,
    progressMessagePort
  );

  serviceManager.services.add(currentSceneDirector);
  serviceManager.services.add(loadingSceneDirector);
  serviceManager.services.add(renderer);
  serviceManager.services.add(sceneLoader);

  mainLoop.updatables.add(serviceManager);
  mainLoop.updatables.add(currentSceneDirector);
  mainLoop.updatables.add(loadingSceneDirector);
  mainLoop.updatables.add(sceneLoader);
  mainLoop.updatables.add(renderer);
}
