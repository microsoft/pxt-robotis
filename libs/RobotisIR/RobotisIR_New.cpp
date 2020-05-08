#include "pxt.h"
#include "RobotisTimer.h"
#include "NRFLowLevelTimer.h"

enum class direction {
    //% block="Center_L"
    CCL = 0,
    //% block="Front_R"
    FR = 1,
    //% block="Side_L"
    SL = 2,
    //% block="Front_L"
    FL = 3,
    //% block="Center_R"
    CCR = 4,
    //% block="Side_R"
    SR = 5
};

enum class status {
    //% block="Start"
    Start = 0,
    //% block="Stop"
    Stop = 1
};

namespace input {

    class RIrWrap : public RobotisTimer 
    {
        public:
        RIrWrap() :
            RobotisTimer(*LOOKUP_PIN(A5), *LOOKUP_PIN(A3), *LOOKUP_PIN(A6), *LOOKUP_PIN(A0),
            *LOOKUP_PIN(A4), *LOOKUP_PIN(D9), *LOOKUP_PIN(D12), *LOOKUP_PIN(D11) )
            {
            }
    };
    SINGLETON(RIrWrap);

/**
 * Sets the Robotis IR Working State.
 * @param status a value describe the Working Status Enable INT or Not
 */
//% blockId=Set_Status_ROBOTIS_IR block="Robotis IR Status %status"
//% parts="RobotisIR"
//% help=change status robotis ir working status
//% group="More" weight=15 blockGap=8
void statusRobotisIR(status status) {
    static bool isStart = false;
    auto w = getRIrWrap();

    if(isStart == false) {
        isStart = true;
        w -> statusIRStart();
    }
    else {
        isStart = false;
        w -> statusIRStop();
    }
}

/**
 * Get the direction's IR Value.
 * @param direction the direction CM-300 has 5 Robotis IR Sensor
 * Left, Right Side for side Line tracing 
 * Left, Right Front side for detect blocking object
 * Center for Line tracing
 */
//% blockId=get_Data_ROBOTIS_IR block="IR Velue %direction"
//% parts="RobotisIR"
//% help=input-on-data-changed, if robotis ir status is false return 0
//% group="More" weight=76
int readIRVelue(direction direction) {
    int16_t temp = 0;
    auto w = getRIrWrap();
            
    switch (direction)
    {
        case direction::CCL:
            temp = w -> getRobotisIRValue(0);
            if (temp < 0) { temp = 0; }
            
            return temp;

        case direction::FR:
            temp = w -> getRobotisIRValue(1);
            if (temp < 0) { temp = 0; }
            
            return temp;

        case direction::SL:
            temp = w -> getRobotisIRValue(2);
            if (temp < 0) { temp = 0; }
            
            return temp;

        case direction::FL:
            temp = w -> getRobotisIRValue(3);
            if (temp < 0) { temp = 0; }
            
            return temp;

        case direction::CCR:
            temp = w -> getRobotisIRValue(4);
            if (temp < 0) { temp = 0; }
            
            return temp;

        case direction::SR:
            temp = w -> getRobotisIRValue(5);
            if (temp < 0) { temp = 0; }
            
            return temp;

        default:
            return DEVICE_NO_RESOURCES;
    }
}

}