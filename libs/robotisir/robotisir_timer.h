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

#ifndef ROBOTISIR_TIMER_H
#define IR_TIMER_H

#include "pxt.h"
#include "Timer.h"
#include "NRFLowLevelTimer.h"

namespace input
{
    class irTimer
    {   
        Pin&      rxLeft;              // Pin where the sensor is connected.
        Pin&      rxRight;              // Pin where the sensor is connected.
        Pin&      rxCenter;              // Pin where the sensor is connected.
        Pin&      rxCenterLeft;              // Pin where the sensor is connected.
        Pin&      rxCenterRight;              // Pin where the sensor is connected.
        Pin&      txSide;              // Pin where the sensor is connected.
        Pin&      txLeft;              // Pin where the sensor is connected.
        Pin&      txRight;              // Pin where the sensor is connected.

        public:

        int16_t   valueIR[6] = {0,0,0,0,0,0};
        uint16_t  id;

        // NRFLowLevelTimer    timer2;
        // Timer               timer;
        /**
          * Constructor.
          *
          * Creates a generic AnalogSensor.
          *
          * @param pin The pin on which to sense
          * @param id The ID of this compoenent e.g.
         */
        irTimer
          (Pin &rxLeft, Pin &rxRight, Pin &rxCenter, Pin &rxCenterLeft, Pin &rxCenterRight, 
                        Pin &txSide, Pin &txLeft, Pin &txRight);     
                        
        void statusIRStop();      
        void statusIRStart();
        void timerIRQ(uint16_t);    

        int getRobotisIRValue(uint8_t Direction);
        
        ~irTimer();
    };
}


#endif