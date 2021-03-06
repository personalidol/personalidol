import type { Object3D } from "three/src/core/Object3D";

import type { MainLoopUpdatable } from "@personalidol/framework/src/MainLoopUpdatable.interface";
import type { Preloadable } from "@personalidol/framework/src/Preloadable.interface";

import type { InstancedMeshHandleState } from "./InstancedMeshHandleState.type";

export interface InstancedMeshHandle extends MainLoopUpdatable, Preloadable {
  readonly isInstancedMeshHandle: true;
  readonly object3D: Object3D;
  readonly state: InstancedMeshHandleState;

  needsUpdate: boolean;
}
