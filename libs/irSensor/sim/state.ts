/// <reference path="../../../built/common-sim.d.ts"/>

namespace pxsim {
    export interface irsensorBoard extends CommonBoard {
        irsensorState: IrsensorState;
    }

    export function irsensorState(): IrsensorState {
        return (board() as irsensorBoard).irsensorState;
    }

    export class IrsensorState {
        public sensorUsed: boolean = false;
        public level: number[];

        constructor() {
            this.level = [];
        }

        public setUsed() {
            if (!this.sensorUsed) {
                this.sensorUsed = true;
                runtime.queueDisplayUpdate();
            }
        }

        public setLevel(id: number, level: number) {
            this.level[id] = level;
        }

        public getLevel(id: number): number {
            if (this.level[id] == undefined)
                return 0;
            
            return this.level[id];
        }
    }
}