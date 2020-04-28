namespace pxsim {

    export class DxlState {
        private id: number;
        public angle: number;
        public velocity: number;

        constructor(id:number, angle:number){
            this.id = id;
            this.angle = angle;
            this.velocity = 0;
        }

        setPosition(id: number, angle: number) {
            this.id = id;
            this.angle = angle;
            //console.log(this.id);
        }

        getPosition(): [number, number] {
            return [this.id, this.angle];
        }

        setVelocity(id: number, velocity: number)
        {
            this.id = id;
            this.velocity = velocity;
        }
    }
}

namespace pxsim.dxl {
    export function __setVelocity(id:number, velocity:number): void{
        let dxl;
        let dxl_2;
        console.log(id + " , " + velocity);
        switch(id){
            case 1:
                dxl = (board() as DalBoard).dxlState;
                dxl.setVelocity(id, velocity);
                break;
            case 2:
                dxl_2 = (board() as DalBoard).dxlState_2;
                dxl_2.setVelocity(id, velocity);
                break;
        }
    }
    export function __setPosition(id:number, angle:number): void {
        let dxl;
        let dxl_2;
        let tmp_bool = false;
        let tmp_bool_2 = false;
       
        switch(id){
            case 1:
                dxl = (board() as DalBoard).dxlState;
                // dxl.setPosition(id, angle);
                const curState = dxl.getPosition();
                const velocity = dxl.velocity / 1023;
                
                if(curState[1] >= 360) curState[1] -= 360;
                else if(curState[1] <= -360) curState[1] += 360;
                
                if(velocity < 0)
                {
                    let tmp = angle;
                    tmp = tmp / 4096 * 360 -360;
                    angle = tmp;
                }
                else
                {
                    let tmp = angle;
                    tmp = tmp / 4096 * 360;
                    angle = tmp;
                }
                

                //console.log(curState[1] + " , " + angle);
                if((Math.abs(curState[1]) - Math.abs(angle)) > 1 || (Math.abs(curState[1]) - Math.abs(angle)) < -1)
                {
                    if(velocity != 0)
                    {
                        const toAngle = curState[1] + velocity * 5;
                        dxl.setPosition(id, toAngle);
                    }
                    
                }
                else
                    tmp_bool = true;

                break;
            case 2:
                dxl_2 = (board() as DalBoard).dxlState_2;
                
                const curState_2 = dxl_2.getPosition();
                const velocity_2 = dxl_2.velocity / 1023;
                
                if(curState_2[1] >= 360) curState_2[1] -= 360;
                else if(curState_2[1] <= -360) curState_2[1] += 360;
                
                if(velocity_2 < 0)
                {
                    let tmp = angle;
                    tmp = tmp / 4096 * 360 -360;
                    angle = tmp;
                }
                else
                {
                    let tmp = angle;
                    tmp = tmp / 4096 * 360;
                    angle = tmp;
                }
                

                //console.log(curState[1] + " , " + angle);
                if((Math.abs(curState_2[1]) - Math.abs(angle)) > 1 || (Math.abs(curState_2[1]) - Math.abs(angle)) < -1)
                {
                    if(velocity_2 != 0)
                    {
                        const toAngle = curState_2[1] + velocity_2 * 5;
                        dxl_2.setPosition(id, toAngle);
                    }
                    
                }
                else
                    tmp_bool_2 = true;
                break;

        }
        //console.log("dxl__setPosition");
        
        runtime.queueDisplayUpdate();

    }
}