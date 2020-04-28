/**
 * Communication between ROBOTIS's DYNAMIXEL devices
 */
//% block="DYNAMIXEL"
//% color=#000000 weight=89 icon="\uf085"
namespace dynamixel {
    export class Dynamixel {
        dxlDevice: DynamixelDevice;
        constructor(dxlDevice: DynamixelDevice) {
            this.dxlDevice = dxlDevice;
        }
    }

    let _device: Dynamixel;
    export function device(): Dynamixel {
        if (!_device) {
            const tx = pins.pinByCfg(DAL.CFG_PIN_DXL_TX);
            const rx = pins.pinByCfg(DAL.CFG_PIN_DXL_RX);
            const dir = pins.pinByCfg(DAL.CFG_PIN_DXL_DIR);
            if (!tx || !rx || !dir) return undefined;
            const dev = dynamixel.internalCreateDXLDevice(tx, rx, dir, DAL.DEVICE_ID_DYNAMIXEL);
            _device = new Dynamixel(dev);

            // enable DXL & set baudrate
            const pwr = pins.pinByCfg(DAL.CFG_PIN_DXL_PWR);
            if (pwr && !pwr.digitalRead()) {
                pwr.digitalWrite(true);
            }

            if (_device.dxlDevice.getPortBaudRate() != 1000000) {
                _device.dxlDevice.setPortBaudRate(DXLBaudRate.BaudRate1M);
            }
        }        
        return _device;
    }

    /**
    * Set port baudrate for Dynamixel comm.
    */
    //% blockId=dxl_set_port_baud block="DXL set port baudrate %rate"
    //% weight=18
    //% advanced=true
    export function setPortBaud(rate: DXLBaudRate): void {
        const d = device();
        if(d) d.dxlDevice.setPortBaudRate(rate);
    }

    /**
    * DYNAMXIEL Ping
    */
    //% blockId=dxl_ping block="DXL Ping to ID %id"
    //% id.min=0 id.max=252 id.defl=1
    //% weight=18
    //% advanced=true
    export function ping(id: number): boolean {
        const d = device();
        return d ? d.dxlDevice.ping(id):false;
    }

    /**
    * DYNAMXIEL Read.
    */
    //% blockId=dxl_read block="DXL Read from address %addr of ID %id by length %len"
    //% id.min=0 id.max=252 id.defl=1
    //% weight=18
    //% advanced=true
    export function read(addr: number, id: number, len: number): Buffer {
        const d = device();
        if (d)
            return d.dxlDevice.read(id, addr, len);
        else
            return control.createBuffer(0);
    }

    /**
    * DYNAMXIEL Write.
    */
    //% blockId=dxl_write block="DXL Write buffer %buffer as long as from address %addr of ID %id "
    //% id.min=0 id.max=252 id.defl=1
    //% weight=18
    //% advanced=true
    export function write(buffer: Buffer, addr: number, id: number): void {
        const d = device();
        if(d) d.dxlDevice.write(id, addr, buffer);
    }

    /**
    * DYNAMXIEL get Model Number.
    */
    //% blockId=dxl_get_model_num block="DXL get Model Number of ID %id"
    //% id.min=0 id.max=252 id.defl=1
    //% weight=18
    //% advanced=true
    export function getModelNumber(id: number): number {
        let num: number = 0;
        const d = device();
        if(d){
            let recv: Buffer = d.dxlDevice.read(id, 0, 2);
            if(recv)
                num = recv.getNumber(NumberFormat.UInt16LE, 0);
        }
        return num;
    }

    /**
    * DYNAMXIEL set Operating Mode
    */
    //% blockId=dxl_set_operating_mode block="DXL set Operating Mode of ID %id to %mode"
    //% id.min=0 id.max=252 id.defl=1
    //% weight=18
    //% advanced=true
    export function setOperatingMode(id: number, mode: DXLOperatingMode): void {
        const d = device();
        if(d){
            let data = control.createBuffer(1);
            if(data){
                data.setNumber(NumberFormat.UInt8LE, 0, mode);
                d.dxlDevice.write(id, 11, data);
            }
        }
    }

    /**
    * DYNAMXIEL set Torque Enable
    */
    //% blockId=dxl_set_torque_enable block="DXL set Torque Enable of ID %id to %state=toggleOnOff"
    //% id.min=0 id.max=252 id.defl=1
    //% weight=18
    //% advanced=true
    export function setTorqueEnable(id: number, state: boolean): void {
        const d = device();
        if(d){
            let data = control.createBuffer(1);
            if(data){
                data.setNumber(NumberFormat.UInt8LE, 0, state==true?1:0);
                d.dxlDevice.write(id, 64, data);
            }
        }
    }

    /**
    * DYNAMXIEL set LED.
    */
    //% blockId=dxl_set_led block="DXL set LED of ID %id to %state=toggleOnOff"
    //% id.min=0 id.max=252 id.defl=1
    //% weight=18
    export function setLED(id: number, state: boolean): void {
        const d = device();
        if(d){
            let data = control.createBuffer(1);
            if(data){
                data.setNumber(NumberFormat.UInt8LE, 0, state==true?1:0);
                d.dxlDevice.write(id, 65, data);
            }
        }
    }

    /**
    * DYNAMXIEL set Position.
    */
    //% blockId=dxl_set_position block="DXL set Position of ID %id to %value"
    //% id.min=0 id.max=252 id.defl=1
    //% value.min=0 value.max=4095
    //% weight=18
    export function setPosition(id: number, value: number): void {
        const d = device();
        if(d){
            dynamixel.setOperatingMode(id, DXLOperatingMode.OPModePosition);
            dynamixel.setTorqueEnable(id, true);

            let data = control.createBuffer(4);
            if(data){
                data.setNumber(NumberFormat.UInt32LE, 0, value);
                d.dxlDevice.write(id, 116, data);
            }

            dxl.__setPosition(id, value);
        }
    }
    
    /**
    * DYNAMXIEL get Present Position.
    */
    //% blockId=dxl_get_position block="DXL get Present Position of ID %id"
    //% id.min=0 id.max=252 id.defl=1
    //% weight=18
    //% advanced=true
    export function getPosition(id: number): number {
        let value: number = 0;
        const d = device();
        if(d){
            value = d.dxlDevice.read(id, 132, 4).getNumber(NumberFormat.UInt32LE, 0);
        }
        return value;
    }
    
    /**
    * DYNAMXIEL set Velocity.
    */
    //% blockId=dxl_set_velocity block="DXL set Velocity of ID %id to %value"
    //% id.min=0 id.max=252 id.defl=1
    //% value.min=-1023 value.max=1023
    //% weight=18
    //% advanced=true
    export function setVelocity(id: number, value: number): void {
        const d = device();
        if(d){
            let data = control.createBuffer(4);
            if(data){
                data.setNumber(NumberFormat.Int32LE, 0, value);
                d.dxlDevice.write(id, 104, data);
            }

            dxl.__setVelocity(id, value);
        }
    }
    
    /**
    * DYNAMXIEL get Present Velocity.
    */
    //% blockId=dxl_get_velocity block="DXL get Present Velocity of ID %id"
    //% id.min=0 id.max=252 id.defl=1
    //% weight=18
    //% advanced=true
    export function getVelocity(id: number): number {
        let value: number = 0;
        const d = device();
        if(d){
            value = d.dxlDevice.read(id, 128, 4).getNumber(NumberFormat.Int32LE, 0);
        }
        return value;
    }    
} // namespace dynamixel