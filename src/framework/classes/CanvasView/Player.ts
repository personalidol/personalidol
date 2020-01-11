// import * as THREE from "three";

import CanvasView from "../CanvasView";

import { Group, Vector3 } from "three";

import { CancelToken } from "../../interfaces/CancelToken";
import { CanvasViewBag } from "../../interfaces/CanvasViewBag";

export default class Player extends CanvasView {
  readonly group: Group;
  readonly origin: Vector3;

  constructor(canvasViewBag: CanvasViewBag, group: Group, origin: Vector3) {
    super(canvasViewBag);

    this.group = group;
    this.origin = origin;
  }

  async attach(cancelToken: CancelToken): Promise<void> {
    await super.attach(cancelToken);

    console.log("ATTACH PLAYER", this.origin);
  }

  async dispose(cancelToken: CancelToken): Promise<void> {
    await super.dispose(cancelToken);
  }
}