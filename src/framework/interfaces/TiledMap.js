// @flow

import type { CancelToken } from "./CancelToken";
import type { ElementSize } from "./ElementSize";
import type { TiledMapLayer } from "./TiledMapLayer";
import type { TiledMapSkinnedLayer } from "./TiledMapSkinnedLayer";
import type { TiledTileset } from "./TiledTileset";

export interface TiledMap {
  constructor(ElementSize<"tile">, ElementSize<"px">, TiledTileset): void;

  addLayer(TiledMapLayer): void;

  generateSkinnedLayers(
    CancelToken
  ): AsyncGenerator<TiledMapSkinnedLayer, void, void>;

  getLayers(): Array<TiledMapLayer>;

  getMapSize(): ElementSize<"tile">;

  getTileSize(): ElementSize<"px">;

  getTiledTileset(): TiledTileset;
}
