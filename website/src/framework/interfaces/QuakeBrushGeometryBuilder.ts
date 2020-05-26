import type * as THREE from "three";
import type { Face } from "three/examples/jsm/math/ConvexHull";

import type QuakeBrush from "src/framework/interfaces/QuakeBrush";

export default interface QuakeBrushGeometryBuilder {
  addBrush(brush: QuakeBrush, textures: ReadonlyArray<THREE.Texture>): void;

  addConvexHullFace(brush: QuakeBrush, face: Face, textures: ReadonlyArray<THREE.Texture>): void;

  addTextureIndex(vertex: THREE.Vector3, normal: THREE.Vector3, textureIndex: number): void;

  addVertex(vertex: THREE.Vector3, normal: THREE.Vector3): void;

  addVertexUVs(vertex: THREE.Vector3, normal: THREE.Vector3, x: number, y: number): void;

  getGeometry(): THREE.BufferGeometry;

  getIndices(): ReadonlyArray<number>;

  getNormals(): ReadonlyArray<number>;

  getTexturesIndices(): ReadonlyArray<number>;

  getTexturesNames(): ReadonlyArray<string>;

  getUvs(): ReadonlyArray<number>;

  getVertices(): ReadonlyArray<number>;

  indexVertex(vertex: THREE.Vector3, normal: THREE.Vector3): void;

  isVertexIndexed(vertex: THREE.Vector3, normal: THREE.Vector3): boolean;
}