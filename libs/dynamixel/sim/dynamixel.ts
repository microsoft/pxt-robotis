namespace pxsim.dynamixel {
    export function internalCreateDXLDevice(tx: DigitalInOutPin, 
            rx: DigitalInOutPin, dir: DigitalInOutPin, 
            d: number): DynamixelDevice {
        const b = board() as DynamixelBoard;
        return b?.dynamixelState?.createSerialDevice(tx, rx, dir, id);
    }
}

namespace pxsim.DynamixelDeviceMethods {
    export function setPortBaudRate(device: DynamixelDevice, rate: number): void {
        device.setPortBaudRate(rate);
    }

    export function getPortBaudRate(device: DynamixelDevice): number {
        return device.getPortBaudRate();
    }

    export function ping(device: DynamixelDevice, id: number): boolean {
        return device.ping(id);
    }

    export function read(device: DynamixelDevice, id: uint8, addr: uint16, len: uint16): Buffer {
        return device.read(id, addr, len);
    }

    export function write(device: DynamixelDevice, id: uint8, addr: uint16, buffer: Buffer): void {
        device.write(id, addr, buffer);
    }
}
