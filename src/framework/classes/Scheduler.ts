import autoBind from "auto-bind";

import EventListenerSet from "src/framework/classes/EventListenerSet";

import { EventListenerSet as EventListenerSetInterface } from "src/framework/interfaces/EventListenerSet";
import { MainLoopBeginCallback } from "src/framework/types/MainLoopBeginCallback";
import { MainLoopDrawCallback } from "src/framework/types/MainLoopDrawCallback";
import { MainLoopEndCallback } from "src/framework/types/MainLoopEndCallback";
import { MainLoopUpdateCallback } from "src/framework/types/MainLoopUpdateCallback";
import { Scheduler as SchedulerInterface } from "src/framework/interfaces/Scheduler";
import { LoggerBreadcrumbs } from "src/framework/interfaces/LoggerBreadcrumbs";

export default class Scheduler implements SchedulerInterface {
  readonly beginCallbacks: EventListenerSetInterface<[number, number]>;
  readonly drawCallbacks: EventListenerSetInterface<[number]>;
  readonly endCallbacks: EventListenerSetInterface<[number, boolean]>;
  readonly updateCallbacks: EventListenerSetInterface<[number]>;

  constructor(loggerBreadcrumbs: LoggerBreadcrumbs) {
    autoBind(this);

    this.beginCallbacks = new EventListenerSet<[number, number]>(loggerBreadcrumbs);
    this.drawCallbacks = new EventListenerSet<[number]>(loggerBreadcrumbs);
    this.endCallbacks = new EventListenerSet<[number, boolean]>(loggerBreadcrumbs);
    this.updateCallbacks = new EventListenerSet<[number]>(loggerBreadcrumbs);
  }

  notifyBegin(timestamp: number, delta: number): void {
    this.beginCallbacks.notify([timestamp, delta]);
  }

  notifyDraw(interpolationPercentage: number): void {
    this.drawCallbacks.notify([interpolationPercentage]);
  }

  notifyEnd(fps: number, isPanicked: boolean): void {
    this.endCallbacks.notify([fps, isPanicked]);
  }

  notifyUpdate(delta: number): void {
    this.updateCallbacks.notify([delta]);
  }

  offBegin(callback: MainLoopBeginCallback): void {
    this.beginCallbacks.delete(callback);
  }

  offDraw(callback: MainLoopDrawCallback): void {
    this.drawCallbacks.delete(callback);
  }

  offEnd(callback: MainLoopEndCallback): void {
    this.endCallbacks.delete(callback);
  }

  offUpdate(callback: MainLoopUpdateCallback): void {
    this.updateCallbacks.delete(callback);
  }

  onBegin(callback: MainLoopBeginCallback): void {
    this.beginCallbacks.add(callback);
  }

  onDraw(callback: MainLoopDrawCallback): void {
    this.drawCallbacks.add(callback);
  }

  onEnd(callback: MainLoopEndCallback): void {
    this.endCallbacks.add(callback);
  }

  onUpdate(callback: MainLoopUpdateCallback): void {
    this.updateCallbacks.add(callback);
  }
}
