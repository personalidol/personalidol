// @flow

import autoBind from "auto-bind";

import CancelToken from "../CancelToken";
import CanvasView from "../CanvasView";

import type { Mesh, Scene } from "three";

import type { CancelToken as CancelTokenInterface } from "../../interfaces/CancelToken";
import type { CanvasViewBag } from "../../interfaces/CanvasViewBag";
import type { LoggerBreadcrumbs } from "../../interfaces/LoggerBreadcrumbs";
import type { THREETilesetMeshes } from "../../interfaces/THREETilesetMeshes";
import type { TiledSkinnedTile as TiledSkinnedTileInterface } from "../../interfaces/TiledSkinnedTile";

export default class TiledSkinnedTile extends CanvasView {
  +cancelToken: CancelTokenInterface;
  +loggerBreadcrumbs: LoggerBreadcrumbs;
  +scene: Scene;
  +threeTilesetMeshes: THREETilesetMeshes;
  +tiledSkinnedTile: TiledSkinnedTileInterface;
  tiledSkinnedTileMesh: ?Mesh;

  constructor(
    canvasViewBag: CanvasViewBag,
    loggerBreadcrumbs: LoggerBreadcrumbs,
    scene: Scene,
    threeTilesetMeshes: THREETilesetMeshes,
    tiledSkinnedTile: TiledSkinnedTileInterface
  ) {
    super(canvasViewBag);
    autoBind(this);

    this.cancelToken = new CancelToken(loggerBreadcrumbs.add("CancelToken"));
    this.loggerBreadcrumbs = loggerBreadcrumbs;
    this.scene = scene;
    this.threeTilesetMeshes = threeTilesetMeshes;
    this.tiledSkinnedTile = tiledSkinnedTile;
  }

  attach(): void {
    super.attach();

    this.tiledSkinnedTileMesh = this.threeTilesetMeshes.getTiledSkinnedTileMesh(this.tiledSkinnedTile);
    this.scene.add(this.tiledSkinnedTileMesh);
  }

  dispose(): void {
    super.dispose();

    if (!this.tiledSkinnedTileMesh) {
      return;
    }

    this.scene.remove(this.tiledSkinnedTileMesh);
  }

  update(delta: number): void {
    super.update(delta);
  }
}
