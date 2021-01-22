import { MathUtils } from "three/src/math/MathUtils";

import { mountDispose } from "@personalidol/framework/src/mountDispose";
import { mountPreload } from "@personalidol/framework/src/mountPreload";

import type { Logger } from "loglevel";

import type { Scene } from "@personalidol/framework/src/Scene.interface";
import type { TickTimerState } from "@personalidol/framework/src/TickTimerState.type";

import type { Director as IDirector } from "./Director.interface";
import type { DirectorState } from "./DirectorState.type";

export function Director(logger: Logger, tickTimerState: TickTimerState, directorDebugName: string): IDirector {
  const state: DirectorState = Object.seal({
    current: null,
    isStarted: false,
    isTransitioning: false,
    lastUpdateCurrentTick: -1,
    lastUpdateNextTick: -1,
    lastUpdateTransitioningTick: -1,
    next: null,
  });

  let _transitioning: null | Scene = null;

  function start(): void {
    if (state.isStarted) {
      throw new Error("Director is already started.");
    }

    state.isStarted = true;
  }

  function stop(): void {
    if (!state.isStarted) {
      throw new Error("Director is already stopped.");
    }

    state.isStarted = false;
  }

  function update(): void {
    if (!state.isStarted) {
      throw new Error("Director is not started, but it was updated.");
    }

    const { current, next } = state;

    // 0,0,0
    if (!next && !_transitioning && !current) {
      return;
    }

    // 0,0,1
    if (!next && !_transitioning && current) {
      return;
    }

    // 0,1,0
    if (!next && _transitioning && !current && _transitioning.state.isPreloaded) {
      state.current = _transitioning;
      state.isTransitioning = false;
      _transitioning = null;

      state.lastUpdateCurrentTick = tickTimerState.currentTick;
      state.lastUpdateTransitioningTick = tickTimerState.currentTick;

      return;
    }

    // 0,1,0
    if (!next && _transitioning && !current && _transitioning.state.isPreloading) {
      return;
    }

    // 0,1,0
    if (!next && _transitioning && !current && !_transitioning.state.isPreloading) {
      throw new Error("Transitioning scene is not preloading, but it was expected to be.");
    }

    // 0,1,1
    if (!next && _transitioning && current) {
      throw new Error("Unexpected director state: both transitioning and final scenes are set.");
    }

    // 1,0,0
    if (next && !_transitioning && !current) {
      mountPreload(logger, next);

      state.next = null;
      state.isTransitioning = true;
      _transitioning = next;

      state.lastUpdateNextTick = tickTimerState.currentTick;
      state.lastUpdateTransitioningTick = tickTimerState.currentTick;

      return;
    }

    // 1,0,1
    if (next && !_transitioning && current) {
      mountDispose(logger, current);

      state.current = null;
      state.isTransitioning = true;

      state.lastUpdateCurrentTick = tickTimerState.currentTick;
      state.lastUpdateTransitioningTick = tickTimerState.currentTick;

      return;
    }

    // 1,1,0
    if (next && _transitioning && !current) {
      throw new Error("Can't set a new scene while current one is still transitioning.");
    }

    // 1,1,1
    if (next && _transitioning && current) {
      throw new Error("Can't set a new scene while current one is still transitioning.");
    }
  }

  return Object.freeze({
    id: MathUtils.generateUUID(),
    name: `Director(${directorDebugName})`,
    state: state,

    start: start,
    stop: stop,
    update: update,
  });
}
