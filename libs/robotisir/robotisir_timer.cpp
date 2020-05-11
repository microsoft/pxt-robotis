/*******************************************************************************
* Copyright 2016 ROBOTIS CO., LTD.
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*     http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*******************************************************************************/

/**
  * Class definition for CM300 Serial.
  */
#include "pxt.h"
#include "Timer.h"
#include "robotisir_timer.h"
#include "NRFLowLevelTimer.h"


namespace input { 

static irTimer *CM300RobotisIR_device_instance = NULL;
static void timer_irq(uint16_t channels);

NRFLowLevelTimer lowTimer(NRF_TIMER3, TIMER3_IRQn);
CODAL_TIMER devTimer(lowTimer);


irTimer::irTimer
    (Pin &rxLeft, Pin &rxRight, Pin &rxCenter, Pin &rxCenterLeft, Pin &rxCenterRight, Pin &txSide, Pin &txLeft, Pin &txRight) :
    rxLeft(rxLeft), rxRight(rxRight), rxCenter(rxCenter), rxCenterLeft(rxCenterLeft),
    rxCenterRight(rxCenterRight),  txSide(txSide), txLeft(txLeft), txRight(txRight)
    {
        CM300RobotisIR_device_instance = this;
    }

void irTimer::statusIRStop()
{
    lowTimer.disableIRQ();
    lowTimer.disable();
    devTimer.disableInterrupts();
    
    txLeft.setDigitalValue(0);
    txRight.setDigitalValue(0);
    txSide.setDigitalValue(0);
}

void irTimer::statusIRStart()
{
    lowTimer.setIRQPriority(0);
    lowTimer.setBitMode(BitMode8);
    lowTimer.setClockSpeed(2600);

    lowTimer.setIRQ(timer_irq);
    lowTimer.enableIRQ();
    lowTimer.enable();
    devTimer.enableInterrupts();
}

void timer_irq(uint16_t channels)
{ 
    if(CM300RobotisIR_device_instance)
        CM300RobotisIR_device_instance->timerIRQ(channels);
}

void irTimer::timerIRQ(uint16_t)
{
    static uint8_t timeCounter = 0;
    static uint8_t watchMyturn = 0;

    lowTimer.clearCompare(0);

    if(++timeCounter == 1)         // t On Tx
    {
        switch (watchMyturn)
        {
            case 0: txLeft.setDigitalValue(1);
                break;
            case 1: txRight.setDigitalValue(1);
                break;
            case 2: txSide.setDigitalValue(1);
                break;
            case 3: txLeft.setDigitalValue(1);
                break;
            case 4: txRight.setDigitalValue(1);
                break;
            case 5: txSide.setDigitalValue(1);
                break;
            default:
                break;
        }
    }
    else if(timeCounter == 2)         //10ms after 90us start read adc
    {
        switch (watchMyturn)
        {
            case 0 : 
                    valueIR[watchMyturn] = rxCenter.getAnalogValue();
                    txLeft.setDigitalValue(0);
                break;
            case 1 : 
                    valueIR[watchMyturn] = rxCenterRight.getAnalogValue();
                    txRight.setDigitalValue(0);
                break;
            case 2 : 
                    valueIR[watchMyturn] = rxLeft.getAnalogValue();
                    txSide.setDigitalValue(0);
                break;
            case 3 : 
                    valueIR[watchMyturn] = rxCenterLeft.getAnalogValue();
                    txLeft.setDigitalValue(0);
                break;
            case 4 : 
                    valueIR[watchMyturn] = rxCenter.getAnalogValue();
                    txRight.setDigitalValue(0);
                break;
            case 5 : 
                    valueIR[watchMyturn] = rxRight.getAnalogValue();
                    txSide.setDigitalValue(0);
                break;
            default:
                break;
        }
        if(++watchMyturn == 6) watchMyturn = 0;
    }
    else if(timeCounter == 4)     //10us after tx off
    {
        timeCounter = 0;
    }
}

int irTimer::getRobotisIRValue(uint8_t Direction)
{
    return valueIR[Direction];
}

/**
 * Destructor.
 */
irTimer::~irTimer(){

}

}
