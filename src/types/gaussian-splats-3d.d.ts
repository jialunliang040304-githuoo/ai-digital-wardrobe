/**
 * @mkkellogg/gaussian-splats-3d 类型声明
 */

declare module '@mkkellogg/gaussian-splats-3d' {
  export enum SceneRevealMode {
    Default = 0,
    Gradual = 1,
    Instant = 2
  }

  export enum LogLevel {
    None = 0,
    Info = 1,
    Debug = 2
  }

  export enum RenderMode {
    Always = 0,
    OnChange = 1,
    Never = 2
  }

  export enum WebXRMode {
    None = 0,
    VR = 1,
    AR = 2
  }

  export interface ViewerOptions {
    cameraUp?: [number, number, number];
    initialCameraPosition?: [number, number, number];
    initialCameraLookAt?: [number, number, number];
    rootElement?: HTMLElement;
    selfDrivenMode?: boolean;
    useBuiltInControls?: boolean;
    gpuAcceleratedSort?: boolean;
    sharedMemoryForWorkers?: boolean;
    dynamicScene?: boolean;
    sceneRevealMode?: SceneRevealMode;
    antialiased?: boolean;
    sphericalHarmonicsDegree?: number;
    logLevel?: LogLevel;
    renderMode?: RenderMode;
    webXRMode?: WebXRMode;
    renderer?: any;
    camera?: any;
    threeScene?: any;
    ignoreDevicePixelRatio?: boolean;
    integerBasedSort?: boolean;
    halfPrecisionCovariancesOnGPU?: boolean;
    focalAdjustment?: number;
    enableSIMDInSort?: boolean;
    enableOptionalEffects?: boolean;
    inMemoryCompressionLevel?: number;
    freeIntermediateSplatData?: boolean;
  }

  export interface SplatSceneOptions {
    format?: string;
    splatAlphaRemovalThreshold?: number;
    showLoadingUI?: boolean;
    position?: [number, number, number];
    rotation?: [number, number, number, number];
    scale?: [number, number, number];
    progressiveLoad?: boolean;
    onProgress?: (progress: number) => void;
  }

  export class Viewer {
    constructor(options?: ViewerOptions);
    addSplatScene(path: string, options?: SplatSceneOptions): Promise<void>;
    addSplatScenes(scenes: Array<{ path: string } & SplatSceneOptions>): Promise<void>;
    removeSplatScene(index: number): void;
    start(): void;
    stop(): void;
    update(): void;
    render(): void;
    dispose(): void;
    setCamera(position: [number, number, number], lookAt: [number, number, number]): void;
    getCamera(): any;
    getRenderer(): any;
    getScene(): any;
  }

  export class DropInViewer extends Viewer {
    constructor(options?: ViewerOptions);
  }
}
