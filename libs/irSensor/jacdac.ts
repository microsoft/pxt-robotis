/// <reference path="../../node_modules/pxt-common-packages/libs/jacdac/sensordriver.ts"/>
/// <reference path="../../node_modules/pxt-common-packages/libs/jacdac/config.ts"/>
/// <reference path="../../node_modules/pxt-core/built/pxtsim.d.ts" />

namespace jacdac {
    export class irsensorService extends jacdac.SensorHost {
        constructor(name: string) {
            super(name, jacdac.THERMOMETER_DEVICE_CLASS);
            input.onirsensorConditionChanged(TemperatureCondition.Cold, 10, TemperatureUnit.Celsius, () => this.raiseHostEvent(TemperatureCondition.Cold));
            input.onirsensorConditionChanged(TemperatureCondition.Cold, 30, TemperatureUnit.Celsius, () => this.raiseHostEvent(TemperatureCondition.Hot));
        }

        protected serializeState(): Buffer {
            const buf = control.createBuffer(4);
            buf.setNumber(NumberFormat.Int32LE, 0, input.irsensor(TemperatureUnit.Celsius));
            return buf;
        }
    }

    //% fixedInstance whenUsed block="irsensor service"
    export const irsensorService = new irsensorService("irsensor");
}