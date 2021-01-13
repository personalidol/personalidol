import { Color } from "three/src/math/Color";
import { PointLight } from "three/src/lights/PointLight";

import { noop } from "@personalidol/framework/src/noop";

import type { Scene } from "three/src/scenes/Scene";

import type { EntityLightPoint } from "@personalidol/quakemaps/src/EntityLightPoint.type";
import type { MountState } from "@personalidol/framework/src/MountState.type";
import type { View } from "@personalidol/framework/src/View.interface";

export function PointLightView(scene: Scene, entity: EntityLightPoint): View {
  const state: MountState = Object.seal({
    isDisposed: false,
    isMounted: false,
    isPreloaded: false,
    isPreloading: false,
  });

  const _color = new Color(parseInt(entity.color, 16));
  const _pointLight = new PointLight(_color, entity.intensity, 512);

  _pointLight.position.set(entity.origin.x, entity.origin.y, entity.origin.z);
  _pointLight.decay = entity.decay;
  _pointLight.castShadow = false;
  _pointLight.shadow.camera.far = 512;

  function dispose(): void {
    state.isDisposed = true;

    scene.remove(_pointLight);
  }

  function mount(): void {
    state.isMounted = true;

    scene.add(_pointLight);
  }

  function preload(): void {
    state.isPreloading = false;
    state.isPreloaded = true;
  }

  function unmount(): void {
    state.isMounted = false;
  }

  return Object.freeze({
    isScene: false,
    isView: true,
    name: `PointLight`,
    needsUpdates: false,
    state: state,

    dispose: dispose,
    mount: mount,
    preload: preload,
    unmount: unmount,
    update: noop,
  });
}
