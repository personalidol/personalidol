import { generateUUID } from "@personalidol/math/src/generateUUID";

import type { MainLoopUpdatableState } from "@personalidol/framework/src/MainLoopUpdatableState.type";
import type { StatsHook } from "@personalidol/framework/src/StatsHook.interface";
import type { TickTimerState } from "@personalidol/framework/src/TickTimerState.type";

import type { UIStateController } from "./UIStateController.interface";
import type { UIStateControllerStatsReport } from "./UIStateControllerStatsReport.type";

const DEBUG_NAME: "ui_cntrlr" = "ui_cntrlr";

export function UIStateControllerStatsHook(uiStateController: UIStateController): StatsHook {
  const state: MainLoopUpdatableState = Object.seal({
    needsUpdates: true,
  });
  const statsReport: UIStateControllerStatsReport = {
    currentMap: "",
    debugName: DEBUG_NAME,
    isScenePaused: false,
    lastUpdate: 0,
    previousMap: "",
  };

  function reset(): void {}

  function update(delta: number, elapsedTime: number, tickTimerState: TickTimerState): void {
    statsReport.currentMap = String(uiStateController.uiState.currentMap);
    statsReport.isScenePaused = uiStateController.uiState.isScenePaused;
    statsReport.previousMap = String(uiStateController.uiState.previousMap);
    statsReport.lastUpdate = tickTimerState.currentTick;
  }

  return Object.freeze({
    id: generateUUID(),
    isStatsHook: true,
    name: `UIStateControllerStatsHook("${DEBUG_NAME}")`,
    state: state,
    statsReport: statsReport,
    statsReportIntervalSeconds: 1,

    reset: reset,
    update: update,
  });
}