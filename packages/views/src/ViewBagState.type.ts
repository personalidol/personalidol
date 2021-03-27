import type { DisposableState } from "@personalidol/framework/src/DisposableState.type";
import type { MountState } from "@personalidol/framework/src/MountState.type";
import type { PauseableState } from "@personalidol/framework/src/PauseableState.type";
import type { PreloadableState } from "@personalidol/framework/src/PreloadableState.type";

export type ViewBagState = DisposableState & MountState & PauseableState & PreloadableState;
