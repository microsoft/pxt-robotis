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

declare namespace DYNAMIXEL {
}
declare namespace network {

    /**
     * Opens a DYNAMIXEL communication driver
     */
    //% shim=network::InternalCreateDXLDevice
    function InternalCreateDXLDevice(tx: DigitalInOutPin, rx: DigitalInOutPin, dir: DigitalInOutPin, id: int32): DYNAMIXELDevice;
}


declare interface DYNAMIXELDevice {
    /**
     */
    //% shim=DYNAMIXELDeviceMethods::setPortBaudRate
    setPortBaudRate(rate: DXLBaudRate): void;

    /**
     */
    //% shim=DYNAMIXELDeviceMethods::ping
    ping(id: uint8): boolean;

    /**
     */
    //% shim=DYNAMIXELDeviceMethods::read
    read(id: uint8, addr: uint16, len: uint16): Buffer;

    /**
     */
    //% shim=DYNAMIXELDeviceMethods::write
    write(id: uint8, addr: uint16, buffer: Buffer): void;
}

// Auto-generated. Do not edit. Really.
