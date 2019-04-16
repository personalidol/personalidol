// flow-typed signature: 581d51882ceaf04b7b0cf10a33bc9b24
// flow-typed version: <<STUB>>/three_v0.101.1/flow_v0.89.0

/**
 * This is an autogenerated libdef stub for:
 *
 *   'three'
 *
 * Fill this stub out by replacing all the `any` types.
 *
 * Once filled out, we encourage you to share your work with the
 * community by sending a pull request to:
 * https://github.com/flowtype/flow-typed
 */

declare module "three" {
  declare type Event<Events: string, Data> = {|
    ...$Exact<Data>,

    type: Events
  |};

  declare type EventCallback<Events: string, Data> = (
    Event<Events, Data>
  ) => void;

  declare type RepeatWrapping = 1000;

  declare type LoadingManagerOnErrorCallback = (url: string) => void;

  declare type LoadingManagerOnLoadCallback = () => void;

  declare type LoadingManagerOnProgressCallback = (
    url: string,
    itemsLoaded: number,
    itemsTotal: number
  ) => void;

  declare type LoadingManagerOnStartCallback = (
    url: string,
    itemsLoaded: number,
    itemsTotal: number
  ) => void;

  declare export interface AmbientLight extends Light {
    +isAmbientLight: true;
    castShadow: boolean;

    constructor(color?: number, intensity?: number): void;
  }

  declare export interface AnimationAction {
    enabled: boolean;

    crossFadeTo(AnimationAction, durationInSeconds: number): AnimationAction;

    play(): AnimationAction;

    setEffectiveWeight(number): void;
  }

  declare export interface AnimationClip {}

  declare export interface AnimationMixer {
    constructor(Object3D): void;

    clipAction(AnimationClip, optionalRoot: ?Object3D): AnimationAction;

    update(delta: number): void;
  }

  declare export interface BaseGeometry {
    dispose(): void;

    scale(x: number, y: number, z: number): Geometry;

    translate(x: number, y: number, z: number): Geometry;
  }

  declare export interface BoxGeometry extends Geometry {
    +parameters: {|
      depth: number,
      depthSegments: number,
      height: number,
      heightSegments: number,
      width: number,
      widthSegments: number
    |};

    constructor(
      width?: number,
      height?: number,
      depth?: number,
      widthSegments?: number,
      heightSegments?: number,
      depthSegments?: number
    ): void;
  }

  declare export interface Camera extends Object3D {
    +isCamera: true;

    constructor(): void;

    updateProjectionMatrix(): void;
  }

  declare export interface Euler {
    +isEuler: true;
    x: number;
    y: number;
    z: number;

    constructor(number, number, number): void;
  }

  declare export interface Clock {
    constructor(autoStart?: boolean): void;
  }

  declare export interface Color {
    set(number): void;
  }

  declare export interface EdgesGeometry extends BufferGeometry {
    constructor(Geometry, thresholdAngle?: number): void;
  }

  declare export interface BufferGeometry extends BaseGeometry {
    +isBufferGeometry: true;
  }

  declare export interface EventDispatcher<Events: string> {
    constructor(): void;

    dispatchEvent<Data>(Event<Events, Data>): void;

    addEventListener<Data>(Events, EventCallback<Events, Data>): void;

    removeEventListener<Data>(Events, EventCallback<Events, Data>): void;
  }

  declare export interface Geometry extends BaseGeometry {
    +isGeometry: true;
  }

  declare export interface Group extends Object3D {
    +type: "group";

    constructor(): void;
  }

  declare export interface Light extends Object3D {
    +isLight: true;
    intensity: number;
  }

  declare export interface LineBasicMaterial extends Material {
    constructor({|
      color: number,
      linewidth: number
    |}): void;
  }

  declare export interface LineSegments extends Object3D {
    constructor(BaseGeometry, Material): void;
  }

  declare export interface LoadingManager {
    constructor(): void;

    onError?: LoadingManagerOnErrorCallback;
    onLoad?: LoadingManagerOnLoadCallback;
    onProgress?: LoadingManagerOnProgressCallback;
    onStart?: LoadingManagerOnStartCallback;
  }

  declare export interface Material extends Geometry {
    +color: Color;
  }

  declare export interface Mesh extends Object3D {
    constructor(Geometry, Material): void;
  }

  declare export interface MeshBasicMaterial extends Material {
    constructor({|
      map?: Texture
    |}): void;
  }

  declare export interface MeshNormalMaterial extends Material {
    constructor(): void;
  }

  declare export interface MeshPhongMaterial extends Material {
    constructor({|
      color?: number,
      map?: Texture
    |}): void;
  }

  declare export interface Object3D {
    +children: Array<Object3D>;
    +material: Material;
    +position: Vector3;
    +rotation: Euler;
    +scale: Vector3;

    add(Object3D): void;

    remove(Object3D): void;

    lookAt(Vector3): void;
  }

  declare export interface OrthographicCamera extends Camera {
    bottom: number;
    far: number;
    left: number;
    near: number;
    right: number;
    top: number;

    constructor(
      bottom?: number,
      far?: number,
      left?: number,
      near?: number,
      right?: number,
      top?: number
    ): void;
  }

  declare export interface PerspectiveCamera extends Camera {
    aspect: number;

    constructor(fov: number, aspect: number, near: number, far: number): void;
  }

  declare export interface PlaneGeometry extends Geometry {
    constructor(
      width: number,
      height: number,
      widthSegments?: number,
      heightSegments?: number
    ): void;
  }

  declare export interface PointLight extends Light {
    +isPointLight: true;
    +position: Vector3;

    constructor(
      color?: number,
      intensity?: number,
      distance?: number,
      decay?: number
    ): void;
  }

  declare export interface Raycaster {
    constructor(): void;

    setFromCamera(Vector2, Camera): void;

    intersectObjects(
      objects: Array<Object3D>,
      recursive?: boolean
    ): Array<{|
      distance: number,
      object: Object3D
    |}>;
  }

  declare export interface Renderer {
    render(Scene, Camera): void;

    getSize(): {|
      height: number,
      width: number
    |};

    setPixelRatio(number): void;

    setSize(number, number, ?boolean): void;
  }

  declare export interface Scene extends Object3D {
    constructor(): void;
  }

  declare export interface SpotLight extends Light {
    constructor(color?: number): void;
  }

  declare export interface Texture extends Geometry {
    wrapS: RepeatWrapping;
    wrapT: RepeatWrapping;
  }

  declare export interface TextureLoader {
    constructor(?LoadingManager): void;

    load(
      url: string,
      onLoad?: Function,
      onProgress?: Function,
      onError?: Function
    ): Texture;
  }

  declare export interface Vector2 {
    +isVector2: true;
    x: number;
    y: number;

    constructor(x?: number, y?: number): void;

    clone(): Vector2;

    set(number, number): Vector2;
  }

  declare export interface Vector3 {
    +isVector3: true;
    x: number;
    y: number;
    z: number;

    constructor(x?: number, y?: number, z?: number): void;

    clone(): Vector3;

    set(number, number, number): Vector3;
  }

  declare export interface WebGLRenderer extends Renderer {
    +domElement: HTMLCanvasElement;

    constructor({|
      alpha?: boolean,
      canvas?: HTMLCanvasElement,
      depth?: boolean,
      logarithmicDepthBuffer?: boolean,
      powerPreference?: "high-performance" | "low-power" | "default",
      precision?: "highp" | "mediump" | "lowp",
      premultipliedAlpha?: boolean,
      stencil?: boolean
    |}): void;
  }
}
