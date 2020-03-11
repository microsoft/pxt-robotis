namespace network {
    export class DYNAMIXEL {
        dxlDevice: DYNAMIXELDevice;
        constructor(dxlDevice: DYNAMIXELDevice) {
            this.dxlDevice = dxlDevice;
        }
    }

    let _device: DYNAMIXEL;
    export function device(): DYNAMIXEL {
        if (!_device) {
            const tx = pins.pinByCfg(DAL.CFG_PIN_DXL_TX);
            const rx = pins.pinByCfg(DAL.CFG_PIN_DXL_RX);
            const dir = pins.pinByCfg(DAL.CFG_PIN_DXL_DIR);
            if (!tx || !rx || !dir) return undefined;
            const dev = network.InternalCreateDXLDevice(tx, rx, dir, DAL.DEVICE_ID_DYNAMIXEL);
            _device = new DYNAMIXEL(dev);
        }        
        return _device;
    }

    /**
    * Set port baudrate for DYNAMIXEL comm.
    */
    //% blockId=dxl_set_port_baud block="DYNAMIXEL|set port baudrate %rate"
    //% weight=18
    //% group="DYNAMIXEL"
    export function setPortBaud(rate: DXLBaudRate): void {
        const d = device();
        if(d) d.dxlDevice.setPortBaudRate(rate);
    }

    /**
    * DYNAMXIEL Ping
    */
    //% blockId=dxl_ping block="DYNAMIXEL|Ping to ID %id"
    //% id.min=0 id.max= 252
    //% weight=18
    //% group="DYNAMIXEL"
    export function ping(id: number): boolean {
        const d = device();
        return d ? d.dxlDevice.ping(id):false;
    }

    /**
    * DYNAMIXEL Read.
    */
    //% blockId=dxl_read block="DYNAMIXEL|Read from address %addr of ID %id by length %len"
    //% id.min=0 id.max= 252
    //% weight=18
    //% group="DYNAMIXEL"
    export function read(addr: number, id: number, len: number): Buffer {
        const d = device();
        if (d)
            return d.dxlDevice.read(id, addr, len);
        else
            return control.createBuffer(0);
    }

    /**
    * DYNAMIXEL Write.
    */
    //% blockId=dxl_write block="DYNAMIXEL|Write buffer %buffer as long as from address %addr of ID %id "
    //% id.min=0 id.max= 252
    //% weight=18
    //% group="DYNAMIXEL"
    export function write(buffer: Buffer, addr: number, id: number): void {
        const d = device();
        if(d) d.dxlDevice.write(id, addr, buffer);
    }

    /**
    * DYNAMIXEL get Model Number.
    */
    //% blockId=dxl_get_model_num block="DYNAMIXEL|get Model Number of ID %id"
    //% id.min=0 id.max= 252
    //% weight=18
    //% group="DYNAMIXEL"
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
    * DYNAMIXEL set Operating Mode
    */
    //% blockId=dxl_set_operating_mode block="DYNAMIXEL|set Operating Mode of ID %id to %mode"
    //% id.min=0 id.max= 252
    //% weight=18
    //% group="DYNAMIXEL"
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
    * DYNAMIXEL set Torque Enable
    */
    //% blockId=dxl_set_torque_enable block="DYNAMIXEL|set Torque Enable of ID %id to %state=toggleHighLow"
    //% id.min=0 id.max= 252
    //% weight=18
    //% group="DYNAMIXEL"
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
    * DYNAMIXEL set LED.
    */
    //% blockId=dxl_set_led block="DYNAMIXEL|set LED of ID %id to %state=toggleHighLow"
    //% id.min=0 id.max= 252
    //% weight=18
    //% group="DYNAMIXEL"
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
    * DYNAMIXEL set Position.
    */
    //% blockId=dxl_set_position block="DYNAMIXEL|set Position of ID %id to %value"
    //% id.min=0 id.max= 252
    //% value.min=0 value.max= 4096
    //% weight=18
    //% group="DYNAMIXEL"
    export function setPosition(id: number, value: number): void {
        const d = device();
        if(d){
            let data = control.createBuffer(4);
            if(data){
                data.setNumber(NumberFormat.UInt32LE, 0, value);
                d.dxlDevice.write(id, 116, data);
            }
        }
    }
    
    /**
    * DYNAMIXEL get Present Position.
    */
    //% blockId=dxl_get_position block="DYNAMIXEL|get Present Position of ID %id"
    //% id.min=0 id.max= 252
    //% weight=18
    //% group="DYNAMIXEL"
    export function getPosition(id: number): number {
        let value: number = 0;
        const d = device();
        if(d){
            value = d.dxlDevice.read(id, 132, 4).getNumber(NumberFormat.UInt32LE, 0);
        }
        return value;
    }
    
    /**
    * DYNAMIXEL set Velocity.
    */
    //% blockId=dxl_set_velocity block="DYNAMIXEL|set Velocity of ID %id to %value"
    //% id.min=0 id.max= 252
    //% value.min=-1023 value.max=1023
    //% weight=18
    //% group="DYNAMIXEL"
    export function setVelocity(id: number, value: number): void {
        const d = device();
        if(d){
            let data = control.createBuffer(4);
            if(data){
                data.setNumber(NumberFormat.Int32LE, 0, value);
                d.dxlDevice.write(id, 104, data);
            }
        }
    }
    
    /**
    * DYNAMIXEL get Present Velocity.
    */
    //% blockId=dxl_get_velocity block="DYNAMIXEL|get Present Velocity of ID %id"
    //% id.min=0 id.max= 252
    //% weight=18
    //% group="DYNAMIXEL"
    export function getVelocity(id: number): number {
        let value: number = 0;
        const d = device();
        if(d){
            value = d.dxlDevice.read(id, 128, 4).getNumber(NumberFormat.Int32LE, 0);
        }
        return value;
    }    

} // namespace network
