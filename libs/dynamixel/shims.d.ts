// Auto-generated. Do not edit.
declare namespace dynamixel {

    /**
     * Opens a DYNAMIXEL communication driver
     */
    //% shim=dynamixel::InternalCreateDXLDevice
    function InternalCreateDXLDevice(tx: DigitalInOutPin, rx: DigitalInOutPin, dir: DigitalInOutPin, id: int32): DynamixelDevice;
}


declare interface DynamixelDevice {
    /**
     */
    //% shim=DynamixelDeviceMethods::setPortBaudRate
    setPortBaudRate(rate: DXLBaudRate): void;

    /**
     */
    //% shim=DynamixelDeviceMethods::ping
    ping(id: uint8): boolean;

    /**
     */
    //% shim=DynamixelDeviceMethods::read
    read(id: uint8, addr: uint16, len: uint16): Buffer;

    /**
     */
    //% shim=DynamixelDeviceMethods::write
    write(id: uint8, addr: uint16, buffer: Buffer): void;
}

// Auto-generated. Do not edit. Really.
