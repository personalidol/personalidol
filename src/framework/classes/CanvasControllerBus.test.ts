import * as THREE from "three";

import CameraFrustumBus from "src/framework/classes/CameraFrustumBus";
import CancelToken from "src/framework/classes/CancelToken";
import CanvasController from "src/framework/classes/CanvasController";
import CanvasControllerBus from "src/framework/classes/CanvasControllerBus";
import CanvasViewBag from "src/framework/classes/CanvasViewBag";
import CanvasViewBus from "src/framework/classes/CanvasViewBus";
import HTMLElementSizeObserver from "src/framework/classes/HTMLElementSizeObserver";
import LoggerBreadcrumbs from "src/framework/classes/LoggerBreadcrumbs";
import Scheduler from "src/framework/classes/Scheduler";
import { default as CanvasControllerException } from "src/framework/classes/Exception/CanvasController";

import SchedulerUpdateScenario from "src/framework/enums/SchedulerUpdateScenario";

import { default as ICanvasViewBag } from "src/framework/interfaces/CanvasViewBag";

class FooCanvasController extends CanvasController {
  readonly useCallbacks: SchedulerUpdateScenario;

  constructor(canvasViewBag: ICanvasViewBag, useCallbacks: SchedulerUpdateScenario) {
    super(canvasViewBag);

    this.useCallbacks = useCallbacks;
  }

  useBegin(): SchedulerUpdateScenario {
    return this.useCallbacks;
  }

  useDraw(): SchedulerUpdateScenario {
    return this.useCallbacks;
  }

  useEnd(): SchedulerUpdateScenario {
    return this.useCallbacks;
  }

  useUpdate(): SchedulerUpdateScenario {
    return this.useCallbacks;
  }
}

class ImproperAttachCanvasController extends CanvasController {
  async attach(cancelToken: CancelToken): Promise<void> {}
}

class ImproperDisposeCanvasController extends CanvasController {
  async dispose(cancelToken: CancelToken): Promise<void> {}
}

test("cannot attach the same controller more than once", async function() {
  const loggerBreadcrumbs = new LoggerBreadcrumbs();
  const cancelToken = new CancelToken(loggerBreadcrumbs);
  const scheduler = new Scheduler(loggerBreadcrumbs);
  const htmlElement = document.createElement("div");
  const htmlElementResizeObserver = new HTMLElementSizeObserver(loggerBreadcrumbs, htmlElement);
  const canvasControllerBus = new CanvasControllerBus(loggerBreadcrumbs, htmlElementResizeObserver, scheduler);
  const camera = new THREE.PerspectiveCamera();
  const cameraFrustumBus = new CameraFrustumBus(loggerBreadcrumbs, camera);
  const canvasViewBus = new CanvasViewBus(loggerBreadcrumbs, cameraFrustumBus, scheduler);
  const canvasViewBag = new CanvasViewBag(loggerBreadcrumbs, canvasViewBus);

  const canvasController = new FooCanvasController(canvasViewBag, SchedulerUpdateScenario.Always);

  await canvasControllerBus.add(cancelToken, canvasController);

  return expect(canvasControllerBus.add(cancelToken, canvasController)).rejects.toThrow(CanvasControllerException);
});

test("cannot detach the same controller more than once", async function() {
  const loggerBreadcrumbs = new LoggerBreadcrumbs();
  const cancelToken = new CancelToken(loggerBreadcrumbs);
  const scheduler = new Scheduler(loggerBreadcrumbs);
  const htmlElement = document.createElement("div");
  const htmlElementResizeObserver = new HTMLElementSizeObserver(loggerBreadcrumbs, htmlElement);
  const canvasControllerBus = new CanvasControllerBus(loggerBreadcrumbs, htmlElementResizeObserver, scheduler);
  const camera = new THREE.PerspectiveCamera();
  const cameraFrustumBus = new CameraFrustumBus(loggerBreadcrumbs, camera);
  const canvasViewBus = new CanvasViewBus(loggerBreadcrumbs, cameraFrustumBus, scheduler);
  const canvasViewBag = new CanvasViewBag(loggerBreadcrumbs, canvasViewBus);

  const canvasController = new FooCanvasController(canvasViewBag, SchedulerUpdateScenario.Never);

  await canvasControllerBus.add(cancelToken, canvasController);
  await canvasControllerBus.delete(cancelToken, canvasController);

  return expect(canvasControllerBus.delete(cancelToken, canvasController)).rejects.toThrow(CanvasControllerException);
});

test("fails when controller attach is improperly implemented", async function() {
  const loggerBreadcrumbs = new LoggerBreadcrumbs();
  const cancelToken = new CancelToken(loggerBreadcrumbs);
  const scheduler = new Scheduler(loggerBreadcrumbs);
  const htmlElement = document.createElement("div");
  const htmlElementResizeObserver = new HTMLElementSizeObserver(loggerBreadcrumbs, htmlElement);
  const canvasControllerBus = new CanvasControllerBus(loggerBreadcrumbs, htmlElementResizeObserver, scheduler);
  const camera = new THREE.PerspectiveCamera();
  const cameraFrustumBus = new CameraFrustumBus(loggerBreadcrumbs, camera);
  const canvasViewBus = new CanvasViewBus(loggerBreadcrumbs, cameraFrustumBus, scheduler);
  const canvasViewBag = new CanvasViewBag(loggerBreadcrumbs, canvasViewBus);

  const canvasController = new ImproperAttachCanvasController(canvasViewBag);

  return expect(canvasControllerBus.add(cancelToken, canvasController)).rejects.toThrow(CanvasControllerException);
});

test("fails when controller dispose is improperly implemented", async function() {
  const loggerBreadcrumbs = new LoggerBreadcrumbs();
  const cancelToken = new CancelToken(loggerBreadcrumbs);
  const scheduler = new Scheduler(loggerBreadcrumbs);
  const htmlElement = document.createElement("div");
  const htmlElementResizeObserver = new HTMLElementSizeObserver(loggerBreadcrumbs, htmlElement);
  const canvasControllerBus = new CanvasControllerBus(loggerBreadcrumbs, htmlElementResizeObserver, scheduler);
  const camera = new THREE.PerspectiveCamera();
  const cameraFrustumBus = new CameraFrustumBus(loggerBreadcrumbs, camera);
  const canvasViewBus = new CanvasViewBus(loggerBreadcrumbs, cameraFrustumBus, scheduler);
  const canvasViewBag = new CanvasViewBag(loggerBreadcrumbs, canvasViewBus);

  const canvasController = new ImproperDisposeCanvasController(canvasViewBag);

  await canvasControllerBus.add(cancelToken, canvasController);

  return expect(canvasControllerBus.delete(cancelToken, canvasController)).rejects.toThrow(CanvasControllerException);
});

test("properly attaches and detaches canvas controllers", async function() {
  const loggerBreadcrumbs = new LoggerBreadcrumbs();
  const cancelToken = new CancelToken(loggerBreadcrumbs);
  const scheduler = new Scheduler(loggerBreadcrumbs);
  const htmlElement = document.createElement("div");
  const htmlElementResizeObserver = new HTMLElementSizeObserver(loggerBreadcrumbs, htmlElement);
  const canvasControllerBus = new CanvasControllerBus(loggerBreadcrumbs, htmlElementResizeObserver, scheduler);
  const camera = new THREE.PerspectiveCamera();
  const cameraFrustumBus = new CameraFrustumBus(loggerBreadcrumbs, camera);
  const canvasViewBus = new CanvasViewBus(loggerBreadcrumbs, cameraFrustumBus, scheduler);
  const canvasViewBag = new CanvasViewBag(loggerBreadcrumbs, canvasViewBus);

  const canvasController = new FooCanvasController(canvasViewBag, SchedulerUpdateScenario.Always);

  expect(canvasController.isAttached()).toBe(false);
  expect(canvasController.isDisposed()).toBe(false);

  await canvasControllerBus.add(cancelToken, canvasController);

  expect(canvasController.isAttached()).toBe(true);
  expect(canvasController.isDisposed()).toBe(false);

  await canvasControllerBus.delete(cancelToken, canvasController);

  expect(canvasController.isAttached()).toBe(false);
  expect(canvasController.isDisposed()).toBe(true);
});
