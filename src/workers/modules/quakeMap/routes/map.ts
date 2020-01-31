import * as THREE from "three";
import isEmpty from "lodash/isEmpty";

import JSONRPCResponseData from "src/framework/classes/JSONRPCResponseData";
import QuakeBrushGeometryBuilder from "src/framework/classes/QuakeBrushGeometryBuilder";
import QuakeMapParser from "src/framework/classes/QuakeMapParser";
import QuakeMapTextureLoader from "src/framework/classes/QuakeMapTextureLoader";
import { default as PlainTextQuery } from "src/framework/classes/Query/PlainText";
import { default as QuakeMapException } from "src/framework/classes/Exception/QuakeMap";

import CancelToken from "src/framework/interfaces/CancelToken";
import JSONRPCRequest from "src/framework/interfaces/JSONRPCRequest";
import LoggerBreadcrumbs from "src/framework/interfaces/LoggerBreadcrumbs";
import QuakeBrush from "src/framework/interfaces/QuakeBrush";
import QuakeEntity from "src/framework/interfaces/QuakeEntity";
import QueryBus from "src/framework/interfaces/QueryBus";
import { default as IJSONRPCResponseData } from "src/framework/interfaces/JSONRPCResponseData";

import QuakeWorkerAny from "src/framework/types/QuakeWorkerAny";
import QuakeWorkerBrush from "src/framework/types/QuakeWorkerBrush";

type QuakeBrushClassNames = "func_group" | "worldspawn";

const SCENERY_INDOORS = 0;
const SCENERY_OUTDOORS = 1;

async function createGeometryBuffers(cancelToken: CancelToken, className: QuakeBrushClassNames, brushes: ReadonlyArray<QuakeBrush>) {
  const quakeBrushGeometryBuilder = new QuakeBrushGeometryBuilder();

  for (let brush of brushes) {
    quakeBrushGeometryBuilder.addBrush(brush);
  }

  const indices = Uint32Array.from(quakeBrushGeometryBuilder.getIndices());
  const normals = Float32Array.from(quakeBrushGeometryBuilder.getNormals());
  const textures = Float32Array.from(quakeBrushGeometryBuilder.getTexturesIndices());
  const uvs = Float32Array.from(quakeBrushGeometryBuilder.getUvs());
  const vertices = Float32Array.from(quakeBrushGeometryBuilder.getVertices());

  // prettier-ignore
  return new JSONRPCResponseData<QuakeWorkerBrush>(
    {
      classname: className,
      indices: indices.buffer,
      normals: normals.buffer,
      texturesIndices: textures.buffer,
      texturesNames: quakeBrushGeometryBuilder.getTexturesNames(),
      uvs: uvs.buffer,
      vertices: vertices.buffer,
    },
    [
      indices.buffer,
      normals.buffer,
      textures.buffer,
      uvs.buffer,
      vertices.buffer
    ]
  );
}

function getEntityOrigin(entity: QuakeEntity): [number, number, number] {
  const origin = entity.getOrigin();

  return [origin.x, origin.y, origin.z];
}

export default async function* map(
  cancelToken: CancelToken,
  request: JSONRPCRequest,
  loggerBreadcrumbs: LoggerBreadcrumbs,
  queryBus: QueryBus,
  threeLoadingManager: THREE.LoadingManager
): AsyncGenerator<IJSONRPCResponseData<QuakeWorkerAny>> {
  const breadcrumbs = loggerBreadcrumbs.add("/map");
  const [source] = request.getParams();
  const quakeMapQuery = new PlainTextQuery(source);
  const quakeMapContent = await queryBus.enqueue(cancelToken, quakeMapQuery).whenExecuted();
  const quakeMapParser = new QuakeMapParser(breadcrumbs, quakeMapContent);

  // standalone entities
  const entitiesWithBrushes: Array<[QuakeBrushClassNames, QuakeEntity]> = [];

  // brushes to be merged in one bigger static geometry
  const worldBrushes: Array<QuakeEntity> = [];

  for (let entity of quakeMapParser.parse()) {
    if (cancelToken.isCanceled()) {
      return;
    }

    const entityClassName = entity.getClassName();
    const entityProperties = entity.getProperties();
    let entityOrigin;

    switch (entityClassName) {
      case "func_group":
        // this func is primarily for a game logic, but it can also group
        // geometries
        switch (entity.getType()) {
          // "_tb_layer" is the Trenchbroom editor utility to help mapmaker to
          // group map objects, those can be merged with worldspawn geometry
          case "_tb_layer":
            worldBrushes.push(entity);
            break;
          // Grouped objects should be processed as standalone entities,
          // because they can have their own controllers and be handled via
          // triggers. Those can be doors or other animated objects.
          default:
            entitiesWithBrushes.push(["func_group", entity]);
            break;
        }
        break;
      case "light_point":
      case "light_spotlight":
        yield new JSONRPCResponseData({
          classname: entityClassName,
          color: entityProperties.getPropertyByKey("color").getValue(),
          decay: entityProperties.getPropertyByKey("decay").asNumber(),
          intensity: entityProperties.getPropertyByKey("intensity").asNumber(),
          origin: getEntityOrigin(entity),
        });
        break;
      case "model_gltf":
        yield new JSONRPCResponseData({
          angle: entityProperties.getPropertyByKey("angle").asNumber(),
          classname: entityClassName,
          model_name: entityProperties.getPropertyByKey("model_name").getValue(),
          model_texture: entityProperties.getPropertyByKey("model_texture").getValue(),
          origin: getEntityOrigin(entity),
          scale: entityProperties.getPropertyByKey("scale").asNumber(),
        });

        break;
      case "model_md2":
        yield new JSONRPCResponseData({
          angle: entityProperties.getPropertyByKey("angle").asNumber(),
          classname: entityClassName,
          model_name: entityProperties.getPropertyByKey("model_name").getValue(),
          origin: getEntityOrigin(entity),
          skin: entityProperties.getPropertyByKey("skin").asNumber(),
        });
        break;
      case "player":
        yield new JSONRPCResponseData({
          classname: entityClassName,
          origin: getEntityOrigin(entity),
        });
        break;
      case "spark_particles":
        yield new JSONRPCResponseData({
          classname: entityClassName,
          origin: getEntityOrigin(entity),
        });
        break;
      case "worldspawn":
        // leave worldspawn at the end for better performance
        // it takes a long time to parse a map file, in the meantime the main
        // thread can load models, etc
        worldBrushes.push(entity);

        if (entityProperties.hasPropertyKey("light")) {
          const sceneryType = entityProperties.getPropertyByKey("scenery").asNumber();

          switch (sceneryType) {
            case SCENERY_INDOORS:
              yield new JSONRPCResponseData({
                classname: "light_ambient",
                light: entityProperties.getPropertyByKey("light").asNumber(),
              });
              break;
            case SCENERY_OUTDOORS:
              yield new JSONRPCResponseData({
                classname: "light_hemisphere",
                light: entityProperties.getPropertyByKey("light").asNumber(),
              });
              break;
            default:
              throw new QuakeMapException(breadcrumbs, `Unknown map scenery type: "${sceneryType}".`);
          }
        }
        if (entityProperties.hasPropertyKey("sounds")) {
          yield new JSONRPCResponseData({
            classname: "sounds",
            sounds: entityProperties.getPropertyByKey("sounds").getValue(),
          });
        }
        break;
      default:
        throw new QuakeMapException(breadcrumbs, `Unsupported entity class name: "${entityClassName}"`);
    }
  }

  for (let [entityClassName, entity] of entitiesWithBrushes) {
    if (cancelToken.isCanceled()) {
      return;
    }

    yield await createGeometryBuffers(cancelToken, entityClassName, entity.getBrushes());
  }

  // this is the static world geometry
  const mergedBrushes: Array<QuakeBrush> = [];

  for (let entity of worldBrushes) {
    mergedBrushes.push(...entity.getBrushes());
  }

  if (!isEmpty(mergedBrushes)) {
    if (cancelToken.isCanceled()) {
      return;
    }

    yield await createGeometryBuffers(cancelToken, "worldspawn", mergedBrushes);
  }
}