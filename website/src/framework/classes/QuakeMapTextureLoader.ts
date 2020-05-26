import * as THREE from "three";

import { default as QuakeMapException } from "src/framework/classes/Exception/QuakeMap";
import { default as TextureQuery } from "src/framework/classes/Query/Texture";

import cancelable from "src/framework/decorators/cancelable";

import type CancelToken from "src/framework/interfaces/CancelToken";
import type HasLoggerBreadcrumbs from "src/framework/interfaces/HasLoggerBreadcrumbs";
import type LoggerBreadcrumbs from "src/framework/interfaces/LoggerBreadcrumbs";
import type QueryBus from "src/framework/interfaces/QueryBus";
import type { default as IQuakeMapTextureLoader } from "src/framework/interfaces/QuakeMapTextureLoader";

export default class QuakeMapTextureLoader implements HasLoggerBreadcrumbs, IQuakeMapTextureLoader {
  readonly loadedTextures: Set<THREE.Texture> = new Set<THREE.Texture>();
  readonly loggerBreadcrumbs: LoggerBreadcrumbs;
  readonly queryBus: QueryBus;
  readonly textureLoader: THREE.TextureLoader;
  readonly texturesIndex: string[] = [];
  readonly texturesSources: Map<string, string> = new Map<string, string>();

  constructor(loggerBreadcrumbs: LoggerBreadcrumbs, loadingManager: THREE.LoadingManager, queryBus: QueryBus) {
    this.loggerBreadcrumbs = loggerBreadcrumbs;
    this.queryBus = queryBus;
    this.textureLoader = new THREE.TextureLoader(loadingManager);
  }

  dispose(): void {
    for (let texture of this.loadedTextures.values()) {
      texture.dispose();
    }
  }

  getTextureIndex(textureName: string): number {
    const index = this.texturesIndex.findIndex((storedTextureName) => storedTextureName === textureName);

    if (-1 === index) {
      throw new QuakeMapException(this.loggerBreadcrumbs.add("getTextureIndex"), `Texture is not indexed: ${textureName}`);
    }

    return index;
  }

  getTextureSource(textureName: string): string {
    const textureSource = this.texturesSources.get(textureName);

    if ("string" !== typeof textureSource) {
      throw new QuakeMapException(this.loggerBreadcrumbs.add("getTextureSource"), `Texture is not registered: ${textureName}`);
    }

    return textureSource;
  }

  @cancelable(true)
  async loadTexture(cancelToken: CancelToken, textureName: string): Promise<THREE.Texture> {
    const src = this.getTextureSource(textureName);

    const texture = await this.queryBus.enqueue(cancelToken, new TextureQuery(this.textureLoader, src)).whenExecuted();

    texture.name = textureName;
    this.loadedTextures.add(texture);

    return texture;
  }

  @cancelable(true)
  loadRegisteredTextures(cancelToken: CancelToken): Promise<ReadonlyArray<THREE.Texture>> {
    return this.loadTextures(cancelToken, this.texturesIndex);
  }

  @cancelable(true)
  loadTextures(cancelToken: CancelToken, textureNames: ReadonlyArray<string>): Promise<ReadonlyArray<THREE.Texture>> {
    const loadedTextures = textureNames.map(this.loadTexture.bind(this, cancelToken));

    return Promise.all(loadedTextures);
  }

  registerTexture(textureName: string, src: string): void {
    if (this.texturesSources.has(textureName)) {
      if (src !== this.getTextureSource(textureName)) {
        throw new QuakeMapException(this.loggerBreadcrumbs.add("registerTexture"), `Texture data is inconsistent: "${textureName}": "${src}"`);
      }

      return;
    }

    this.texturesIndex.push(textureName);
    this.texturesSources.set(textureName, src);
  }
}