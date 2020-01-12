import * as THREE from "three";

import { Equatable } from "src/framework/interfaces/Equatable";
import { QuakeBrushHalfSpace } from "src/framework/interfaces/QuakeBrushHalfSpace";
import { QuakeBrushHalfSpaceTrio } from "src/framework/interfaces/QuakeBrushHalfSpaceTrio";

export interface QuakeBrush extends Equatable<QuakeBrush> {
  generateHalfSpaceTrios(): Generator<QuakeBrushHalfSpaceTrio, void, void>;

  generateVertices(): Generator<THREE.Vector3, void, void>;

  getVertices(): ReadonlyArray<THREE.Vector3>;

  getHalfSpaceByCoplanarPoints(v1: THREE.Vector3, v2: THREE.Vector3, v3: THREE.Vector3): QuakeBrushHalfSpace;

  getHalfSpaces(): ReadonlyArray<QuakeBrushHalfSpace>;

  getTextures(): ReadonlyArray<string>;

  containsPoint(point: THREE.Vector3): boolean;
}
