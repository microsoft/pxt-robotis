namespace pxsim {
    export interface DynamixelBoard {
        dynamixelState: DynamixelState;
    }

    export class DynamixelState {
        createDXLDevice(tx: DigitalInOutPin,
            rx: DigitalInOutPin, dir: DigitalInOutPin,
            d: number): DynamixelDevice {
            // TODO mimic C++
            return new DynamixelDevice(tx, rx, dir, d);
        }
    }

    export class DynamixelDevice {
        portBaudRate = 115200;

        constructor(public tx: DigitalInOutPin,
            public rx: DigitalInOutPin, public dir: DigitalInOutPin,
            public d: number) {

        }

        /**
         */
        setPortBaudRate(rate: number): void {
            this.portBaudRate = rate;
        }

        /**
         */
        //% shim=DynamixelDeviceMethods::getPortBaudRate
        getPortBaudRate(): number {
            return this.portBaudRate;
        }

        /**
         */
        ping(id: number): boolean {
            return true;
        }

        /**
         */
        read(id: uint8, addr: uint16, len: uint16): Buffer {
            // TODO
            return
        }

        /**
         */
        write(id: uint8, addr: uint16, buffer: Buffer): void {
            // TODO
        }
    }
}