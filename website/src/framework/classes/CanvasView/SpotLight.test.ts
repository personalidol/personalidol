import * as THREE from "three";

import CameraFrustumBus from "src/framework/classes/CameraFrustumBus";
import CancelToken from "src/framework/classes/CancelToken";
import CanvasViewBag from "src/framework/classes/CanvasViewBag";
import CanvasViewBus from "src/framework/classes/CanvasViewBus";
import LoggerBreadcrumbs from "src/framework/classes/LoggerBreadcrumbs";
import PhysicsWorld from "src/framework/classes/PhysicsWorld";
import Scheduler from "src/framework/classes/Scheduler";
import SpotLight from "src/framework/classes/CanvasView/SpotLight";

import type QuakeWorkerLightSpotlight from "src/framework/types/QuakeWorkerLightSpotlight";

test("is cleanly attached and disposed", async function () {
  const loggerBreadcrumbs = new LoggerBreadcrumbs();
  const cancelToken = new CancelToken(loggerBreadcrumbs);
  const scheduler = new Scheduler(loggerBreadcrumbs);
  const camera = new THREE.PerspectiveCamera();
  const cameraFrustumBus = new CameraFrustumBus(loggerBreadcrumbs, camera);
  const physicsWorld = new PhysicsWorld(loggerBreadcrumbs);
  const canvasViewBus = new CanvasViewBus(loggerBreadcrumbs, cameraFrustumBus, physicsWorld, scheduler);
  const canvasViewBag = new CanvasViewBag(loggerBreadcrumbs, canvasViewBus);
  const group = new THREE.Group();
  const entity: QuakeWorkerLightSpotlight = {
    classname: "light_spotlight",
    color: "white",
    decay: 1.0,
    intensity: 0.3,
    origin: [0, 0, 0],
  };

  const spotLight = new SpotLight(loggerBreadcrumbs, canvasViewBag, group, entity);

  expect(spotLight.getChildren().children).toHaveLength(0);

  await spotLight.attach(cancelToken);

  // light and target
  expect(spotLight.getChildren().children).toHaveLength(2);

  await spotLight.dispose(cancelToken);

  expect(spotLight.getChildren().children).toHaveLength(0);
});