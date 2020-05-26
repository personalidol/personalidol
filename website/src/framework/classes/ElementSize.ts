import isEqualWithPrecision from "src/framework/helpers/isEqualWithPrecision";

import type ElementPositionUnit from "src/framework/enums/ElementPositionUnit";

import type { default as IElementSize } from "src/framework/interfaces/ElementSize";

export default class ElementSize<Unit extends ElementPositionUnit> implements IElementSize<Unit> {
  readonly height: number;
  readonly depth: number;
  readonly unit: Unit;
  readonly width: number;

  constructor(unit: Unit, width: number, height: number, depth: number) {
    this.height = height;
    this.depth = depth;
    this.unit = unit;
    this.width = width;
  }

  getBaseArea(): number {
    return this.getHeight() * this.getWidth();
  }

  getAspect(): number {
    return this.getWidth() / this.getHeight();
  }

  getDepth(): number {
    return this.depth;
  }

  getHeight(): number {
    return this.height;
  }

  getWidth(): number {
    return this.width;
  }

  isEqual(other: IElementSize<Unit>): boolean {
    return this.getDepth() === other.getDepth() && this.getHeight() === other.getHeight() && this.getWidth() === other.getWidth();
  }

  isEqualWithPrecision(other: IElementSize<Unit>, precision: number): boolean {
    return (
      isEqualWithPrecision(this.getDepth(), other.getDepth(), precision) &&
      isEqualWithPrecision(this.getHeight(), other.getHeight(), precision) &&
      isEqualWithPrecision(this.getWidth(), other.getWidth(), precision)
    );
  }
}