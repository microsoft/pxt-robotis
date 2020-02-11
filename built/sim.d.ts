/// <reference path="../node_modules/pxt-core/built/pxtsim.d.ts" />
/// <reference path="../node_modules/pxt-core/localtypings/pxtarget.d.ts" />
/// <reference path="common-sim.d.ts" />
/// <reference path="../libs/core/dal.d.ts" />
/// <reference path="../libs/core/enums.d.ts" />
declare namespace pxsim {
    let pinIds: Map<number>;
    function pinByName(name: string): Pin;
    class DalBoard extends CoreBoard implements MusicBoard, LightBoard, CapTouchBoard, AccelerometerBoard, StorageBoard, JacDacBoard, LightSensorBoard, TemperatureBoard, MicrophoneBoard, ScreenBoard, InfraredBoard, LCDBoard {
        boardDefinition: BoardDefinition;
        viewHost: visuals.BoardHost;
        view: SVGElement;
        edgeConnectorState: EdgeConnectorState;
        lightSensorState: AnalogSensorState;
        buttonState: CommonButtonState;
        lightState: pxt.Map<CommonNeoPixelState>;
        audioState: AudioState;
        neopixelPin: Pin;
        touchButtonState: TouchButtonState;
        accelerometerState: AccelerometerState;
        storageState: StorageState;
        jacdacState: JacDacState;
        thermometerState: AnalogSensorState;
        thermometerUnitState: TemperatureUnit;
        microphoneState: AnalogSensorState;
        screenState: ScreenState;
        irState: InfraredState;
        lcdState: LCDState;
        constructor(boardDefinition: BoardDefinition);
        receiveMessage(msg: SimulatorMessage): void;
        kill(): void;
        initAsync(msg: SimulatorRunMessage): Promise<void>;
        screenshotAsync(width?: number): Promise<ImageData>;
        accelerometer(): Accelerometer;
        getDefaultPitchPin(): Pin;
        tryGetNeopixelState(pinId: number): CommonNeoPixelState;
        neopixelState(pinId: number): CommonNeoPixelState;
    }
    function initRuntimeWithDalBoard(msg: SimulatorRunMessage): void;
    function parsePinString(pinString: string): Pin;
}
declare namespace pxsim.visuals {
    const VIEW_WIDTH = 372.3404255319149;
    const VIEW_HEIGHT = 361.70212765957444;
    interface IBoardTheme {
        accent?: string;
        display?: string;
        pin?: string;
        pinTouched?: string;
        pinActive?: string;
        ledOn?: string;
        ledOff?: string;
        buttonOuter?: string;
        buttonUps: string[];
        buttonDown?: string;
        virtualButtonOuter?: string;
        virtualButtonUp?: string;
        virtualButtonDown?: string;
        lightLevelOn?: string;
        lightLevelOff?: string;
        soundLevelOn?: string;
        soundLevelOff?: string;
    }
    var themes: IBoardTheme[];
    function randomTheme(): IBoardTheme;
    type ComputedBoardDimensions = {
        scaleFn: (n: number) => number;
        height: number;
        width: number;
        xOff: number;
        yOff: number;
    };
    function getBoardDimensions(vis: BoardImageDefinition): ComputedBoardDimensions;
    interface MetroBoardProps extends GenericBoardProps {
        runtime?: pxsim.Runtime;
        theme?: IBoardTheme;
        disableTilt?: boolean;
    }
    class MetroBoardSvg extends GenericBoardSvg {
        props: MetroBoardProps;
        board: pxsim.DalBoard;
        private onBoardLeds;
        private onBoardNeopixels;
        private onBoardReset;
        private onBoardButtons;
        private onBoardTouchPads;
        constructor(props: MetroBoardProps);
        updateTheme(): void;
        updateState(): void;
        private addDefs(el);
    }
}
declare namespace pxsim.visuals {
}
declare namespace pxsim.visuals {
    class ButtonView implements IBoardPart<CommonButtonState> {
        element: SVGElement;
        defs: SVGElement[];
        style: string;
        private state;
        private bus;
        private btn;
        private pinId;
        private button;
        init(bus: EventBus, state: CommonButtonState, svgEl: SVGSVGElement, otherParams: Map<string>): void;
        moveToCoord(xy: Coord): void;
        updateState(): void;
        updateTheme(): void;
        private mkBtn();
        private attachEvents();
    }
}
declare namespace pxsim.visuals {
    function mkNeoPixelPart(xy?: Coord): SVGElAndSize;
    class NeoPixel {
        el: SVGElement;
        cy: number;
        constructor(xy?: Coord);
        setRgb(rgb: [number, number, number]): void;
    }
    class NeoPixelCanvas {
        canvas: SVGSVGElement;
        pin: number;
        pixels: NeoPixel[];
        private viewBox;
        private background;
        constructor(pin: number);
        private updateViewBox(x, y, w, h);
        update(colors: number[][]): void;
        setLoc(xy: Coord): void;
    }
    class NeoPixelView implements IBoardPart<CommonNeoPixelStateConstructor> {
        style: string;
        element: SVGElement;
        overElement: SVGElement;
        defs: SVGElement[];
        private state;
        private canvas;
        private part;
        private stripGroup;
        private lastLocation;
        private pin;
        init(bus: EventBus, state: CommonNeoPixelStateConstructor, svgEl: SVGSVGElement, otherParams: Map<string>): void;
        moveToCoord(xy: Coord): void;
        private updateStripLoc();
        updateState(): void;
        updateTheme(): void;
    }
}
