// @flow

import * as THREE from "three";

import CanvasView from "../CanvasView";
import JSONRPCClient from "../JSONRPCClient";
import { default as AmbientLightView } from "./AmbientLight";
import { default as AmbientSoundView } from "./AmbientSound";
import { default as FBXModelView } from "./FBXModel";
import { default as HemisphereLightView } from "./HemisphereLight";
import { default as MD2CharacterView } from "./MD2Character";
import { default as ParticlesView } from "./Particles";
import { default as PointLightView } from "./PointLight";
import { default as QuakeBrushView } from "./QuakeBrush";
import { default as QuakeMapException } from "../Exception/QuakeMap";

// those are a few hacks, but in the end it's possible to load web workers
// with create-react-app without ejecting
/* eslint-disable import/no-webpack-loader-syntax */
// $FlowFixMe
import { default as QuakeMapWorker } from "../../../workers/loader?name=QuakeMapWorker!../../../workers/exports/QuakeMap";
/* eslint-enable import/no-webpack-loader-syntax */

import type { AudioListener, AudioLoader, Group, LoadingManager as THREELoadingManager, Scene } from "three";

import type { CancelToken } from "../../interfaces/CancelToken";
import type { CanvasViewBag } from "../../interfaces/CanvasViewBag";
import type { LoadingManager } from "../../interfaces/LoadingManager";
import type { Logger } from "../../interfaces/Logger";
import type { LoggerBreadcrumbs } from "../../interfaces/LoggerBreadcrumbs";
import type { QueryBus } from "../../interfaces/QueryBus";

export default class QuakeMap extends CanvasView {
  +audioListener: AudioListener;
  +audioLoader: AudioLoader;
  +group: Group;
  +loadingManager: LoadingManager;
  +logger: Logger;
  +loggerBreadcrumbs: LoggerBreadcrumbs;
  +queryBus: QueryBus;
  +scene: Scene;
  +source: string;
  +threeLoadingManager: THREELoadingManager;
  quakeMapWorker: ?Worker;

  constructor(
    audioListener: AudioListener,
    audioLoader: AudioLoader,
    canvasViewBag: CanvasViewBag,
    loadingManager: LoadingManager,
    logger: Logger,
    loggerBreadcrumbs: LoggerBreadcrumbs,
    queryBus: QueryBus,
    scene: Scene,
    threeLoadingManager: THREELoadingManager,
    source: string
  ) {
    super(canvasViewBag);

    this.audioListener = audioListener;
    this.audioLoader = audioLoader;
    this.group = new THREE.Group();
    this.loadingManager = loadingManager;
    this.logger = logger;
    this.loggerBreadcrumbs = loggerBreadcrumbs;
    this.queryBus = queryBus;
    this.scene = scene;
    this.source = source;
    this.threeLoadingManager = threeLoadingManager;
  }

  async attach(cancelToken: CancelToken): Promise<void> {
    await super.attach(cancelToken);

    const quakeMapWorker: Worker = new QuakeMapWorker();
    const jsonRpcClient = new JSONRPCClient(this.loggerBreadcrumbs.add("JSONRPCClient"), quakeMapWorker.postMessage.bind(quakeMapWorker));

    quakeMapWorker.onmessage = jsonRpcClient.useMessageHandler(cancelToken);
    this.quakeMapWorker = quakeMapWorker;

    const promises: Promise<void>[] = [];
    let animationOffset = 0;
    let md2Models = [];

    for await (let entity of jsonRpcClient.requestGenerator(cancelToken, "/map", [this.source])) {
      animationOffset += 200;

      switch (entity.classname) {
        case "light":
          // prettier-ignore
          promises.push(this.loadingManager.blocking(
            this.canvasViewBag.add(
              cancelToken,
              new PointLightView(
                this.canvasViewBag.fork(this.loggerBreadcrumbs.add("PointLight")),
                this.group,
                new THREE.Vector3(...entity.origin),
                new THREE.Color(parseInt(entity.color, 16)),
                entity.light,
                entity.decay,
              )
            ),
            "Loading point light"
          ));
          break;
        case "light_ambient":
          // prettier-ignore
          promises.push(this.loadingManager.blocking(
            this.canvasViewBag.add(
              cancelToken,
              new AmbientLightView(
                this.canvasViewBag.fork(this.loggerBreadcrumbs.add("AmbientLight")),
                this.group,
                entity.light
              )
            ),
            "Loading world ambient light"
          ));
          break;
        case "light_hemisphere":
          // prettier-ignore
          promises.push(this.loadingManager.blocking(
            this.canvasViewBag.add(
              cancelToken,
              new HemisphereLightView(
                this.canvasViewBag.fork(this.loggerBreadcrumbs.add("HemisphereLight")),
                this.group,
                entity.light
              )
            ),
            "Loading world hemisphere light"
          ));
          break;
        case "model_fbx":
          // prettier-ignore
          promises.push(this.loadingManager.blocking(
            this.canvasViewBag.add(
              cancelToken,
              new FBXModelView(
                this.canvasViewBag.fork(this.loggerBreadcrumbs.add("MD2Character")),
                new THREE.Vector3(...entity.origin),
                this.queryBus,
                this.group,
                this.threeLoadingManager,
                `/models/model-fbx-${entity.model_name}/`,
                entity.angle,
                animationOffset,
                entity.scale,
                entity.model_texture,
              )
            ),
            "Loading FBX model"
          ));
          break;
        case "model_md2":
          md2Models.push(entity);
          break;
        case "player":
          console.log("player", entity);
          break;
        case "sounds":
          // prettier-ignore
          promises.push(this.loadingManager.blocking(
            this.canvasViewBag.add(
              cancelToken,
              new AmbientSoundView(
                this.audioListener,
                this.audioLoader,
                this.canvasViewBag.fork(this.loggerBreadcrumbs.add("AmbientSound")),
                this.loadingManager,
                this.loggerBreadcrumbs.add("AmbientSound"),
                entity.sounds
              )
            ),
            "Loading world ambient sound"
          ));
          break;
        case "spark_particles":
          // prettier-ignore
          promises.push(this.loadingManager.blocking(
            this.canvasViewBag.add(
              cancelToken,
              new ParticlesView(this.canvasViewBag.fork(this.loggerBreadcrumbs.add("Particles")), this.group, new THREE.Vector3(...entity.origin))
            ),
            "Loading particles"
          ));
          break;
        case "worldspawn":
          // prettier-ignore
          promises.push(this.loadingManager.blocking(
            this.canvasViewBag.add(
              cancelToken,
              new QuakeBrushView(
                this.loggerBreadcrumbs.add("QuakeBrush"),
                this.canvasViewBag.fork(this.loggerBreadcrumbs.add("QuakeBrush")),
                entity,
                this.group,
                this.queryBus,
                this.threeLoadingManager
              )
            ),
            "Loading entity brush"
          ));
          break;
        default:
          throw new QuakeMapException(this.loggerBreadcrumbs.add("attach"), `Unsupported entity class name: "${entity.classname}"`);
      }
    }

    for (let entity of md2Models) {
      // prettier-ignore
      promises.push(this.loadingManager.blocking(
        this.canvasViewBag.add(
          cancelToken,
          new MD2CharacterView(
            this.canvasViewBag.fork(this.loggerBreadcrumbs.add("MD2Character")),
            new THREE.Vector3(...entity.origin),
            this.queryBus,
            this.group,
            this.threeLoadingManager,
            `/models/model-md2-${entity.model_name}/`,
            entity.angle,
            animationOffset,
            entity.skin
          )
        ),
        "Loading MD2 model"
      ));
    }

    await Promise.all(promises);
    this.scene.add(this.group);
  }

  async dispose(cancelToken: CancelToken): Promise<void> {
    await super.dispose(cancelToken);

    this.scene.remove(this.group);

    const quakeMapWorker = this.quakeMapWorker;

    if (!quakeMapWorker) {
      return;
    }

    quakeMapWorker.terminate();
  }
}
