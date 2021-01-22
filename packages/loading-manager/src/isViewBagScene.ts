import type { Scene } from "@personalidol/framework/src/Scene.interface";

import type { ViewBagScene } from "./ViewBagScene.interface";

export function isViewBagScene(scene: Scene): scene is ViewBagScene {
  return true === (scene as ViewBagScene).isViewBagScene;
}
