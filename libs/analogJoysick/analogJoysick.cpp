#include "pxt.h"
#include "analogJoysick.h"

enum class dimension {
    //% block="x"
    x = 0,
    //% block="y"
    y = 1,
    //% block="z"
    z = 2
};

namespace pxt {
SINGLETON(WJoystick);
}

namespace input {

/**
* Run some code when read analog joystick 
* @param dimension the condition X, Y, Z velue
*/
//% blockId=input_on_analog_joystick block="Analog Joystick %dimension"
//% parts="joystick"
//% help=Read analog joystic value, Z dimension not support.
//% group="More" weight=76
float readAnalogJoystick(dimension dimension) {
    float temp;
    
    auto joysticksense = getWJoystick();
    if (!joysticksense) return 0;

    auto sensor = &joysticksense->sensor;

    switch (dimension)
    {
        case dimension::x:
            temp = ((sensor -> readValue()) >> 16);  //return Velue type 32Bit Upper 16Bit Demension X
            return temp;

        case dimension::y:
            temp = ((sensor -> readValue()) & 0x0000FFFF);  //return Velue type 32Bit Lower 16Bit Demension Y
            return temp;
        
        default:
            return DEVICE_NO_RESOURCES;     // Demension Z not support this analogjoystick.
    }

}

}
