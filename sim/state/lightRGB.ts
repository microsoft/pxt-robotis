namespace pxsim {

    export class LightRgbState {
        private r: number;
        private g: number;
        private b: number;

        setColor(r: number, g: number, b: number) {
            this.r = r;
            this.g = g;
            this.b = b;
        }

        getColor(): [number, number, number] {
            return [this.r, this.g, this.b];
        }
    }
}

namespace pxsim.lightRgb {
    export function __setRGBLed(r: number, g: number, b: number): void {
        const led = (board() as DalBoard).lightRgbState;
        led.setColor(r, g, b);
        runtime.queueDisplayUpdate();
    }
}