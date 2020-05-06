namespace pxsim {
    export interface DynamixelBoard {
        dynamixelState: DynamixelState;
    }

    export class DynamixelState {
        createDXLDevice(tx: pins.DigitalInOutPin,
            rx: pins.DigitalInOutPin, dir: pins.DigitalInOutPin,
            id: number): DynamixelDevice {
            // TODO mimic C++
            return new DynamixelDevice(tx, rx, dir, id);
        }
    }

    export class DynamixelDevice {
        portBaudRate = 115200;

        constructor(public tx: pins.DigitalInOutPin,
            public rx: pins.DigitalInOutPin, public dir: pins.DigitalInOutPin,
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
        read(id: number, addr: number, len: number): RefBuffer {
            // TODO
            return pxsim.BufferMethods.createBuffer(0);
        }

        /**
         */
        write(id: number, addr: number, buffer: RefBuffer): void {
            // TODO
        }

        /**
         */
        //% shim=dynamixel::__setPosition
        setPosition(id:number, position: number): void{
            
        }

        /**
         */
        //% shim=dynamixel::__setVelocity
        setVelocity(id:number, velocity: number): void{
            
        }
    }

    
}

