// Auto-generated. Do not edit.


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

declare namespace input {
}
declare namespace input {

    /**
     * Sets the Robotis IR Working State.
     * @param status a value describe the Working Status Enable INT or Not
     */
    //% blockId=Set_Status_ROBOTIS_IR block="Robotis IR Status %status"
    //% parts="RobotisIR"
    //% help=input-on-data-changed blockExternalInputs=0
    //% group="More" weight=15 blockGap=8 shim=input::statusRobotisIR
    function statusRobotisIR(status: status): void;

    /**
     * Get the direction's IR Value.
     * @param direction the direction CM-300 has 5 Robotis IR Sensor
     * Left, Right Side for side Line tracing 
     * Left, Right Front side for detect blocking object
     * Center for Line tracing
     */
    //% blockId=get_Data_ROBOTIS_IR block="IR Velue %direction"
    //% parts="RobotisIR"
    //% help=input-on-data-changed blockExternalInputs=0
    //% group="More" weight=76 shim=input::readIRVelue
    function readIRVelue(direction: direction): int32;
}


    /**
     * Class definition for CM300 Serial.
     */

declare namespace input {
}

// Auto-generated. Do not edit. Really.
