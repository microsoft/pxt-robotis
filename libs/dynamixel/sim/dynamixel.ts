namespace pxsim.dynamixel {
    export function internalCreateDXLDevice(
        tx: pins.DigitalInOutPin,
        rx: pins.DigitalInOutPin,
        dir: pins.DigitalInOutPin,
        id: number): DynamixelDevice {
        const b = board() as any as DynamixelBoard;
        return b?.dynamixelState?.createDXLDevice(tx, rx, dir, id);
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

    export function read(device: DynamixelDevice, id: number, addr: number, len: number): RefBuffer {
        return device.read(id, addr, len);
    }

    export function write(device: DynamixelDevice, id: number, addr: number, buffer: RefBuffer): void {
        device.write(id, addr, buffer);
    }
}
