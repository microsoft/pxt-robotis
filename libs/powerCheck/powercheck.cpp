#include "pxt.h"
#include "powercheck.h"

enum class unit {
    //% block="V"
    volt = 0,
    //% block="mV"
    mvolt = 1,
    //% block="adc"
    adc = 2
};

namespace pxt {
SINGLETON(WBat);
}

namespace input {

/**
* Run some code when read Battery Power 
* @param unit the condition volt, millivolt, adc velue
*/
//% blockId=input_on_battery_power block="battery power %unit"
//% parts="batSensing"
//% help=Read battery value, convert to each unit.
//% group="More" weight=76
float readBatteryVolt(unit unit) {
    float temp;
    
    auto battsense = getWBat();
    if (!battsense) return 0;

    auto sensor = &battsense->sensor;

    switch (unit)
    {
        case unit::volt:
            temp = sensor -> readValue();
            temp = (temp * 0.0025787) + 0.4;    //resistance distribution constant
            return temp;

        case unit::mvolt:
            temp = sensor -> readValue();
            temp = (temp * 2.578754) + 400;    //resistance distribution constant * 1000
            return temp;
        
        default:
            return DEVICE_NO_RESOURCES;
    }

}

}
