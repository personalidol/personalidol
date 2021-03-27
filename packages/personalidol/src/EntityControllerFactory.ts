import { name } from "@personalidol/framework/src/name";

import { isEntityViewOfClass } from "./isEntityViewOfClass";
import { isEntityWithController } from "./isEntityWithController";
import { NPCEntityController } from "./NPCEntityController";
import { PlayerEntityController } from "./PlayerEntityController";

import type { Vector3 } from "three/src/math/Vector3";

import type { CameraController } from "@personalidol/framework/src/CameraController.interface";

import type { AnyEntity } from "./AnyEntity.type";
import type { EntityController as IEntityController } from "./EntityController.interface";
import type { EntityControllerFactory as IEntityControllerFactory } from "./EntityControllerFactory.interface";
import type { EntityPlayer } from "./EntityPlayer.type";
import type { EntityView } from "./EntityView.interface";

export function EntityControllerFactory(cameraController: CameraController, cameraResetPosition: Vector3): IEntityControllerFactory {
  function* create<E extends AnyEntity>(view: EntityView<E>): Generator<IEntityController<E>> {
    if (!isEntityWithController(view.entity)) {
      throw new Error(`View do not use a controller: "${name(view)}"`);
    }

    switch (view.entity.properties.controller) {
      case "npc":
        yield NPCEntityController(view);
        break;
      case "player":
        if (!isEntityViewOfClass<EntityPlayer>(view, "player")) {
          throw new Error("Player entity controller only supports player entity.");
        }

        yield PlayerEntityController(view, cameraController, cameraResetPosition) as IEntityController<E>;
        break;
      default:
        throw new Error(`Unsupported entity controller: "${view.entity.properties.controller}"`);
    }
  }

  return Object.freeze({
    isEntityControllerFactory: true,

    create: create,
  });
}