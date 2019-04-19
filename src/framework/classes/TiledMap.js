// @flow

import Cancelled from "./Exception/Cancelled";
import TiledMapSkinnedLayer from "./TiledMapSkinnedLayer";

import type { CancelToken } from "../interfaces/CancelToken";
import type { ElementSize } from "../interfaces/ElementSize";
import type { TiledMap as TiledMapInterface } from "../interfaces/TiledMap";
import type { TiledMapLayer } from "../interfaces/TiledMapLayer";
import type { TiledMapSkinnedLayer as TiledMapSkinnedLayerInterface } from "../interfaces/TiledMapSkinnedLayer";
import type { TiledTileset } from "../interfaces/TiledTileset";

export default class TiledMap implements TiledMapInterface {
  +mapSize: ElementSize<"tile">;
  +tileSize: ElementSize<"px">;
  +tiledMapLayers: Array<TiledMapLayer>;
  +tiledTileset: TiledTileset;

  constructor(
    mapSize: ElementSize<"tile">,
    tileSize: ElementSize<"px">,
    tiledTileset: TiledTileset
  ) {
    this.mapSize = mapSize;
    this.tiledMapLayers = [];
    this.tiledTileset = tiledTileset;
    this.tileSize = tileSize;
  }

  addLayer(tiledMapLayer: TiledMapLayer): void {
    this.tiledMapLayers.push(tiledMapLayer);
  }

  async *generateSkinnedLayers(
    cancelToken: CancelToken
  ): AsyncGenerator<TiledMapSkinnedLayerInterface, void, void> {
    for (let layer of this.getLayers()) {
      if (cancelToken.isCancelled()) {
        throw new Cancelled(
          "Cancel token was cancelled while generating skinned layers."
        );
      }

      yield new TiledMapSkinnedLayer(layer, this.tileSize, this.tiledTileset);
    }
  }

  getLayers(): Array<TiledMapLayer> {
    return this.tiledMapLayers.slice(0);
  }

  getMapSize(): ElementSize<"tile"> {
    return this.mapSize;
  }

  getTileSize(): ElementSize<"px"> {
    return this.tileSize;
  }

  getTiledTileset(): TiledTileset {
    return this.tiledTileset;
  }
}