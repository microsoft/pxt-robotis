namespace pxsim.visuals {
    const svg = pxsim.svg;

    export const VIEW_WIDTH = 372.3404255319149;
    export const VIEW_HEIGHT = 361.70212765957444;
    const TOP_MARGIN = 20;
    const MID_MARGIN = 40;
    const BOT_MARGIN = 20;
    const PIN_LBL_SIZE = PIN_DIST * 0.7;
    const PIN_LBL_HOVER_SIZE = PIN_LBL_SIZE * 1.5;
    const SQUARE_PIN_WIDTH = PIN_DIST * 0.66666;
    const SQUARE_PIN_HOVER_WIDTH = PIN_DIST * 0.66666 + PIN_DIST / 3.0;

    const STYLE = `
.sim-board-pin {
    stroke: #404040;
    fill: #000000;
}
.sim-board-button {
    stroke: #aaa;
    stroke-width: 3px;
    fill: #666;
}
.sim-board-button.pressed {
    fill: #ee0;
}
.sim-board-button:hover {
    stroke-width: 4px;
    stroke: #ee0;
    cursor: pointer;
}


.sim-button {
    pointer-events: none;
}

.sim-button-outer {
    cursor: pointer;
}
.sim-button-outer:hover {
    stroke-width: 1px;
    stroke: orange !important;
}
.sim-button-nut {
    fill:#704A4A;
    pointer-events:none;
}
.sim-button-nut:hover {
    stroke:1px solid #704A4A;
}
.sim-pin-touch:hover {
    stroke:#D4AF37;
    stroke-width:1px;
}

.sim-pin-touch.touched:hover {
    stroke:darkorange;
}

.sim-led-back:hover {
    stroke:#fff;
    stroke-width:3px;
}
.sim-led:hover {
    stroke:#ff7f7f;
    stroke-width:3px;
}

.sim-systemled {
    fill:#333;
    stroke:#555;
    stroke-width: 1px;
}
  
 .sim-drawcircle {
   
    stroke:#42c5f4;
    stroke-width: 6px;
   
}

.sim-light-level-button {
    stroke:#f1c40f;
    stroke-width: 1px;
}

.sim-pin-level-button {
    stroke:darkorange;
    stroke-width: 1px;
}

.sim-sound-level-button {
    stroke:#7f8c8d;
    stroke-width: 1px;
}

.sim-antenna {
    stroke:#555;
    stroke-width: 2px;
}

.sim-text {
    font-family:"Lucida Console", Monaco, monospace;
    font-size: 15px;
    fill: #000;
}
.sim-text-white {
    font-family:"Lucida Console", Monaco, monospace;
    font-size: 15px;
    fill: #fff;
}
.sim-text, svg.sim text {
    pointer-events: none; user-select: none;
}
.sim-text.small {
    font-size:6px;
}
.sim-text.inverted {
    fill:#000;
}

.sim-text-pin {
    font-family:"Lucida Console", Monaco, monospace;
    font-size:5px;
    fill:#fff;
    pointer-events: none;
}

.sim-thermometer {
}

#rgbledcircle:hover {
    r:8px;
}

#SLIDE_HOVER {
    cursor: pointer;
}
.sim-slide-switch:hover #SLIDE_HOVER {
    stroke:orange !important;
    stroke-width: 1px;
}

.sim-slide-switch-inner.on {
    fill:#ff0000 !important;
}

/* animations */
.sim-theme-glow {
    animation-name: sim-theme-glow-animation;
    animation-timing-function: ease-in-out;
    animation-direction: alternate;
    animation-iteration-count: infinite;
    animation-duration: 1.25s;
}
@keyframes sim-theme-glow-animation {
    from { opacity: 1; }
    to   { opacity: 0.75; }
}

.sim-flash {
    animation-name: sim-flash-animation;
    animation-duration: 0.1s;
}

@keyframes sim-flash-animation {
    from { fill: yellow; }
    to   { fill: default; }
}

.sim-flash-stroke {
    animation-name: sim-flash-stroke-animation;
    animation-duration: 0.4s;
    animation-timing-function: ease-in;
}

@keyframes sim-flash-stroke-animation {
    from { stroke: yellow; }
    to   { stroke: default; }
}


.sim-sound-stroke {
    stroke-width: 10px;
    animation-name: sim-sound-stroke-animation;
    animation-duration: 0.4s;
}

@keyframes sim-sound-stroke-animation {
    from { stroke: yellow; }
    to   { stroke: default; }
}

/* wireframe */
.sim-wireframe * {
    fill: none;
    stroke: black;
}
.sim-wireframe .sim-display,
.sim-wireframe .sim-led,
.sim-wireframe .sim-led-back,
.sim-wireframe .sim-head,
.sim-wireframe .sim-theme,
.sim-wireframe .sim-button-group,
.sim-wireframe .sim-button-label,
.sim-wireframe .sim-button,
.sim-wireframe .sim-text-pin
{
    visibility: hidden;
}
.sim-wireframe .sim-label
{
    stroke: none;
    fill: #777;
}
.sim-wireframe .sim-board {
    stroke-width: 2px;
}
*:focus {
    outline: none;
}
.sim-button-outer:focus,
.sim-slide-switch:focus,
.sim-pin:focus,
.sim-thermometer:focus,
.sim-button-group:focus .sim-button-outer,
.sim-light-level-button:focus,
.sim-sound-level-button:focus {
    stroke: #4D90FE;
    stroke-width: 2px !important;
 }
.no-drag {
    user-drag: none;
    user-select: none;
    -moz-user-select: none;
    -webkit-user-drag: none;
    -webkit-user-select: none;
    -ms-user-select: none;
}
    `;
    
    const pinNames: { 'name': string, 'touch': number, 'text': any, 'id'?: number, tooltip?: string }[] = [
    ];
    const MB_WIDTH = 632;
    const MB_HEIGHT = 400;

    export interface IBoardTheme {
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

    export var themes: IBoardTheme[] = ["#3ADCFE"].map(accent => {
        return {
            accent: accent,
            pin: "#D4AF37",
            pinTouched: "#FFA500",
            pinActive: "#FF5500",
            ledOn: "#ff7777",
            ledOff: "#fff",
            buttonOuter: "#979797",
            buttonUps: ["#000", "#000", "#000"],
            buttonDown: "#FFA500",
            virtualButtonDown: "#FFA500",
            virtualButtonOuter: "#333",
            virtualButtonUp: "#fff",
            lightLevelOn: "yellow",
            lightLevelOff: "#555",
            soundLevelOn: "#7f8c8d",
            soundLevelOff: "#555",
        }
    });

    export function randomTheme(): IBoardTheme {
        return themes[Math.floor(Math.random() * themes.length)];
    }

    export type ComputedBoardDimensions = {
        scaleFn: (n: number) => number,
        height: number,
        width: number,
        xOff: number,
        yOff: number
    };

    export function getBoardDimensions(vis: BoardImageDefinition): ComputedBoardDimensions {
        let scaleFn = (n: number) => n * (PIN_DIST / vis.pinDist);
        let width = scaleFn(vis.width);
        return {
            scaleFn: scaleFn,
            height: scaleFn(vis.height),
            width: width,
            xOff: (VIEW_WIDTH - width) / 2.0,
            yOff: TOP_MARGIN
        }
    }

    export interface MetroBoardProps extends GenericBoardProps {
        runtime?: pxsim.Runtime;
        theme?: IBoardTheme;
        disableTilt?: boolean;
    }

    export class MetroBoardSvg extends GenericBoardSvg {

        public board: pxsim.DalBoard;
        private onBoardLeds: BoardLed[];
        private onBoardNeopixels: BoardNeopixel[];
        private onBoardReset: BoardResetButton;
        private onBoardButtons: BoardButton[];
        private onBoardTouchPads: BoardTouchButton[];

        constructor(public props: MetroBoardProps) {
            super(props);

            const el = this.getView().el;
            this.addDefs(el);

            this.onBoardLeds = []
            this.onBoardNeopixels = [];
            this.onBoardTouchPads = [];
            this.onBoardButtons = [];

            // neopixels/leds
            for (const l of props.visualDef.leds || []) {
                if (l.color == "neopixel") {
                    const onBoardNeopixel = new BoardNeopixel(l.label, l.x, l.y, l.w || 0);
                    this.onBoardNeopixels.push(onBoardNeopixel);
                    el.appendChild(onBoardNeopixel.element);
                } else {
                    const pin = pinByName(l.label);
                    if (pin) {
                        let bl = new BoardLed(l.x, l.y, l.color, pinByName(l.label),
                            l.w || 9, l.h || 8)
                        this.onBoardLeds.push(bl)
                        el.appendChild(bl.element)
                    }
                }
            }
            this.onBoardNeopixels.sort((l, r) => {
                const li = parseInt(l.name.replace(/^[^\d]*/, '')) || 0;
                const ri = parseInt(r.name.replace(/^[^\d]*/, '')) || 0;
                return li < ri ? -1 : li > ri ? 1 : 0;
            })

            // reset button
            if (props.visualDef.reset) {
                this.onBoardReset = new BoardResetButton(props.visualDef.reset)
                el.appendChild(this.onBoardReset.element)
            }

            // touch pads
            for (const l of props.visualDef.touchPads || []) {
                const pin = pxsim.pinIds[l.label];
                if (!pin) {
                    console.error(`touch pin ${pin} not found`)
                    continue;
                }
                const tp = new BoardTouchButton(l, pin);
                this.onBoardTouchPads.push(tp);
                el.appendChild(tp.element);
            }

            // regular buttons
            for (const l of props.visualDef.buttons || []) {
                const tp = new BoardButton(l);
                this.onBoardButtons.push(tp);
                el.appendChild(tp.element);
            }

            if (props && props.theme)
                this.updateTheme();

            if (props && props.runtime) {
                this.board = this.props.runtime.board as pxsim.DalBoard;
                this.board.updateSubscribers.push(() => this.updateState());
                this.updateState();
            }
        }

        public updateTheme() {
        }

        public updateState() {
            this.onBoardLeds.forEach(l => l.updateState());
            if (this.board.neopixelPin) {
                const state = this.board.neopixelState(this.board.neopixelPin.id);
                if (state.buffer) {
                    for (let i = 0; i < this.onBoardNeopixels.length; ++i) {
                        const rgb = state.pixelColor(i)
                        if (rgb !== null)
                            this.onBoardNeopixels[i].setColor(rgb as any);
                    }
                }
            }
        }

        private addDefs(el: SVGElement) {
            const defs = svg.child(el, "defs", {});

            let neopixelglow = svg.child(defs, "filter", { id: "neopixelglow", x: "-200%", y: "-200%", width: "400%", height: "400%" });
            svg.child(neopixelglow, "feGaussianBlur", { stdDeviation: "4.3", result: "coloredBlur" });
            let neopixelmerge = svg.child(neopixelglow, "feMerge", {});
            svg.child(neopixelmerge, "feMergeNode", { in: "coloredBlur" })
            svg.child(neopixelmerge, "feMergeNode", { in: "SourceGraphic" })

            const style = svg.child(el, "style", {});
            style.textContent = STYLE;
        }
    }

    class BoardResetButton {
        element: SVGElement;
        constructor(p: BoxDefinition) {
            p.w = p.w || 15;
            p.h = p.h || 15;
            this.element = svg.elt("circle", {
                cx: p.x + p.w / 2,
                cy: p.y + p.h / 2,
                r: Math.max(p.w, p.h) / 2,
                class: "sim-board-button"
            }) as SVGCircleElement
            svg.title(this.element, "RESET");
            // hooking up events
            pointerEvents.down.forEach(evid => this.element.addEventListener(evid, ev => {
                pxsim.U.addClass(this.element, "pressed");
                pxsim.Runtime.postMessage(<pxsim.SimulatorCommandMessage>{
                    type: "simulator",
                    command: "restart"
                })
            }));
            this.element.addEventListener(pointerEvents.leave, ev => {
                pxsim.U.removeClass(this.element, "pressed");
            })
            this.element.addEventListener(pointerEvents.up, ev => {
                pxsim.U.removeClass(this.element, "pressed");
            })
        }
    }

    class BoardLed {
        private colorOff = "#aaa"
        private backElement: SVGElement;
        private ledElement: SVGElement;
        element: SVGElement;

        constructor(x: number, y: number, private colorOn: string, private pin: Pin, w: number, h: number) {
            this.backElement = svg.elt("rect", { x, y, width: w, height: h, fill: this.colorOff });
            this.ledElement = svg.elt("rect", { x, y, width: w, height: h, fill: this.colorOn, opacity: 0 });
            svg.filter(this.ledElement, `url(#neopixelglow)`);
            this.element = svg.elt("g", { class: "sim-led" });
            this.element.appendChild(this.backElement);
            this.element.appendChild(this.ledElement);
        }

        updateTheme(colorOff: string, colorOn: string) {
            if (colorOff) {
                this.colorOff = colorOff;
            }
            if (colorOn) {
                this.colorOn = colorOn;
            }
        }

        updateState() {
            const opacity = this.pin.mode & PinFlags.Digital ? (this.pin.value > 0 ? 1 : 0)
                : 0.1 + Math.max(0, Math.min(1023, this.pin.value)) / 1023 * 0.8;
            this.ledElement.setAttribute("opacity", opacity.toString())
        }
    }

    class BoardNeopixel {
        name: string;
        element: SVGCircleElement;

        constructor(name: string, x: number, y: number, r: number) {
            this.name = name;
            this.element = svg.elt("circle", { cx: x + r / 2, cy: y + r / 2, r: 10 }) as SVGCircleElement
            svg.title(this.element, name);
        }

        setColor(rgb: [number, number, number]) {
            const hsl = visuals.rgbToHsl(rgb);
            let [h, s, l] = hsl;
            const lx = Math.max(l * 1.3, 85);

            // at least 10% luminosity
            l = l * 90 / 100 + 10;
            this.element.style.stroke = `hsl(${h}, ${s}%, ${Math.min(l * 3, 75)}%)`
            this.element.style.strokeWidth = "1.5";
            svg.fill(this.element, `hsl(${h}, ${s}%, ${lx}%)`);
            svg.filter(this.element, `url(#neopixelglow)`);
        }
    }

    class BoardButton {
        element: SVGElement;
        def: ButtonDefinition;
        button: CommonButton;
        constructor(def: ButtonDefinition) {
            this.def = def;
            def.w = def.w || 15;
            def.h = def.h || 15;
            this.element = svg.elt("circle", {
                cx: def.x + def.w / 2,
                cy: def.y + def.h / 2,
                r: Math.max(def.w, def.h) / 2,
                class: "sim-board-button"
            }) as SVGCircleElement
            svg.title(this.element, def.label);
            // resolve button
            this.button = def.index !== undefined
                ? pxsim.pxtcore.getButton(def.index)
                : pxsim.pxtcore.getButtonByPin(pxsim.pinIds[def.label]);
            // hooking up events
            pointerEvents.down.forEach(evid => this.element.addEventListener(evid, ev => {
                this.button.setPressed(true);
                pxsim.U.addClass(this.element, "pressed");
            }));
            this.element.addEventListener(pointerEvents.leave, ev => {
                pxsim.U.removeClass(this.element, "pressed");
                this.button.setPressed(false);
            })
            this.element.addEventListener(pointerEvents.up, ev => {
                pxsim.U.removeClass(this.element, "pressed");
                this.button.setPressed(false);
            })
        }
    }

    class BoardTouchButton {
        element: SVGElement;
        def: TouchPadDefinition;
        button: TouchButton;
        constructor(def: TouchPadDefinition, pinId: number) {
            this.def = def;
            def.w = def.w || 15;
            def.h = def.h || 15;
            this.element = svg.elt("circle", {
                cx: def.x + def.w / 2,
                cy: def.y + def.h / 2,
                r: Math.max(def.w, def.h) / 2,
                class: "sim-board-button"
            }) as SVGCircleElement
            svg.title(this.element, def.label);
            // resolve button
            this.button = pxsim.pxtcore.getTouchButton(pinId);
            // hooking up events
            pointerEvents.down.forEach(evid => this.element.addEventListener(evid, ev => {
                this.button.setPressed(true);
                pxsim.U.addClass(this.element, "pressed");
            }));
            this.element.addEventListener(pointerEvents.leave, ev => {
                pxsim.U.removeClass(this.element, "pressed");
                this.button.setPressed(false);
            })
            this.element.addEventListener(pointerEvents.up, ev => {
                pxsim.U.removeClass(this.element, "pressed");
                this.button.setPressed(false);
            })
        }
    }

    export interface IBoardProps {
        runtime?: pxsim.Runtime;
        theme?: IBoardTheme;
        disableTilt?: boolean;
        wireframe?: boolean;
    }

    export class CM300BoardSvg implements BoardView {
        public element: SVGSVGElement;
        private style: SVGStyleElement;
        private defs: SVGDefsElement;
        private g: SVGGElement;

        private buttons: SVGElement[];
        private buttonsOuter: SVGElement[];
        private pins: SVGElement[];
        private pinControls: { [index: number]: AnalogPinControl };
        private systemLed: SVGElement;
        private ledRGB: SVGRectElement;
        private onBoardLeds: BoardLed[];
        private lcd: SVGImageElement;
        private lightLevelButton: SVGCircleElement;
        private lightLevelGradient: SVGLinearGradientElement;
        private lightLevelText: SVGTextElement;
        private soundLevelButton: SVGCircleElement;
        private soundLevelGradient: SVGLinearGradientElement;
        private soundLevelText: SVGTextElement;
        private thermometerGradient: SVGLinearGradientElement;
        private thermometer: SVGRectElement;
        private thermometerText: SVGTextElement;
        private irSensorGradient: SVGLinearGradientElement[];
        private irSensor: SVGRectElement[];
        private irSensorText: SVGTextElement[];
        private shakeButtonGroup: SVGElement;
        private shakeText: SVGTextElement;
        private screenCanvas: HTMLCanvasElement;
        public  onDxls: BoardDxl[];

        public board: pxsim.DalBoard;
        private pinNmToCoord: Map<Coord> = {
        };

        constructor(public props: IBoardProps) {
            this.onBoardLeds = [];
            this.irSensorGradient = [];
            this.irSensor = [];
            this.irSensorText = [];
            this.onDxls = [];

            this.fixPinIds();
            this.buildDom();
            if (props && props.wireframe)
                U.addClass(this.element, "sim-wireframe");

            if (props && props.theme)
                this.updateTheme();

            if (props && props.runtime) {
                this.board = this.props.runtime.board as pxsim.DalBoard;
                this.board.updateSubscribers.push(() => this.updateState());
                this.updateState();
                this.attachEvents();
                this.initScreen();
            }            
        }

        private fixPinIds() {
            for (let pn of pinNames) {
                let key = getConfigKey(pn.name);
                if (key != null)
                    pn.id = getConfig(key);
            }
        }

        private initScreen() {
            let requested = false;
            this.screenCanvas.width = this.board.screenState.width
            this.screenCanvas.height = this.board.screenState.height

            const ctx = this.screenCanvas.getContext("2d")
            ctx.imageSmoothingEnabled = false
            const imgdata = ctx.getImageData(0, 0, this.board.screenState.width, this.board.screenState.height)
            const arr = new Uint32Array(imgdata.data.buffer)
        
            this.board.screenState.onChange = () => {

                const flush = () => {
                    requested = false
                    ctx.putImageData(imgdata, 0, 0)
                    // 아래를 주석처리하면 시뮬레이터에 이미지가 표시되지 않음.
                    this.lcd.setAttributeNS("http://www.w3.org/1999/xlink", "xlink:href", this.screenCanvas.toDataURL());
                }

                // after we did one-time setup, redefine ourselves to be quicker
                this.board.screenState.onChange = () => {
                    arr.set(this.board.screenState.screen)
                    // paint rect
                    runtime.queueDisplayUpdate();
                    if (!requested) {
                        requested = true
                        window.requestAnimationFrame(flush)
                    }
                }
                // and finally call the redefined self
                this.board.screenState.onChange()
            }                        
        }

        public getView(): SVGAndSize<SVGSVGElement> {
            return {
                el: this.element,
                y: 0,
                x: 0,
                w: MB_WIDTH,
                h: MB_HEIGHT
            };
        }

        public getCoord(pinNm: string): Coord {
            return this.pinNmToCoord[pinNm];
        }

        public highlightPin(pinNm: string): void {
            //TODO: for instructions
        }

        public getPinDist(): number {
            return 10;
        }

        private recordPinCoords() {
            pinNames.forEach((pin, i) => {
                const nm = pin.name;
                const p = this.pins[i];
                const r = p.getBoundingClientRect();
                this.pinNmToCoord[nm] = [r.left + r.width / 2, r.top + r.height / 2];
            });
            console.log(JSON.stringify(this.pinNmToCoord, null, 2))
        }

        private updateTheme() {
            let theme = this.props.theme;

            svg.fills(this.buttonsOuter, theme.buttonOuter);

            for (let i = 0; i < this.buttons.length; i++) {
                svg.fill(this.buttons[i], theme.buttonUps[i]);
            }

            svg.setGradientColors(this.lightLevelGradient, theme.lightLevelOn, theme.lightLevelOff);

            svg.setGradientColors(this.thermometerGradient, theme.ledOff, theme.ledOn);
            for (let i = 0; i < this.irSensorGradient.length; i++) {
                svg.setGradientColors(this.irSensorGradient[i], "#FFFFFF", "#5D67B7");   
            }
        }

        public updateState() {
            let state = this.board;
            if (!state) return;
            let theme = this.props.theme;

            let bpState = state.buttonState;
            let buttons = bpState.buttons;

            for (let i = 0; i < this.buttons.length; i++) {
                svg.fill(this.buttons[i], buttons[i].pressed ? theme.buttonDown : theme.buttonUps[i]);
            }

            // this.updateLedRgb();
            this.onBoardLeds.forEach(l => l.updateState());
            this.onDxls.forEach(l => l.updateState());

            this.updateGestures();

            this.updateSound();
            this.updateLightLevel();
            this.updateTemperature();
            this.updateIrSensor(0, 40, 300);
            this.updateIrSensor(1, 150, 300);
            this.updateIrSensor(2, 190, 300);
            this.updateIrSensor(3, 230, 300);
            this.updateIrSensor(4, 345, 300);

            if (!runtime || runtime.dead) U.addClass(this.element, "grayscale");
            else U.removeClass(this.element, "grayscale");
        }

        private lastFlashTime: number = 0;
        private flashSystemLed() {
            if (!this.systemLed)
                this.systemLed = this.element.getElementById("LED_PWR-2") as SVGElement;
            let now = Date.now();
            if (now - this.lastFlashTime > 150) {
                this.lastFlashTime = now;
                svg.animate(this.systemLed, "sim-flash")
            }
        }

        private updateLedRgb() {
            let state = this.board;
            if (!state) return;
           
            // const rgb = [0,0,0];
            const rgb = state.lightRgbState.getColor();            

            if (this.ledRGB) {
                if (!rgb || 
                    (rgb.length >= 3 && rgb[0] === 0 && rgb[1] === 0 && rgb[2] === 0) ||
                    (rgb.length >= 3 && rgb[0] === undefined && rgb[1] === undefined && rgb[2] === undefined)
                    ) {
                    // Clear the pixel
                    svg.fill(this.ledRGB, `#000000`);
                    svg.filter(this.ledRGB, null);
                    this.ledRGB.style.strokeWidth = "0.28349999";
                    this.ledRGB.style.stroke = "#58595b";
                } else {
                    let hsl = visuals.rgbToHsl(rgb);
                    let [h, s, l] = hsl;
                    let lx = Math.max(l * 1.3, 85);
                    // at least 10% luminosity
                    l = l * 90 / 100 + 10;
                    this.ledRGB.style.stroke = `hsl(${h}, ${s}%, ${Math.min(l * 3, 75)}%)`
                    this.ledRGB.style.strokeWidth = "1.5";
                    svg.fill(this.ledRGB, `hsl(${h}, ${s}%, ${lx}%)`)
                    svg.filter(this.ledRGB, null);
                }
            }
        }

        private updateSound() {
            // let state = this.board;
            // if (!state || !state.audioState) return;
            // let audioState = state.audioState;

            // let soundBoard = this.element.getElementById('BUZZER-2') as SVGGElement;
            // if (audioState.isPlaying()) {
            //     U.addClass(soundBoard, "sim-sound-stroke");
            // } else {
            //     U.removeClass(soundBoard, "sim-sound-stroke");
            // }
        }

        private updatePins() {
            let state = this.board;
            if (!state || !state.edgeConnectorState) return;
            state.edgeConnectorState.pins.forEach((pin, i) => this.updatePin(pin, i));
        }

        private updatePin(pin: Pin, index: number) {
            if (!pin || !this.pins[index]) return;

            if ((pin as pins.CommonPin).used) {
                if (this.pinControls[pin.id] === undefined) {
                    const pinName = pinNames.filter((a) => a.id === pin.id)[0];
                    if (pinName) {
                        this.pinControls[pin.id] = new AnalogPinControl(this, this.defs, pin.id, pinName.name);
                    }
                    else {
                        // TODO: Surface pin controls for sensor pins in some way?
                        this.pinControls[pin.id] = null;
                    }
                }

                if (this.pinControls[pin.id]) {
                    this.pinControls[pin.id].updateValue();
                }
            }
        }

        private updateLightLevel() {
            let state = this.board;
            if (!state || !state.lightSensorState.sensorUsed) return;

            if (!this.lightLevelButton) {
                let gid = "gradient-light-level";
                this.lightLevelGradient = svg.linearGradient(this.defs, gid)
                let cy = 590;
                let r = 50;
                this.lightLevelButton = svg.child(this.g, "circle", {
                    cx: `100px`, cy: `${cy}px`, r: `${r}px`,
                    class: 'sim-light-level-button no-drag',
                    fill: `url(#${gid})`
                }) as SVGCircleElement;
                let pt = this.element.createSVGPoint();
                svg.buttonEvents(this.lightLevelButton,
                    // move
                    (ev) => {
                        let pos = svg.cursorPoint(pt, this.element, ev);
                        let rs = r / 2;
                        let level = Math.max(0, Math.min(255, Math.floor((pos.y - (cy - rs)) / (2 * rs) * 255)));
                        if (level != this.board.lightSensorState.getLevel()) {
                            this.board.lightSensorState.setLevel(level);
                            this.applyLightLevel();
                        }
                    },
                    // start
                    ev => { },
                    // stop
                    ev => { },
                    // keydown
                    (ev) => {
                        let charCode = (typeof ev.which == "number") ? ev.which : ev.keyCode
                        if (charCode === 40 || charCode === 37) { // Down/Left arrow
                            if (this.board.lightSensorState.getLevel() === 0) {
                                this.board.lightSensorState.setLevel(255);
                            } else {
                                this.board.lightSensorState.setLevel(this.board.lightSensorState.getLevel() - 1);
                            }
                            this.applyLightLevel();
                        } else if (charCode === 38 || charCode === 39) { // Up/Right arrow
                            if (this.board.lightSensorState.getLevel() === 255) {
                                this.board.lightSensorState.setLevel(0);
                            } else {
                                this.board.lightSensorState.setLevel(this.board.lightSensorState.getLevel() + 1);
                            }
                            this.applyLightLevel();
                        }
                    });
                this.lightLevelText = svg.child(this.g, "text", { x: 70, y: cy + r - 130, text: '', class: 'sim-text' }) as SVGTextElement;
                this.updateTheme();

                accessibility.makeFocusable(this.lightLevelButton);
                accessibility.setAria(this.lightLevelButton, "slider", "Light level");
                this.lightLevelButton.setAttribute("aria-valuemin", "0");
                this.lightLevelButton.setAttribute("aria-valuemax", "255");
                this.lightLevelButton.setAttribute("aria-orientation", "vertical");
                this.lightLevelButton.setAttribute("aria-valuenow", "128");
            }

            svg.setGradientValue(this.lightLevelGradient, Math.min(100, Math.max(0, Math.floor(state.lightSensorState.getLevel() * 100 / 255))) + '%')
            this.lightLevelText.textContent = state.lightSensorState.getLevel().toString();
        }

        private applyLightLevel() {
            let lv = this.board.lightSensorState.getLevel();
            svg.setGradientValue(this.lightLevelGradient, Math.min(100, Math.max(0, Math.floor(lv * 100 / 255))) + '%')
            this.lightLevelText.textContent = lv.toString();
            this.lightLevelButton.setAttribute("aria-valuenow", lv.toString());
            accessibility.setLiveContent(lv.toString());
        }

        private updateTemperature() {
            let state = this.board;
            // console.log("### updateTemperature state : " + state + " / " + state.thermometerState + " / " + state.thermometerState.sensorUsed);
            if (!state || !state.thermometerState || !state.thermometerState.sensorUsed) return;

            // Celsius
            let tmin = -5;
            let tmax = 50;
            if (!this.thermometer) {
                let gid = "gradient-thermometer";
                this.thermometerGradient = svg.linearGradient(this.defs, gid);
                this.thermometer = <SVGRectElement>svg.child(this.g, "rect", {
                    class: "sim-thermometer no-drag",
                    x: 370,
                    y: 15,
                    width: 15,
                    height: 50,
                    rx: 2, ry: 2,
                    fill: `url(#${gid})`
                });
                this.thermometerText = svg.child(this.g, "text", { class: 'sim-text', x: 320, y: 25 }) as SVGTextElement;
                this.updateTheme();

                let pt = this.element.createSVGPoint();
                svg.buttonEvents(this.thermometer,
                    // move
                    (ev) => {
                        let cur = svg.cursorPoint(pt, this.element, ev);
                        let t = Math.max(0, Math.min(1, (65 - cur.y) / 50)) // (y + height - cur.y) / height
                        state.thermometerState.setLevel(Math.floor(tmin + t * (tmax - tmin)));
                        this.updateTemperature();
                    },
                    // start
                    ev => { },
                    // stop
                    ev => { },
                    // keydown
                    (ev) => {
                        let charCode = (typeof ev.which == "number") ? ev.which : ev.keyCode
                        if (charCode === 40 || charCode === 37) { // Down/Left arrow
                            if (state.thermometerState.getLevel() === -5) {
                                state.thermometerState.setLevel(50);
                            } else {
                                state.thermometerState.setLevel(state.thermometerState.getLevel() - 1);
                            }
                            this.updateTemperature();
                        } else if (charCode === 38 || charCode === 39) { // Up/Right arrow
                            if (state.thermometerState.getLevel() === 50) {
                                state.thermometerState.setLevel(-5);
                            } else {
                                state.thermometerState.setLevel(state.thermometerState.getLevel() + 1);
                            }
                            this.updateTemperature();
                        }
                    });

                accessibility.makeFocusable(this.thermometer);
                accessibility.setAria(this.thermometer, "slider", "Thermometer");
                this.thermometer.setAttribute("aria-valuemin", tmin.toString());
                this.thermometer.setAttribute("aria-valuemax", tmax.toString());
                this.thermometer.setAttribute("aria-orientation", "vertical");
            }

            let t = Math.max(tmin, Math.min(tmax, state.thermometerState.getLevel()))
            let per = Math.floor((state.thermometerState.getLevel() - tmin) / (tmax - tmin) * 100)
            svg.setGradientValue(this.thermometerGradient, 100 - per + "%");

            let unit = "°C";
            if (state.thermometerUnitState == pxsim.TemperatureUnit.Fahrenheit) {
                unit = "°F";
                t = ((t * 18) / 10 + 32) >> 0;
            }
            this.thermometerText.textContent = t + unit;
            this.thermometer.setAttribute("aria-valuenow", t.toString());
            this.thermometer.setAttribute("aria-valuetext", t + unit);
            accessibility.setLiveContent(t + unit);
        }

        private updateIrSensor(irId: number, irX: number, irY: number) {
            let state = this.board;
            // console.log("### updateIr state : " + state + " / " + state.irSensorState + " / " + state.thermometerState.sensorUsed);
            if (!state || !state.irSensorState || !state.irSensorState.sensorUsed) return;

            // min, max 값은 dalboard.ts 의 irSensorState 에서도 설정됨.
            let tmin = 0;
            let tmax = 100;
            if (!this.irSensor[irId]) {
                let gid = "gradient-irSensor" + irId;
                this.irSensorGradient[irId] = svg.linearGradient(this.defs, gid);
                this.irSensor[irId] = <SVGRectElement>svg.child(this.g, "rect", {
                    class: "sim-irSensor" + irId + " no-drag",
                    x: irX,
                    y: irY,
                    width: 15,
                    height: 50,
                    rx: 2, ry: 2,
                    fill: `url(#${gid})`
                });
                // this.irSensorText[irIndex] = svg.child(this.g, "text", { class: 'sim-text-white', x: 35 * (irIndex + 1), y: 290 }) as SVGTextElement;
                this.irSensorText[irId] = svg.child(this.g, "text", { class: 'sim-text-white', x: this.irSensor[irId].x.baseVal.value, y: 290 }) as SVGTextElement;
                this.updateTheme();

                let pt = this.element.createSVGPoint();
                svg.buttonEvents(this.irSensor[irId],
                    // move
                    (ev) => {
                        let cur = svg.cursorPoint(pt, this.element, ev);
                        let t = Math.max(0, Math.min(1, (350 - cur.y) / 50)) // (y + height - cur.y) / height
                        state.irSensorState.setLevel(irId, Math.floor(tmin + t * (tmax - tmin)));
                        this.updateIrSensor(irId, irX, irY);
                    },
                    // start
                    ev => { },
                    // stop
                    ev => { },
                    // keydown
                    (ev) => {
                        let charCode = (typeof ev.which == "number") ? ev.which : ev.keyCode
                        if (charCode === 40 || charCode === 37) { // Down/Left arrow
                            if (state.irSensorState.getLevel(irId) === 0) {
                                state.irSensorState.setLevel(irId, 100);
                            } else {
                                state.irSensorState.setLevel(irId, state.irSensorState.getLevel(irId) - 1);
                            }
                            this.updateIrSensor(irId, irX, irY);
                        } else if (charCode === 38 || charCode === 39) { // Up/Right arrow
                            if (state.irSensorState.getLevel(irId) === 100) {
                                state.irSensorState.setLevel(irId, 0);
                            } else {
                                state.irSensorState.setLevel(irId, state.irSensorState.getLevel(irId) + 1);
                            }
                            this.updateIrSensor(irId, irX, irY);
                        }
                    });

                accessibility.makeFocusable(this.irSensor[irId]);
                accessibility.setAria(this.irSensor[irId], "slider", "irSensor" + irId);
                this.irSensor[irId].setAttribute("aria-valuemin", tmin.toString());
                this.irSensor[irId].setAttribute("aria-valuemax", tmax.toString());
                this.irSensor[irId].setAttribute("aria-orientation", "vertical");
            }

            let t = Math.max(tmin, Math.min(tmax, state.irSensorState.getLevel(irId)))
            let per = Math.floor((state.irSensorState.getLevel(irId) - tmin) / (tmax - tmin) * 100)
            svg.setGradientValue(this.irSensorGradient[irId], 100 - per + "%");

            this.irSensorText[irId].textContent = t.toString();
            this.irSensor[irId].setAttribute("aria-valuenow", t.toString());
            accessibility.setLiveContent(t.toString());
        }

        private updateGestures() {
            let state = this.board;
            if (state.accelerometerState.useShake && !this.shakeButtonGroup) {
                const btnr = 2;
                const width = 22;
                const height = 10;

                let btng = svg.child(this.g, "g", { class: "sim-button-group" });
                this.shakeButtonGroup = btng;
                this.shakeText = svg.child(this.g, "text", { x: 81, y: 32, class: "sim-text small" }) as SVGTextElement;
                this.shakeText.textContent = "SHAKE"

                svg.child(btng, "rect", { class: "sim-button-outer", x: 79, y: 25, rx: btnr, ry: btnr, width, height });
                // svg.fill(btng, this.props.theme.gestureButtonOff);
                // pointerEvents.down.forEach(evid => this.shakeButtonGroup.addEventListener(evid, ev => {
                //     let state = this.board;
                //     svg.fill(btng, this.props.theme.gestureButtonOn);
                //     svg.addClass(this.shakeText, "inverted");
                // }))
                // this.shakeButtonGroup.addEventListener(pointerEvents.leave, ev => {
                //     let state = this.board;
                //     svg.fill(btng, this.props.theme.gestureButtonOff);
                //     svg.removeClass(this.shakeText, "inverted");
                // })
                // this.shakeButtonGroup.addEventListener(pointerEvents.up, ev => {
                //     let state = this.board;
                //     svg.fill(btng, this.props.theme.gestureButtonOff);
                //     this.board.bus.queue(DAL.DEVICE_ID_GESTURE, 11); // GESTURE_SHAKE
                //     svg.removeClass(this.shakeText, "inverted");
                // })
                accessibility.makeFocusable(this.shakeButtonGroup);
                accessibility.enableKeyboardInteraction(this.shakeButtonGroup, () => {
                    this.board.bus.queue(DAL.DEVICE_ID_GESTURE, 11);
                });
                accessibility.setAria(this.shakeButtonGroup, "button", "Shake the board");
            }
        }

        private buildDom() {
            this.element = new DOMParser().parseFromString(BOARD_SVG, "image/svg+xml").querySelector("svg") as SVGSVGElement;
            svg.hydrate(this.element, {
                "version": "1.0",
                "viewBox": `0 0 ${MB_WIDTH} ${MB_HEIGHT}`,
                "class": "sim",
                "x": "0px",
                "y": "0px",
                "width": MB_WIDTH + "px",
                "height": MB_HEIGHT + "px",
            });
            this.style = <SVGStyleElement>svg.child(this.element, "style", {});
            this.style.textContent = STYLE;

            this.defs = <SVGDefsElement>svg.child(this.element, "defs", {});
            this.g = <SVGGElement>svg.elt("g");
            this.element.appendChild(this.g);

            // filters
            let glow = svg.child(this.defs, "filter", { id: "filterglow", x: "-5%", y: "-5%", width: "120%", height: "120%" });
            svg.child(glow, "feGaussianBlur", { stdDeviation: "5", result: "glow" });
            let merge = svg.child(glow, "feMerge", {});
            for (let i = 0; i < 3; ++i) svg.child(merge, "feMergeNode", { in: "glow" })

            let neopixelglow = svg.child(this.defs, "filter", { id: "neopixelglow", x: "-300%", y: "-300%", width: "600%", height: "600%" });
            svg.child(neopixelglow, "feGaussianBlur", { stdDeviation: "4.3", result: "coloredBlur" });
            let neopixelmerge = svg.child(neopixelglow, "feMerge", {});
            svg.child(neopixelmerge, "feMergeNode", { in: "coloredBlur" })
            svg.child(neopixelmerge, "feMergeNode", { in: "coloredBlur" })
            svg.child(neopixelmerge, "feMergeNode", { in: "SourceGraphic" })

            const lcdRect = this.element.getElementById("DISPLAY_SCREEN") as SVGRectElement;
            console.log("### lcdRect : " + this.element + " / " + lcdRect);
            this.lcd = <SVGImageElement>svg.child(lcdRect.parentElement, "image", { x : lcdRect.x.baseVal.value, y : lcdRect.y.baseVal.value, width: lcdRect.width.baseVal.value, height: lcdRect.height.baseVal.value })

            const btnIds = ["BTN_A", "BTN_B"];
            const btnLabels = ["A", "B"];
            this.buttonsOuter = btnIds.map((n, i) => {
                let btn = this.element.getElementById(n + "_OUTER") as SVGElement;
                accessibility.makeFocusable(btn);
                accessibility.setAria(btn, "button", btnLabels[i]);
                return btn;
            });
            this.buttonsOuter.forEach(b => U.addClass(b, "sim-button-outer"));
            this.buttons = btnIds.map(n => this.element.getElementById(n + "_INNER") as SVGElement);
            this.buttons.forEach(b => U.addClass(b, "sim-button"));

            // LED 지정.
            const ledIds = ["LED"];

            for (let i = 0; i < ledIds.length; i++) {
                const led = this.element.getElementById(ledIds[i]) as SVGRectElement;
                // console.log("### led : " + led.x.baseVal.value + " / " + 
                //     led.y.baseVal.value + " / " + 
                //     led.width.baseVal.value + " / " + 
                //     led.height.baseVal.value);
    
                const el = this.getView().el;
                let bl = new BoardLed(led.x.baseVal.value, 
                    led.y.baseVal.value, 
                    "#FF0000", 
                    pinByName(ledIds[i]),
                    led.width.baseVal.value || 9, 
                    led.height.baseVal.value || 8)
                            this.onBoardLeds.push(bl)
                            el.appendChild(bl.element)
            }            

            const dynmixels = ["hole", "hole-7"];

            for (let i = 0; i < dynmixels.length; i++) {
                const dxl = this.element.getElementById(dynmixels[i]) as SVGRectElement;
                const el = this.getView().el;
                let bl = new BoardDxl(el);
                this.onDxls.push(bl);
                el.appendChild(dxl);
            }

            this.screenCanvas = document.createElement("canvas");
        }

        private mkBtn(left: number, top: number, label: string): { outer: SVGElement, inner: SVGElement } {
            const btnr = 2;
            const btnw = 10;
            const btnn = 1.6;
            const btnnm = 2;
            const btnb = 3;
            let btng = svg.child(this.g, "g", { class: "sim-button-group" });
            accessibility.makeFocusable(btng);
            accessibility.setAria(btng, "button", label);
            svg.child(btng, "rect", { class: "sim-button-outer", x: left, y: top, rx: btnr, ry: btnr, width: btnw, height: btnw });

            const outer = btng;
            const inner = svg.child(btng, "circle", {
                class: "sim-button",
                cx: left + btnw / 2,
                cy: top + btnw / 2,
                r: btnb
            });

            return { outer, inner };
        }

        private attachEvents() {
            Runtime.messagePosted = (msg) => {
                switch (msg.type || "") {
                    case "serial": this.flashSystemLed(); break;
                }
            }

            let bpState = this.board.buttonState;
            let stateButtons = bpState.buttons;
            this.buttonsOuter.forEach((btn, index) => {
                let button = stateButtons[index];

                pointerEvents.down.forEach(evid => btn.addEventListener(evid, ev => {
                    button.setPressed(true);
                    svg.fill(this.buttons[index], this.props.theme.buttonDown);
                }))
                btn.addEventListener(pointerEvents.leave, ev => {
                    button.setPressed(false);
                    svg.fill(this.buttons[index], this.props.theme.buttonUps[index]);
                })
                btn.addEventListener(pointerEvents.up, ev => {
                    button.setPressed(false);
                    svg.fill(this.buttons[index], this.props.theme.buttonUps[index]);
                })
                accessibility.enableKeyboardInteraction(btn,
                    () => { // keydown
                        button.setPressed(true);
                        svg.fill(this.buttons[index], this.props.theme.buttonDown);
                    },
                    () => { // keyup
                        button.setPressed(false);
                        svg.fill(this.buttons[index], this.props.theme.buttonUps[index]);
                    }
                );
            })
        }
    }
}