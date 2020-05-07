//% color="#68C3E2" weight=101
namespace event {
    /**
     * Exits the program to the main menu. (in the simulator restarts it)
     */
    //% blockId=loopstop12 block="exit program"
    //% weight=10
    //% blockGap=8
    export function exitProgram() {
        control.reset();
    }
}
//% color="#C8509B" weight=100
namespace communication {
    /**
     * Exits the program to the main menu. (in the simulator restarts it)
     */
    //% blockId=loopstop block="exit program"
    //% weight=10
    //% blockGap=8
    export function exitProgram() {
        control.reset();
    }
}

//% color="#D67923" weight=99
namespace output {

    /**
     * Exits the program to the main menu. (in the simulator restarts it)
     */
    //% blockId=loopstop1 block="exit program"
    //% weight=10
    //% blockGap=8
    export function exitProgram() {
        control.reset();
    }
}

//% color="#5F3109" weight=98
//% groups='["LCD"]'
namespace input {

    /**
     * Exits the program to the main menu. (in the simulator restarts it)
     */
    //% blockId=loopstop2 block="exit program"
    //% weight=10
    //% blockGap=8
    export function exitProgram() {
        control.reset();
    }  

}

//% color="#EF2D56" weight=97
namespace lcd {
    /**
     * Exits the program to the main menu. (in the simulator restarts it)
     */
    //% blockId=loopstop3 block="exit program"
    //% weight=10
    //% blockGap=8
    export function exitProgram() {
        control.reset();
    }
}

//% color="#011C32" weight=96 advanced=false
//% groups='["ROBOTIS"]'
namespace control {
    /**
     * Exits the program to the main menu. (in the simulator restarts it)
     */
    //% blockId=loopstop4 block="exit program"
    //% weight=10
    //% blockGap=8
    //% group="ROBOTIS"
    export function exitProgram() {
        control.reset();
    }
}

