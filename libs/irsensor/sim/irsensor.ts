/// <reference path="../../../node_modules/pxt-core/built/pxtsim.d.ts" />

namespace pxsim.input {

    export function irsensor(id: number): number {
        let b = irsensorState();
        b.setUsed();
        
        return b.getLevel(id);
    }

    export function onirsensorConditionChanged(id: number, value: number, body: RefAction) {
        let b = irsensorState();
        b.setUsed();

        pxtcore.registerWithDal(id, value, body);
    }

    // export function onirsensorConditionChanged(condition: number, temperature: number, unit: number, body: RefAction) {
    //     console.log("### onirsensorConditionChanged()");
    //     let b = irsensorState();

    //     b.setUsed();

    //     // setirsensorUnit(unit);

    //     const t = unit == pxsim.TemperatureUnit.Celsius 
    //         ? temperature 
    //         : (((temperature - 32) * 10) / 18 >> 0);
        
    //     if (condition === DAL.LEVEL_THRESHOLD_HIGH) {
    //         b.setHighThreshold(t);
    //     }
    //     else {
    //         b.setLowThreshold(t);
    //     }

    //     pxtcore.registerWithDal(b.id, condition, body);
    // }
}