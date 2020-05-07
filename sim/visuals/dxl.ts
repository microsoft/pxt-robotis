namespace pxsim.visuals{
    export class BoardDxl {
        public content: SVGSVGElement;
        public angle: number;
        public curAngle: number;
        public curAngle_2: number;
        constructor(el:SVGSVGElement) {
            this.content = el;
            this.angle = 0;
        }

        

        updateState() {
            //console.log("asdf");
            const holeEl = this.content.getElementById("hole");
            const holeEl_2 = this.content.getElementById("hole-7");
            const state = currentboard().getDxl();
            const state_2 = currentboard().getDxl_2();

            if(!state){
                console.log("no dxl state");
                return;
            }
            
            
            
            this.renderMotorAngle(holeEl, state.angle);
            this.renderMotorAngle_2(holeEl_2, state_2.angle);
        }

        protected renderMotorAngle(holeEl: Element, angle: number) {
            const width = 35.92;
            const height = 35.9;
            const transform = `translate(449.000000, 100.000000) scale(2.5, 2.5) rotate(${angle} ${width / 2} ${height / 2})`;
            holeEl.setAttribute("transform", transform);
        }

        protected renderMotorAngle_2(holeEl: Element, angle: number) {
            const width = 35.92;
            const height = 35.9;
            const transform = `translate(449.000000, 200.000000) scale(2.5, 2.5) rotate(${angle} ${width / 2} ${height / 2})`;
            holeEl.setAttribute("transform", transform);
        }
    }

}