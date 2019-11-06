// @flow

import type { CanvasView as CanvasViewInterface } from "../interfaces/CanvasView";
import type { CanvasViewBag } from "../interfaces/CanvasViewBag";

export default class CanvasView implements CanvasViewInterface {
  +canvasViewBag: CanvasViewBag;

  static useBegin: boolean = true;
  static useEnd: boolean = true;
  static useUpdate: boolean = true;

  constructor(canvasViewBag: CanvasViewBag): void {
    this.canvasViewBag = canvasViewBag;
  }

  async attach(): Promise<void> {}

  begin(): void {}

  async dispose(): Promise<void> {
    return this.canvasViewBag.dispose();
  }

  end(fps: number, isPanicked: boolean): void {}

  onPointerAuxiliaryClick(): void {}

  onPointerAuxiliaryDepressed(): void {}

  onPointerAuxiliaryPressed(): void {}

  onPointerOut(): void {}

  onPointerOver(): void {}

  onPointerPrimaryClick(): void {}

  onPointerPrimaryDepressed(): void {}

  onPointerPrimaryPressed(): void {}

  onPointerSecondaryClick(): void {}

  onPointerSecondaryDepressed(): void {}

  onPointerSecondaryPressed(): void {}

  update(delta: number): void {}

  useBegin(): boolean {
    return true;
  }

  useEnd(): boolean {
    return true;
  }

  useUpdate(): boolean {
    return true;
  }
}