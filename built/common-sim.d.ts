/// <reference path="../node_modules/pxt-core/built/pxtsim.d.ts" />
/// <reference path="../libs/core/dal.d.ts" />
declare namespace pxsim.input {
    function onGesture(gesture: number, handler: RefAction): void;
    function rotation(kind: number): number;
    function setAccelerometerRange(range: number): void;
    function acceleration(dimension: number): number;
}
declare namespace pxsim {
    /**
      * Co-ordinate systems that can be used.
      * RAW: Unaltered data. Data will be returned directly from the accelerometer.
      *
      * SIMPLE_CARTESIAN: Data will be returned based on an easy to understand alignment, consistent with the cartesian system taught in schools.
      * When held upright, facing the user:
      *
      *                            /
      *    +--------------------+ z
      *    |                    |
      *    |       .....        |
      *    | *     .....      * |
      * ^  |       .....        |
      * |  |                    |
      * y  +--------------------+  x-->
      *
      *
      * NORTH_EAST_DOWN: Data will be returned based on the industry convention of the North East Down (NED) system.
      * When held upright, facing the user:
      *
      *                            z
      *    +--------------------+ /
      *    |                    |
      *    |       .....        |
      *    | *     .....      * |
      * ^  |       .....        |
      * |  |                    |
      * x  +--------------------+  y-->
      *
      */
    enum MicroBitCoordinateSystem {
        RAW = 0,
        SIMPLE_CARTESIAN = 1,
        NORTH_EAST_DOWN = 2,
    }
    class Accelerometer {
        runtime: Runtime;
        private sigma;
        private lastGesture;
        private currentGesture;
        private sample;
        private shake;
        private pitch;
        private roll;
        private id;
        isActive: boolean;
        sampleRange: number;
        constructor(runtime: Runtime);
        setSampleRange(range: number): void;
        activate(): void;
        /**
         * Reads the acceleration data from the accelerometer, and stores it in our buffer.
         * This is called by the tick() member function, if the interrupt is set!
         */
        update(x: number, y: number, z: number): void;
        instantaneousAccelerationSquared(): number;
        /**
         * Service function. Determines the best guess posture of the device based on instantaneous data.
         * This makes no use of historic data (except for shake), and forms this input to the filter implemented in updateGesture().
         *
         * @return A best guess of the current posture of the device, based on instantaneous data.
         */
        private instantaneousPosture();
        updateGesture(): void;
        /**
          * Reads the X axis value of the latest update from the accelerometer.
          * @param system The coordinate system to use. By default, a simple cartesian system is provided.
          * @return The force measured in the X axis, in milli-g.
          *
          * Example:
          * @code
          * uBit.accelerometer.getX();
          * uBit.accelerometer.getX(RAW);
          * @endcode
          */
        getX(system?: MicroBitCoordinateSystem): number;
        /**
          * Reads the Y axis value of the latest update from the accelerometer.
          * @param system The coordinate system to use. By default, a simple cartesian system is provided.
          * @return The force measured in the Y axis, in milli-g.
          *
          * Example:
          * @code
          * uBit.accelerometer.getY();
          * uBit.accelerometer.getY(RAW);
          * @endcode
          */
        getY(system?: MicroBitCoordinateSystem): number;
        /**
          * Reads the Z axis value of the latest update from the accelerometer.
          * @param system The coordinate system to use. By default, a simple cartesian system is provided.
          * @return The force measured in the Z axis, in milli-g.
          *
          * Example:
          * @code
          * uBit.accelerometer.getZ();
          * uBit.accelerometer.getZ(RAW);
          * @endcode
          */
        getZ(system?: MicroBitCoordinateSystem): number;
        /**
          * Provides a rotation compensated pitch of the device, based on the latest update from the accelerometer.
          * @return The pitch of the device, in degrees.
          *
          * Example:
          * @code
          * uBit.accelerometer.getPitch();
          * @endcode
          */
        getPitch(): number;
        getPitchRadians(): number;
        /**
          * Provides a rotation compensated roll of the device, based on the latest update from the accelerometer.
          * @return The roll of the device, in degrees.
          *
          * Example:
          * @code
          * uBit.accelerometer.getRoll();
          * @endcode
          */
        getRoll(): number;
        getRollRadians(): number;
        /**
         * Recalculate roll and pitch values for the current sample.
         * We only do this at most once per sample, as the necessary trigonemteric functions are rather
         * heavyweight for a CPU without a floating point unit...
         */
        recalculatePitchRoll(): void;
    }
    class AccelerometerState {
        accelerometer: Accelerometer;
        useShake: boolean;
        private tiltDecayer;
        private element;
        constructor(runtime: Runtime);
        attachEvents(element: HTMLElement | SVGElement): void;
        private updateTilt();
    }
}
declare namespace pxsim {
    interface AccelerometerBoard extends CommonBoard {
        accelerometerState: AccelerometerState;
        invertAccelerometerXAxis?: boolean;
        invertAccelerometerYAxis?: boolean;
        invertAccelerometerZAxis?: boolean;
    }
    function accelerometer(): AccelerometerState;
}
declare namespace pxsim {
    interface EdgeConnectorBoard {
        edgeConnectorState: EdgeConnectorState;
    }
}
declare namespace pxsim.pxtcore {
    function getPin(id: number): pxsim.Pin;
    function lookupPinCfg(key: number): pxsim.Pin;
    function getPinCfg(key: number): pxsim.Pin;
}
declare namespace pxsim.pxtcore {
    function registerWithDal(id: number, evid: number, handler: RefAction, mode?: number): void;
    function deepSleep(): void;
}
declare namespace pxsim.control {
    let runInParallel: typeof thread.runInBackground;
    let delay: typeof thread.pause;
    function reset(): void;
    function waitMicros(micros: number): void;
    function deviceName(): string;
    function _ramSize(): number;
    function deviceSerialNumber(): number;
    function deviceLongSerialNumber(): RefBuffer;
    function deviceDalVersion(): string;
    function internalOnEvent(id: number, evid: number, handler: RefAction): void;
    function waitForEvent(id: number, evid: number): void;
    function allocateNotifyEvent(): number;
    function raiseEvent(id: number, evid: number, mode: number): void;
    function millis(): number;
    function micros(): number;
    function delayMicroseconds(us: number): void;
    function createBuffer(size: number): RefBuffer;
    function dmesg(msg: string): void;
    function setDebugFlags(flags: number): void;
    function heapSnapshot(): void;
    function dmesgPtr(msg: string, ptr: any): void;
    function dmesgValue(ptr: any): void;
    function gc(): void;
    function profilingEnabled(): boolean;
    function __log(priority: number, str: string): void;
    function heapDump(): void;
    function isUSBInitialized(): boolean;
}
declare namespace pxsim {
    const enum PXT_PANIC {
        PANIC_CODAL_OOM = 20,
        PANIC_GC_OOM = 21,
        PANIC_GC_TOO_BIG_ALLOCATION = 22,
        PANIC_CODAL_HEAP_ERROR = 30,
        PANIC_CODAL_NULL_DEREFERENCE = 40,
        PANIC_CODAL_USB_ERROR = 50,
        PANIC_CODAL_HARDWARE_CONFIGURATION_ERROR = 90,
        PANIC_INVALID_BINARY_HEADER = 901,
        PANIC_OUT_OF_BOUNDS = 902,
        PANIC_REF_DELETED = 903,
        PANIC_SIZE = 904,
        PANIC_INVALID_VTABLE = 905,
        PANIC_INTERNAL_ERROR = 906,
        PANIC_NO_SUCH_CONFIG = 907,
        PANIC_NO_SUCH_PIN = 908,
        PANIC_INVALID_ARGUMENT = 909,
        PANIC_MEMORY_LIMIT_EXCEEDED = 910,
        PANIC_SCREEN_ERROR = 911,
        PANIC_MISSING_PROPERTY = 912,
        PANIC_INVALID_IMAGE = 913,
        PANIC_CALLED_FROM_ISR = 914,
        PANIC_HEAP_DUMPED = 915,
        PANIC_CAST_FIRST = 980,
        PANIC_CAST_FROM_UNDEFINED = 980,
        PANIC_CAST_FROM_BOOLEAN = 981,
        PANIC_CAST_FROM_NUMBER = 982,
        PANIC_CAST_FROM_STRING = 983,
        PANIC_CAST_FROM_OBJECT = 984,
        PANIC_CAST_FROM_FUNCTION = 985,
        PANIC_CAST_FROM_NULL = 989,
    }
}
declare namespace pxsim {
    interface CommonBoard extends CoreBoard, EdgeConnectorBoard {
        buttonState: CommonButtonState;
        edgeConnectorState: EdgeConnectorState;
    }
    function board(): CommonBoard;
}
declare namespace pxsim.loops {
    let pause: typeof thread.pause;
    let forever: typeof thread.forever;
}
declare namespace pxsim {
    class CommonButton extends Button {
        private _pressedTime;
        private _clickedTime;
        private _wasPressed;
        setPressed(p: boolean): void;
        wasPressed(): boolean;
        pressureLevel(): 0 | 512;
        isPressed(): boolean;
    }
    class CommonButtonState {
        usesButtonAB: boolean;
        buttons: CommonButton[];
        buttonsByPin: Map<CommonButton>;
        constructor(buttons?: CommonButton[]);
    }
}
declare namespace pxsim.pxtcore {
    function getButtonByPin(pinId: number): CommonButton;
    function getButtonByPinCfg(key: number): CommonButton;
    function getButton(buttonId: number): CommonButton;
}
declare namespace pxsim.ButtonMethods {
    function onEvent(button: pxsim.Button, ev: number, body: pxsim.RefAction): void;
    function isPressed(button: pxsim.Button): boolean;
    function pressureLevel(button: pxsim.Button): number;
    function wasPressed(button: pxsim.Button): boolean;
    function id(button: pxsim.Button): number;
}
declare namespace pxsim.DigitalInOutPinMethods {
    function pushButton(pin: pins.DigitalInOutPin): Button;
}
declare namespace pxsim.network {
    function cableSendPacket(buf: RefBuffer): void;
    function cablePacket(): RefBuffer;
    function onCablePacket(body: RefAction): void;
    function onCableError(body: RefAction): void;
}
declare namespace pxsim {
    class CableState {
        packet: RefBuffer;
        packetReceived: boolean;
        PULSE_CABLE_COMPONENT_ID: number;
        PULSE_PACKET_EVENT: number;
        PULSE_PACKET_ERROR_EVENT: number;
        send(buf: RefBuffer): void;
        listen(body: RefAction): void;
        listenError(body: RefAction): void;
        receive(buf: RefBuffer): void;
    }
    interface CableBoard extends CommonBoard {
        cableState: CableState;
    }
    function getCableState(): CableState;
}
declare namespace pxsim {
    class AnalogSensorState {
        id: number;
        private min;
        private max;
        private lowThreshold;
        private highThreshold;
        sensorUsed: boolean;
        private level;
        private state;
        constructor(id: number, min?: number, max?: number, lowThreshold?: number, highThreshold?: number);
        setUsed(): void;
        setLevel(level: number): void;
        getLevel(): number;
        setLowThreshold(value: number): void;
        setHighThreshold(value: number): void;
        private clampValue(value);
        private setState(state);
    }
}
declare namespace pxsim.visuals {
    function mkBtnSvg(xy: Coord): SVGAndSize<SVGGElement>;
    const BUTTON_PAIR_STYLE: string;
    class ButtonPairView implements IBoardPart<ButtonPairState> {
        element: SVGElement;
        defs: SVGElement[];
        style: string;
        private state;
        private bus;
        private aBtn;
        private bBtn;
        private abBtn;
        init(bus: EventBus, state: ButtonPairState): void;
        moveToCoord(xy: Coord): void;
        updateState(): void;
        updateTheme(): void;
        private mkBtns();
        private attachEvents();
    }
}
declare namespace pxsim {
    enum PinFlags {
        Unused = 0,
        Digital = 1,
        Analog = 2,
        Input = 4,
        Output = 8,
        Touch = 16,
    }
    class Pin {
        id: number;
        constructor(id: number);
        touched: boolean;
        value: number;
        period: number;
        servoAngle: number;
        mode: PinFlags;
        pitch: boolean;
        pull: number;
        eventMode: number;
        used: boolean;
        setValue(value: number): void;
        digitalReadPin(): number;
        digitalWritePin(value: number): void;
        setPull(pull: number): void;
        analogReadPin(): number;
        analogWritePin(value: number): void;
        analogSetPeriod(micros: number): void;
        servoWritePin(value: number): void;
        servoSetPulse(pinId: number, micros: number): void;
        isTouched(): boolean;
        onEvent(ev: number, handler: RefAction): void;
    }
    class SerialDevice {
        tx: pins.DigitalInOutPin;
        rx: pins.DigitalInOutPin;
        private id;
        private baudRate;
        private rxBuffer;
        private txBuffer;
        constructor(tx: pins.DigitalInOutPin, rx: pins.DigitalInOutPin, id: number);
        setTxBufferSize(size: number): void;
        setRxBufferSize(size: number): void;
        read(): number;
        readBuffer(): RefBuffer;
        writeBuffer(buffer: any): void;
        setBaudRate(rate: number): void;
        redirect(tx: pins.DigitalInOutPin, rx: pins.DigitalInOutPin, rate: number): void;
        onEvent(event: number, handler: RefAction): void;
        onDelimiterReceived(delimiter: number, handler: RefAction): void;
    }
    class SPI {
        mosi: pins.DigitalInOutPin;
        miso: pins.DigitalInOutPin;
        sck: pins.DigitalInOutPin;
        frequency: number;
        mode: number;
        constructor(mosi: pins.DigitalInOutPin, miso: pins.DigitalInOutPin, sck: pins.DigitalInOutPin);
        write(value: number): number;
        transfer(command: RefBuffer, response: RefBuffer): void;
        setFrequency(frequency: number): void;
        setMode(mode: number): void;
    }
    class I2C {
        sda: pins.DigitalInOutPin;
        scl: pins.DigitalInOutPin;
        constructor(sda: pins.DigitalInOutPin, scl: pins.DigitalInOutPin);
        readBuffer(address: number, size: number, repeat?: boolean): RefBuffer;
        writeBuffer(address: number, buf: RefBuffer, repeat?: boolean): number;
    }
    interface EdgeConnectorProps {
        pins: number[];
        servos?: {
            [name: string]: number;
        };
    }
    class EdgeConnectorState {
        props: EdgeConnectorProps;
        pins: Pin[];
        private _i2cs;
        private _spis;
        private _serials;
        constructor(props: EdgeConnectorProps);
        getPin(id: number): Pin;
        createI2C(sda: pins.DigitalInOutPin, scl: pins.DigitalInOutPin): I2C;
        createSPI(mosi: pins.DigitalInOutPin, miso: pins.DigitalInOutPin, sck: pins.DigitalInOutPin): SPI;
        createSerialDevice(tx: pins.DigitalInOutPin, rx: pins.DigitalInOutPin, id: number): SerialDevice;
    }
}
declare namespace pxsim.configStorage {
    function setBuffer(key: string, value: RefBuffer): void;
    function getBuffer(key: string): RefBuffer;
    function removeItem(key: string): void;
    function clear(): void;
}
declare namespace pxsim.visuals {
    function mkLedPart(xy?: Coord): SVGElAndSize;
    class LedView implements IBoardPart<EdgeConnectorState> {
        element: SVGElement;
        defs: SVGElement[];
        private led;
        private text;
        private parsePinString;
        private color;
        private part;
        private bus;
        style: string;
        private state;
        private pin;
        private currentValue;
        private currentMode;
        constructor(parsePinString: (s: string) => Pin);
        init(bus: EventBus, state: EdgeConnectorState, svgEl: SVGSVGElement, otherParams: Map<string>): void;
        initDom(): void;
        moveToCoord(xy: Coord): void;
        updateTheme(): void;
        updateState(): void;
    }
}
declare namespace pxsim.visuals {
    function mkMicroServoPart(xy?: Coord): SVGElAndSize;
    class MicroServoView implements IBoardPart<EdgeConnectorState> {
        style: string;
        overElement: SVGElement;
        element: SVGElement;
        defs: SVGElement[];
        state: EdgeConnectorState;
        bus: EventBus;
        private currentAngle;
        private targetAngle;
        private lastAngleTime;
        private pin;
        private crankEl;
        private crankTransform;
        init(bus: EventBus, state: EdgeConnectorState, svgEl: SVGSVGElement, otherParams: Map<string>): void;
        initDom(): void;
        moveToCoord(xy: visuals.Coord): void;
        updateState(): void;
        updateTheme(): void;
    }
}
declare namespace pxsim {
    class CommonNeoPixelState {
        buffer: Uint8Array;
        mode: number;
        readonly length: number;
        readonly stride: number;
        pixelColor(pixel: number): number[];
    }
    interface CommonNeoPixelStateConstructor {
        (pin: Pin): CommonNeoPixelState;
    }
}
declare namespace pxsim.light {
    function sendBuffer(pin: pins.DigitalInOutPin, clk: pins.DigitalInOutPin, mode: number, b: RefBuffer): void;
}
declare namespace pxsim.visuals {
    function mkPhotoCellPart(xy?: Coord): SVGElAndSize;
    class PhotoCellView implements IBoardPart<EdgeConnectorState> {
        element: SVGElement;
        defs: SVGElement[];
        private text;
        private parsePinString;
        private color;
        private part;
        private bus;
        style: string;
        private pin;
        private currentValue;
        private currentMode;
        constructor(parsePinString: (s: string) => Pin);
        init(bus: EventBus, state: EdgeConnectorState, svgEl: SVGSVGElement, otherParams: Map<string>): void;
        initDom(): void;
        moveToCoord(xy: Coord): void;
        updateTheme(): void;
        updateState(): void;
    }
}
declare namespace pxsim.pins {
    class CommonPin extends Pin {
    }
    class DigitalInOutPin extends CommonPin {
    }
    class AnalogInOutPin extends CommonPin {
    }
    class PwmOnlyPin extends CommonPin {
    }
    class PwmPin extends CommonPin {
    }
    function markUsed(pin: Pin): void;
}
declare namespace pxsim.DigitalInOutPinMethods {
    function digitalRead(name: pins.DigitalInOutPin): number;
    /**
    * Set a pin or connector value to either 0 or 1.
    * @param value value to set on the pin, 1 eg,0
    */
    function digitalWrite(name: pins.DigitalInOutPin, value: number): void;
    /**
    * Configures this pin to a digital input, and generates events where the timestamp is the duration
    * that this pin was either ``high`` or ``low``.
    */
    function onPulsed(name: pins.DigitalInOutPin, high: boolean, body: RefAction): void;
    function onEvent(name: pins.DigitalInOutPin, ev: number, body: RefAction): void;
    /**
    * Returns the duration of a pulse in microseconds
    * @param value the value of the pulse (default high)
    * @param maximum duration in micro-seconds
    */
    function pulseIn(name: pins.DigitalInOutPin, high: boolean, maxDuration?: number): number;
    /**
    * Configures the pull of this pin.
    * @param pull one of the mbed pull configurations: PullUp, PullDown, PullNone
    */
    function setPull(name: pins.DigitalInOutPin, pull: number): void;
    /**
     * Get the pin state (pressed or not). Requires to hold the ground to close the circuit.
     * @param name pin used to detect the touch
     */
    function isPressed(name: pins.DigitalInOutPin): boolean;
}
declare namespace pxsim.AnalogInPinMethods {
    /**
     * Read the connector value as analog, that is, as a value comprised between 0 and 1023.
     */
    function analogRead(name: pins.AnalogInOutPin): number;
}
declare namespace pxsim.AnalogOutPinMethods {
    /**
 * Set the connector value as analog. Value must be comprised between 0 and 1023.
 * @param value value to write to the pin between ``0`` and ``1023``. eg:1023,0
 */
    function analogWrite(name: pins.AnalogInOutPin, value: number): void;
}
declare namespace pxsim.PwmOnlyPinMethods {
    function analogSetPeriod(name: pins.PwmOnlyPin, micros: number): void;
    function servoWrite(name: pins.PwmOnlyPin, value: number): void;
    function servoSetPulse(name: pins.PwmOnlyPin, micros: number): void;
}
declare namespace pxsim.pins {
    function pinByCfg(key: number): Pin;
    function pulseDuration(): number;
    function createBuffer(sz: number): RefBuffer;
    function createI2C(sda: DigitalInOutPin, scl: DigitalInOutPin): I2C;
    function createSPI(mosi: DigitalInOutPin, miso: DigitalInOutPin, sck: DigitalInOutPin): SPI;
}
declare namespace pxsim.I2CMethods {
    function readBuffer(i2c: I2C, address: number, size: number, repeat?: boolean): RefBuffer;
    function writeBuffer(i2c: I2C, address: number, buf: RefBuffer, repeat?: boolean): number;
}
declare namespace pxsim.SPIMethods {
    function write(device: pxsim.SPI, value: number): number;
    function transfer(device: pxsim.SPI, command: RefBuffer, response: RefBuffer): void;
    function setFrequency(device: pxsim.SPI, frequency: number): void;
    function setMode(device: pxsim.SPI, mode: number): void;
}
declare namespace pxsim.SerialDeviceMethods {
    function setTxBufferSize(device: SerialDevice, size: number): void;
    function setRxBufferSize(device: SerialDevice, size: number): void;
    function read(device: SerialDevice): number;
    function readBuffer(device: SerialDevice): RefBuffer;
    function writeBuffer(device: SerialDevice, buffer: RefBuffer): void;
    function setBaudRate(device: SerialDevice, rate: number): void;
    function redirect(device: SerialDevice, tx: pins.DigitalInOutPin, rx: pins.DigitalInOutPin, rate: number): void;
    function onEvent(device: SerialDevice, event: number, handler: RefAction): void;
    function onDelimiterReceived(device: SerialDevice, delimiter: number, handler: RefAction): void;
}
declare namespace pxsim.serial {
    function internalCreateSerialDevice(tx: pins.DigitalInOutPin, rx: pins.DigitalInOutPin, id: number): SerialDevice;
}
declare namespace pxsim {
    interface LightBoard extends CommonBoard {
        tryGetNeopixelState(pinId: number): CommonNeoPixelState;
        neopixelState(pinId: number): CommonNeoPixelState;
    }
    function neopixelState(pinId: number): CommonNeoPixelState;
}
declare namespace pxsim.visuals {
    function mkSideSwitchPart(xy?: Coord): SVGElAndSize;
    class ToggleComponentVisual implements IBoardPart<ToggleStateConstructor> {
        style: string;
        element: SVGElement;
        overElement: SVGElement;
        defs: SVGElement[];
        private onElement;
        private offElement;
        private state;
        private currentlyOn;
        private parsePinString;
        constructor(parsePinString: (str: string) => Pin);
        moveToCoord(xy: Coord): void;
        init(bus: EventBus, state: ToggleStateConstructor, svgEl: SVGSVGElement, otherParams: Map<string>): void;
        updateState(): void;
        updateTheme(): void;
        private initImage(svgData);
    }
}
declare namespace pxsim {
    class ToggleState {
        private pin;
        constructor(pin: Pin);
        toggle(): void;
        on(): boolean;
    }
    interface ToggleStateConstructor {
        (pin: Pin): ToggleState;
    }
}
declare namespace pxsim.info {
}
declare namespace pxsim.gamepad {
    function setButton(index: number, up: boolean): void;
    function move(index: number, x: number, y: number): void;
    function setThrottle(index: number, value: number): void;
}
declare namespace pxsim {
}
declare namespace pxsim.network {
    function infraredSendPacket(buf: RefBuffer): void;
    function infraredPacket(): RefBuffer;
    function onInfraredPacket(body: RefAction): void;
    function onInfraredError(body: RefAction): void;
}
declare namespace pxsim {
    class InfraredState {
        packet: RefBuffer;
        packetReceived: boolean;
        IR_COMPONENT_ID: number;
        IR_PACKET_EVENT: number;
        IR_PACKET_ERROR_EVENT: number;
        send(buf: RefBuffer): void;
        listen(body: RefAction): void;
        listenError(body: RefAction): void;
        receive(buf: Uint8Array): void;
    }
    interface InfraredBoard extends CommonBoard {
        irState: InfraredState;
    }
    function getInfraredState(): InfraredState;
}
declare namespace pxsim {
    interface SimulatorJacDacMessage extends SimulatorBroadcastMessage {
        type: "jacdac";
        broadcast: true;
        packet: Uint8Array;
    }
    class JacDacState {
        eventId: number;
        board: BaseBoard;
        running: boolean;
        private packetQueue;
        constructor(board: BaseBoard);
        start(): void;
        stop(): void;
        isConnected(): boolean;
        isRunning(): boolean;
        getState(): number;
        getPacket(): RefBuffer;
        sendPacket(buf: RefBuffer): void;
        processMessage(msg: pxsim.SimulatorMessage): void;
        getDiagnostics(): RefBuffer;
    }
    interface JacDacBoard extends CommonBoard {
        jacdacState: JacDacState;
    }
    function getJacDacState(): JacDacState;
}
declare namespace pxsim.jacdac {
    /**
     * Gets the physical layer component id
     **/
    function __physId(): number;
    /**
     * Write a buffer to the jacdac physical layer.
     **/
    function __physSendPacket(buf: RefBuffer): void;
    /**
     * Reads a packet from the queue. NULL if queue is empty
     **/
    function __physGetPacket(): RefBuffer;
    /**
     * Returns the connection state of the JACDAC physical layer.
     **/
    function __physIsConnected(): boolean;
    /**
     * Indicates if the bus is running
     **/
    function __physIsRunning(): boolean;
    /**
     * Starts the JACDAC physical layer.
     **/
    function __physStart(): void;
    /**
     * Stops the JACDAC physical layer.
     **/
    function __physStop(): void;
    function __physGetDiagnostics(): RefBuffer;
}
declare namespace pxsim.keyboard {
    function __type(s: string): void;
    function __key(c: string, event: number): void;
    function __mediaKey(key: number, event: number): void;
    function __functionKey(key: number, event: number): void;
}
declare namespace pxsim {
    class LCDState {
        lines: number;
        columns: number;
        cursorPos: [number, number];
        text: string[];
        backLightColor: string;
        cursor: boolean;
        display: boolean;
        blink: boolean;
        sensorUsed: boolean;
        constructor(lines?: number, columns?: number);
        clear(): void;
        setUsed(): void;
    }
    interface LCDBoard extends CommonBoard {
        lcdState: LCDState;
    }
    function lcdState(): LCDState;
}
declare namespace pxsim.lcd {
    function __write8(value: number, char_mode: boolean): void;
}
declare namespace pxsim.visuals {
    function mkLCDPart(xy?: Coord): SVGElAndSize;
    class LCDView implements IBoardPart<LCDState> {
        style: string;
        element: SVGElement;
        defs: SVGElement[];
        image: SVGSVGElement;
        private backlight;
        private screen;
        private part;
        private bus;
        private state;
        constructor();
        init(bus: EventBus, state: LCDState, svgEl: SVGSVGElement, otherParams: Map<string>): void;
        initDom(): void;
        setChar(column: number, line: number, value: string): void;
        moveToCoord(xy: Coord): void;
        updateTheme(): void;
        updateState(): void;
    }
}
declare namespace pxsim.input {
    function lightLevel(): number;
    function onLightConditionChanged(condition: number, body: RefAction): void;
    function setLightThreshold(condition: number, value: number): void;
}
declare namespace pxsim {
    interface LightSensorBoard extends CommonBoard {
        lightSensorState: AnalogSensorState;
    }
    function lightSensorState(): AnalogSensorState;
}
declare namespace pxsim.input {
    function soundLevel(): number;
    function onLoudSound(body: RefAction): void;
    function setLoudSoundThreshold(value: number): void;
}
declare namespace pxsim {
    interface MicrophoneBoard extends CommonBoard {
        microphoneState: AnalogSensorState;
    }
    function microphoneState(): AnalogSensorState;
}
declare namespace pxsim.music {
    function playInstructions(b: RefBuffer): Promise<void>;
    function queuePlayInstructions(when: number, b: RefBuffer): void;
    function stopPlaying(): void;
    function forceOutput(mode: number): void;
}
declare namespace pxsim.mouse {
    function setButton(button: number, down: boolean): void;
    function move(x: number, y: number): void;
    function turnWheel(w: number): void;
}
declare namespace pxsim {
    class AudioState {
        private playing;
        outputDestination_: number;
        pitchPin_: Pin;
        volume: number;
        constructor();
        startPlaying(): void;
        stopPlaying(): void;
        isPlaying(): boolean;
    }
}
declare namespace pxsim.music {
    function noteFrequency(note: number): number;
    function setOutput(mode: number): void;
    function setVolume(volume: number): void;
    function setPitchPin(pin: Pin): void;
    function setTone(buffer: RefBuffer): void;
    function enableAmp(enabled: number): void;
    function playTone(frequency: number, ms: number): void;
}
declare namespace pxsim {
    interface MusicBoard extends CommonBoard {
        audioState: AudioState;
        getDefaultPitchPin(): Pin;
    }
    function getAudioState(): AudioState;
}
declare namespace pxsim.encoders {
    function createRotaryEncoder(pinA: Pin, pinB: Pin): RotaryEncoder;
    class RotaryEncoder {
        pinA: Pin;
        pinB: Pin;
        position: number;
        constructor(pinA: Pin, pinB: Pin, position: number);
        readonly id: number;
        onChanged(handler: RefAction): void;
    }
}
declare namespace pxsim.RotaryEncoderMethods {
    function onChanged(encoder: pxsim.encoders.RotaryEncoder, handler: RefAction): void;
    function position(encoder: pxsim.encoders.RotaryEncoder): number;
}
declare namespace pxsim {
    class RefImage extends RefObject {
        _width: number;
        _height: number;
        _bpp: number;
        data: Uint8Array;
        dirty: boolean;
        isStatic: boolean;
        constructor(w: number, h: number, bpp: number);
        scan(mark: (path: string, v: any) => void): void;
        gcKey(): string;
        gcSize(): number;
        gcIsStatic(): boolean;
        pix(x: number, y: number): number;
        inRange(x: number, y: number): boolean;
        color(c: number): number;
        clamp(x: number, y: number): number[];
        makeWritable(): void;
        toDebugString(): string;
    }
}
declare namespace pxsim.ImageMethods {
    function width(img: RefImage): number;
    function height(img: RefImage): number;
    function isMono(img: RefImage): boolean;
    function setPixel(img: RefImage, x: number, y: number, c: number): void;
    function getPixel(img: RefImage, x: number, y: number): number;
    function fill(img: RefImage, c: number): void;
    function fillRect(img: RefImage, x: number, y: number, w: number, h: number, c: number): void;
    function _fillRect(img: RefImage, xy: number, wh: number, c: number): void;
    function mapRect(img: RefImage, x: number, y: number, w: number, h: number, c: RefBuffer): void;
    function _mapRect(img: RefImage, xy: number, wh: number, c: RefBuffer): void;
    function equals(img: RefImage, other: RefImage): boolean;
    function getRows(img: RefImage, x: number, dst: RefBuffer): void;
    function setRows(img: RefImage, x: number, src: RefBuffer): void;
    function clone(img: RefImage): RefImage;
    function flipX(img: RefImage): void;
    function flipY(img: RefImage): void;
    function transposed(img: RefImage): RefImage;
    function copyFrom(img: RefImage, from: RefImage): void;
    function scroll(img: RefImage, dx: number, dy: number): void;
    function replace(img: RefImage, from: number, to: number): void;
    function doubledX(img: RefImage): RefImage;
    function doubledY(img: RefImage): RefImage;
    function doubled(img: RefImage): RefImage;
    function drawImage(img: RefImage, from: RefImage, x: number, y: number): void;
    function drawTransparentImage(img: RefImage, from: RefImage, x: number, y: number): void;
    function overlapsWith(img: RefImage, other: RefImage, x: number, y: number): boolean;
    function _drawLine(img: RefImage, xy: number, wh: number, c: number): void;
    function drawLine(img: RefImage, x0: number, y0: number, x1: number, y1: number, c: number): void;
    function drawIcon(img: RefImage, icon: RefBuffer, x: number, y: number, color: number): void;
    function _drawIcon(img: RefImage, icon: RefBuffer, xy: number, color: number): void;
    function fillCircle(img: RefImage, cx: number, cy: number, r: number, c: number): void;
    function _fillCircle(img: RefImage, cxy: number, r: number, c: number): void;
    function _blitRow(img: RefImage, xy: number, from: RefImage, xh: number): void;
    function blitRow(img: RefImage, x: number, y: number, from: RefImage, fromX: number, fromH: number): void;
}
declare namespace pxsim.image {
    function byteHeight(h: number, bpp: number): number;
    function bufW(data: Uint8Array): number;
    function bufH(data: Uint8Array): number;
    function isValidImage(buf: RefBuffer): boolean;
    function create(w: number, h: number): RefImage;
    function ofBuffer(buf: RefBuffer): RefImage;
    function toBuffer(img: RefImage): RefBuffer;
    function doubledIcon(buf: RefBuffer): RefBuffer;
}
declare namespace pxsim.pxtcore {
    function updateScreen(img: RefImage): void;
    function updateStats(s: string): void;
    function setPalette(b: RefBuffer): void;
    function setupScreenStatusBar(barHeight: number): void;
    function updateScreenStatusBar(img: RefImage): void;
    function setScreenBrightness(b: number): void;
}
declare namespace pxsim {
    class ScreenState {
        width: number;
        height: number;
        screen: Uint32Array;
        palette: Uint32Array;
        lastImage: RefImage;
        lastImageFlushTime: number;
        changed: boolean;
        stats: string;
        brightness: number;
        onChange: () => void;
        constructor(paletteSrc: string[], w?: number, h?: number);
        setScreenBrightness(b: number): void;
        setPalette(buf: RefBuffer): void;
        bpp(): 1 | 4;
        didChange(): boolean;
        maybeForceUpdate(): void;
        showImage(img: RefImage): void;
        updateStats(stats: string): void;
        bindToSvgImage(lcd: SVGImageElement): void;
        setupScreenStatusBar(barHeight: number): void;
        updateScreenStatusBar(img: RefImage): void;
    }
    interface ScreenBoard extends CommonBoard {
        screenState: ScreenState;
    }
    function getScreenState(): ScreenState;
}
declare namespace pxsim.visuals {
    function mkScreenPart(xy?: Coord): SVGElAndSize;
    class ScreenView implements IBoardPart<ScreenState> {
        bus: pxsim.EventBus;
        style: string;
        element: SVGElement;
        overElement?: SVGElement;
        defs: SVGElement[];
        state: ScreenState;
        canvas: SVGImageElement;
        lastLocation: Coord;
        constructor();
        init(bus: EventBus, state: ScreenState, svgEl: SVGSVGElement, otherParams: Map<string>): void;
        moveToCoord(xy: visuals.Coord): void;
        private updateLoc();
        updateState(): void;
        updateTheme(): void;
    }
}
declare namespace pxsim.settings {
    function _set(key: string, buf: RefBuffer): 0 | -1;
    function _remove(key: string): 0 | -1;
    function _exists(key: string): boolean;
    function _get(key: string): RefBuffer;
    function _userClean(): void;
    function _list(prefix: string): RefCollection;
}
declare namespace pxsim {
    class StorageState {
        files: pxsim.Map<number[]>;
    }
    interface StorageBoard extends CommonBoard {
        storageState: StorageState;
    }
    function storageState(): StorageState;
}
declare namespace pxsim.storage {
    function init(): void;
    function appendBuffer(filename: string, data: RefBuffer): void;
    function overwriteWithBuffer(filename: string, data: RefBuffer): void;
    function exists(filename: string): boolean;
    function remove(filename: string): void;
    function size(filename: string): number;
    function readAsBuffer(filename: string): RefBuffer;
}
declare namespace pxsim {
    interface SlideSwitchBoard extends CommonBoard {
        slideSwitchState: SlideSwitchState;
    }
}
declare namespace pxsim {
    class SlideSwitchState {
        static id: number;
        private left;
        setState(left: boolean): void;
        isLeft(): boolean;
    }
}
declare namespace pxsim.input {
    function onSwitchMoved(direction: number, body: RefAction): void;
    function switchRight(): boolean;
}
declare namespace pxsim {
    interface TemperatureBoard extends CommonBoard {
        thermometerState: AnalogSensorState;
        thermometerUnitState: TemperatureUnit;
    }
    function thermometerState(): AnalogSensorState;
    function setThermometerUnit(unit: TemperatureUnit): void;
}
declare namespace pxsim {
    enum TemperatureUnit {
        Celsius = 0,
        Fahrenheit = 1,
    }
}
declare namespace pxsim.input {
    function temperature(unit: number): number;
    function onTemperatureConditionChanged(condition: number, temperature: number, unit: number, body: RefAction): void;
}
declare namespace pxsim {
    interface CapTouchBoard extends CommonBoard {
        touchButtonState: TouchButtonState;
    }
}
declare namespace pxsim {
    class CapacitiveSensorState {
        capacity: number[];
        reading: boolean[];
        mapping: Map<number>;
        constructor(mapping: Map<number>);
        private getCap(pinId);
        readCap(pinId: number, samples: number): number;
        isReadingPin(pinId: number, pin: Pin): boolean;
        isReading(capId: number): boolean;
        startReading(pinId: number, pin: Pin): void;
        capacitiveSensor(capId: number, samples: number): number;
        reset(capId: number): void;
    }
    class TouchButton extends CommonButton {
        _threshold: number;
        constructor(pin: number);
        setThreshold(value: number): void;
        threshold(): number;
        value(): number;
        calibrate(): void;
    }
    class TouchButtonState {
        buttons: TouchButton[];
        constructor(pins: number[]);
    }
}
declare namespace pxsim.pxtcore {
    function getTouchButton(id: number): TouchButton;
}
declare namespace pxsim.TouchButtonMethods {
    function setThreshold(button: pxsim.TouchButton, value: number): void;
    function threshold(button: pxsim.TouchButton): number;
    function value(button: pxsim.TouchButton): number;
    function calibrate(button: pxsim.TouchButton): void;
}
declare namespace pxsim.AnalogInOutPinMethods {
    function touchButton(name: pins.AnalogInOutPin): TouchButton;
}
