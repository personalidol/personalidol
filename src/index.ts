import * as THREE from "three";

import BusClock from "src/framework/classes/BusClock";
import CameraFrustumBus from "src/framework/classes/CameraFrustumBus";
import CancelToken from "src/framework/classes/CancelToken";
import CanvasControllerBus from "src/framework/classes/CanvasControllerBus";
import CanvasViewBag from "src/framework/classes/CanvasViewBag";
import CanvasViewBus from "src/framework/classes/CanvasViewBus";
import ExceptionHandler from "src/framework/classes/ExceptionHandler";
import HTMLElementSize from "src/framework/classes/HTMLElementSize";
import HTMLElementSizeObserver from "src/framework/classes/HTMLElementSizeObserver";
import KeyboardState from "src/framework/classes/KeyboardState";
import LoadingManager from "src/framework/classes/LoadingManager";
import LoggerBreadcrumbs from "src/framework/classes/LoggerBreadcrumbs";
import MainLoop from "src/framework/classes/MainLoop";
import PointerState from "src/framework/classes/PointerState";
import QueryBus from "src/framework/classes/QueryBus";
import Scheduler from "src/framework/classes/Scheduler";
import { default as ConsoleLogger } from "src/framework/classes/Logger/Console";
import { default as RootCanvasController } from "src/framework/classes/CanvasController/Root";
import { default as UnexpectedExceptionHandlerFilter } from "src/framework/classes/ExceptionHandlerFilter/Unexpected";

import SchedulerUpdateScenario from "src/framework/enums/SchedulerUpdateScenario";

// import * as serviceWorker from "src/serviceWorker";

const rootElement = document.getElementById("dd-root");

if (!rootElement) {
  throw new Error("Root element not found.");
}

if (!(rootElement instanceof HTMLCanvasElement)) {
  throw new Error("Root element is not a canvas.");
}

const busClock = new BusClock();
const loggerBreadcrumbs = new LoggerBreadcrumbs();
const logger = new ConsoleLogger();
const cancelToken = new CancelToken(loggerBreadcrumbs.add("CancelToken"));
const exceptionHandlerFilter = new UnexpectedExceptionHandlerFilter();
const exceptionHandler = new ExceptionHandler(logger, exceptionHandlerFilter);
const queryBus = new QueryBus(exceptionHandler, loggerBreadcrumbs.add("QueryBus"));
const loadingManager = new LoadingManager(loggerBreadcrumbs.add("LoadingManager"), exceptionHandler);
const threeLoadingManager = new THREE.LoadingManager();

const scheduler = new Scheduler(loggerBreadcrumbs.add("Scheduler"));
const keyboardState = new KeyboardState(loggerBreadcrumbs.add("KeyboardState"));
const mainLoop = MainLoop.getInstance(loggerBreadcrumbs.add("MainLoop"));
const mainLoopControlToken = mainLoop.getControllable().obtainControlToken();

// mainLoop.setMaxAllowedFPS(80);
mainLoop.attachScheduler(scheduler);
mainLoop.start(mainLoopControlToken);

busClock.interval(cancelToken, queryBus.tick);

window.addEventListener("beforeunload", function() {
  cancelToken.cancel(loggerBreadcrumbs.add("beforeunload"));
});

document.addEventListener("visibilitychange", function() {
  if (document.visibilityState === "visible") {
    mainLoop.start(mainLoopControlToken);
  } else {
    mainLoop.stop(mainLoopControlToken);
  }
});

bootstrap(rootElement);

async function bootstrap(sceneCanvas: HTMLCanvasElement) {
  function onWindowResize() {
    sceneCanvas.style.height = `${window.innerHeight}px`;
    sceneCanvas.style.width = `${window.innerWidth}px`;
  }

  const camera = new THREE.PerspectiveCamera();
  const cameraFrustumBus = new CameraFrustumBus(loggerBreadcrumbs.add("CameraFrustumBus"), camera);
  const pointerState = new PointerState(loggerBreadcrumbs.add("PointerState"), sceneCanvas);
  const resizeObserver = new HTMLElementSizeObserver(loggerBreadcrumbs.add("HTMLElementSizeObserver"), sceneCanvas);
  const canvasControllerBus = new CanvasControllerBus(loggerBreadcrumbs, resizeObserver, scheduler);

  canvasControllerBus.observe();
  keyboardState.observe();
  pointerState.observe();
  resizeObserver.observe();

  if (SchedulerUpdateScenario.Always === busClock.useUpdate()) {
    scheduler.onUpdate(busClock.update);
  }
  if (SchedulerUpdateScenario.Always === cameraFrustumBus.useUpdate()) {
    scheduler.onUpdate(cameraFrustumBus.update);
  }

  window.addEventListener("resize", onWindowResize);
  onWindowResize();

  const renderer = new THREE.WebGLRenderer({
    alpha: false,
    antialias: false,
    canvas: sceneCanvas,
  });

  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.BasicShadowMap;

  renderer.setPixelRatio(window.devicePixelRatio);

  const canvasViewBus = new CanvasViewBus(loggerBreadcrumbs.add("CanvasViewBus"), cameraFrustumBus, scheduler);
  const canvasViewBag = new CanvasViewBag(loggerBreadcrumbs.add("CanvasViewBag"), canvasViewBus);

  const canvasController = new RootCanvasController(
    loggerBreadcrumbs.add("RootCanvasController"),
    camera,
    canvasControllerBus,
    canvasViewBag.fork(loggerBreadcrumbs.add("RootCanvasControllert")),
    keyboardState,
    loadingManager,
    logger,
    pointerState,
    queryBus,
    renderer,
    scheduler,
    threeLoadingManager
  );

  await loadingManager.blocking(canvasControllerBus.add(cancelToken, canvasController), "Loading initial game resources");

  canvasController.resize(new HTMLElementSize(sceneCanvas));

  logger.debug(loggerBreadcrumbs.add("attachRenderer"), "Game is ready.");

  // setTimeout(() => {
  //   cancelToken.cancel(loggerBreadcrumbs);
  // }, 100);

  await cancelToken.whenCanceled();

  // prevent some memory leaks
  renderer.dispose();
  renderer.forceContextLoss();
  sceneCanvas.remove();

  await loadingManager.blocking(canvasViewBag.dispose(cancelToken), "Disposing root canvas controller");
  await loadingManager.blocking(canvasControllerBus.delete(cancelToken, canvasController), "Disposing game resources");

  canvasControllerBus.disconnect();
  keyboardState.disconnect();
  pointerState.disconnect();
  resizeObserver.disconnect();
  mainLoop.stop(mainLoopControlToken);

  if (SchedulerUpdateScenario.Always === busClock.useUpdate()) {
    scheduler.offUpdate(busClock.update);
  }

  await logger.debug(loggerBreadcrumbs.add("attachRenderer"), "Game is completely disposed of.");
}
