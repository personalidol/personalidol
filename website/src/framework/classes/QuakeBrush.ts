import * as THREE from "three";
import uniq from "lodash/uniq";
import { ConvexHull } from "three/examples/jsm/math/ConvexHull";

import combineWithoutRepetitions from "src/framework/helpers/combineWithoutRepetitions";
import isArrayEqual from "src/framework/helpers/isArrayEqual";
import serializeVector3 from "src/framework/helpers/serializeVector3";

import QuakeBrushHalfSpaceTrio from "src/framework/classes/QuakeBrushHalfSpaceTrio";
import { default as QuakeBrushException } from "src/framework/classes/Exception/QuakeBrush";

import type HasLoggerBreadcrumbs from "src/framework/interfaces/HasLoggerBreadcrumbs";
import type LoggerBreadcrumbs from "src/framework/interfaces/LoggerBreadcrumbs";
import type QuakeBrushHalfSpace from "src/framework/interfaces/QuakeBrushHalfSpace";
import type { default as IQuakeBrush } from "src/framework/interfaces/QuakeBrush";
import type { default as IQuakeBrushHalfSpaceTrio } from "src/framework/interfaces/QuakeBrushHalfSpaceTrio";

export default class QuakeBrush implements HasLoggerBreadcrumbs, IQuakeBrush {
  readonly halfSpaces: ReadonlyArray<QuakeBrushHalfSpace>;
  readonly loggerBreadcrumbs: LoggerBreadcrumbs;
  readonly verticesCache: WeakMap<THREE.Vector3, QuakeBrushHalfSpace> = new WeakMap();
  private readonly _boundingBox: THREE.Box3 = new THREE.Box3();
  private readonly _boundingSphere: THREE.Sphere = new THREE.Sphere();
  private readonly _vertices: THREE.Vector3[] = [];
  private _boundingBoxNeedsGenerating: boolean = true;
  private _boundingSphereNeedsGenerating: boolean = true;
  private _verticesNeedGenerating: boolean = true;
  // private instanceId: string = `QuakeBrush.${THREE.MathUtils.generateUUID()}`;

  constructor(loggerBreadcrumbs: LoggerBreadcrumbs, halfSpaces: ReadonlyArray<QuakeBrushHalfSpace>) {
    if (halfSpaces.length < 4) {
      throw new QuakeBrushException(loggerBreadcrumbs.add("constructor"), "You need at least 4 half-spaces to have a chance of forming a polyhedron.");
    }

    this.halfSpaces = Object.freeze(halfSpaces);
    this.loggerBreadcrumbs = loggerBreadcrumbs;
  }

  containsPoint(point: THREE.Vector3): boolean {
    for (let halfSpace of this.getHalfSpaces()) {
      if (!halfSpace.containsPoint(point)) {
        return false;
      }
    }

    return true;
  }

  *generateHalfSpaceTrios(): Generator<IQuakeBrushHalfSpaceTrio> {
    for (let combo of combineWithoutRepetitions<QuakeBrushHalfSpace>(this.halfSpaces, 3)) {
      if (combo.length !== 3) {
        throw new QuakeBrushException(this.loggerBreadcrumbs, "Invalid halfspace combinations.");
      }

      yield new QuakeBrushHalfSpaceTrio(this.loggerBreadcrumbs.add("QuakeBrushHalfSpaceTrio"), combo[0], combo[1], combo[2]);
    }
  }

  *generateVertices(): Generator<THREE.Vector3> {
    if (this._verticesNeedGenerating === false) {
      for (let vertex of this._vertices) {
        yield vertex;
      }
    }

    const unique: { [key: string]: boolean } = {};

    for (let trio of this.generateHalfSpaceTrios()) {
      if (trio.hasIntersectingPoint()) {
        const intersectingPoint = trio.getIntersectingPoint();
        const serialized = serializeVector3(intersectingPoint);

        if (!unique.hasOwnProperty(serialized)) {
          unique[serialized] = true;

          if (this.containsPoint(intersectingPoint)) {
            this._vertices.push(intersectingPoint);
            yield intersectingPoint;
          }
        }
      }
    }

    this._verticesNeedGenerating = false;
  }

  getBoundingBox(): THREE.Box3 {
    if (!this._boundingBoxNeedsGenerating) {
      return this._boundingBox;
    }

    for (let vertex of this.generateVertices()) {
      this._boundingBox.expandByPoint(vertex);
    }

    this._boundingBoxNeedsGenerating = false;

    return this._boundingBox;
  }

  getBoundingSphere(): THREE.Sphere {
    if (!this._boundingSphereNeedsGenerating) {
      return this._boundingSphere;
    }

    const vertices = this.getVertices();

    this._boundingSphere.setFromPoints(vertices.slice());
    this._boundingSphereNeedsGenerating = false;

    return this._boundingSphere;
  }

  getConvexHull(): ConvexHull {
    const convexHull = new ConvexHull();
    const vertices = this.getVertices().slice();

    convexHull.setFromPoints(vertices);

    return convexHull;
  }

  getHalfSpaceByCoplanarPoints(v1: THREE.Vector3, v2: THREE.Vector3, v3: THREE.Vector3): QuakeBrushHalfSpace {
    for (let halfSpace of this.getHalfSpaces()) {
      if (halfSpace.planeContainsPoint(v1) && halfSpace.planeContainsPoint(v2) && halfSpace.planeContainsPoint(v3)) {
        return halfSpace;
      }
    }

    throw new QuakeBrushException(this.loggerBreadcrumbs.add("getHalfSpaceByCoplanarPoints"), "Half space does not exist, but it was expected.");
  }

  getHalfSpaces(): ReadonlyArray<QuakeBrushHalfSpace> {
    return this.halfSpaces;
  }

  // getInstanceId(): string {
  //   return this.instanceId;
  // }

  getTextures(): ReadonlyArray<string> {
    return uniq(this.getHalfSpaces().map((halfSpace) => halfSpace.getTexture()));
  }

  getVertices(): ReadonlyArray<THREE.Vector3> {
    if (this._verticesNeedGenerating === false) {
      return this._vertices;
    }

    return Array.from(this.generateVertices());
  }

  isEqual(other: IQuakeBrush): boolean {
    const thisHalfSpaces = this.getHalfSpaces();
    const otherHalfSpaces = other.getHalfSpaces();

    return isArrayEqual(this.loggerBreadcrumbs.add("isEqual"), thisHalfSpaces, otherHalfSpaces);
  }

  isStatic(): true {
    return true;
  }
}