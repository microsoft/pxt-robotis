// Auto-generated. Do not edit.
declare namespace dynamixel {

    /**
     * Opens a DYNAMIXEL communication driver
     */
    //% shim=dynamixel::internalCreateDXLDevice
    function internalCreateDXLDevice(tx: DigitalInOutPin, rx: DigitalInOutPin, dir: DigitalInOutPin, id: int32): DynamixelDevice;
}
declare namespace dxl {

    /**
     */
    //% shim=dxl::__setPosition
    function __setPosition(id: int32, angle: int32): void;

    /**
     */
    //% shim=dxl::__setVelocity
    function __setVelocity(id: int32, velocity: int32): void;
}


declare interface DynamixelDevice {
    /**
     */
    //% shim=DynamixelDeviceMethods::setPortBaudRate
    setPortBaudRate(rate: DXLBaudRate): void;

    /**
     */
    //% shim=DynamixelDeviceMethods::getPortBaudRate
    getPortBaudRate(): uint16;

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
