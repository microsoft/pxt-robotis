namespace pxsim {

    export class LightRGBState {
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

namespace pxsim.lightRGB {
    export function __setRGBLed(r: number, g: number, b: number): void {
        const led = (board() as DalBoard).lightRGBState;
        led.setColor(r, g, b);
        runtime.queueDisplayUpdate();
    }
}