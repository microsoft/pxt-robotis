enum CM300_Screen_Color {
    Gray,
    Color
}

enum CM300_Motor_ID {
    //% block="Motor ID 1"
    ID_1,
    //% block="Motor ID 2"
    ID_2,
    //% block="Motor ID ALL"
    ID_ALL
}

enum CM300_Motor_Mode {
    //% block="Wheel Mode"
    Wheel,
    //% block="Joint Mode"
    Joint
}

enum CM300_Direction {
    //% block="Forward"
    Forward,
    //% block="Backward"
    Backward,
    //% block="Turn left"
    TurnLeft,
    //% block="Turn right"
    TurnRight,
    //% block="Stop"
    Stop
}

enum CM300_Clock_Direction {
    //% block="Clockwise"
    Clockwise,
    //% block="Counterclockwise"
    Counterclockwise
}

//% color=#A80000 weight=900 icon="\uf140" block="Output"
namespace output {
    /**
     * Set position for a motor.
     * @param motorID motor id to set
     * @param position position to set
     */
    //% help=basic/clear-screen
    //% blockId=cm300_setModtorIdPosition block="#motor ID %motorId , position to %position"
    //% weight=1 blockGap=8
    //% position.defl=512 position.min=0 position.max=1024
    //% motorId.defl=1 motorId.min=1 motorId.max=2
    export function setModtorIdPosition(motorId: number, position: number): void {

    }

    /**
     * Set speed and direction for a motor.
     * @param motorID motor id to set
     * @param speed speed to move
     * @param direction clockwise, countclockwise
     */
    //% help=basic/clear-screen
    //% blockId=cm300_setModtorIdSpeedDirection block="#motor ID %motorId , speed to %speed ％, direction to %direction"
    //% weight=1 blockGap=8
    //% speed.defl=50 speed.min=0 speed.max=100
    //% motorId.defl=1 motorId.min=1 motorId.max=2
    export function setModtorIdSpeedDirection(motorId: number, speed: number, direction: CM300_Clock_Direction): void {

    }

    /**
     * Set E2 robot speed and direction.
     * @param spdde speed of E2
     * @param direction forward, backward, left, right
     */
    //% help=basic/clear-screen
    //% blockId=cm300_setSpeedDirection block="#set E2 speed to %speed ％, direction to %direction"
    //% weight=1 blockGap=8
    //% speed.defl=50 speed.min=0 speed.max=100
    export function setSpeedDirection(speed: number, direction: CM300_Direction): void {

    }

    /**
     * Set speed in joint mode for all motor.
     * @param speed speed in joint mode
     */
    //% help=basic/clear-screen
    //% blockId=cm300_setJointModeSpeed block="#set speed of joint mode to %speed ％"
    //% weight=1 blockGap=8
    //% speed.defl=50 speed.min=0 speed.max=100
    export function setJointModeSpeed(speed: number): void {

    }

   /**
     * Set motor mode.
     * @param motor motor ID to set mode
     * @param mode wheel, joint
     */
    //% help=basic/clear-screen
    //% blockId=cm300_setMotorMode block="#set %motor to %mode"
    //% weight=1 blockGap=8
    export function setMotorMode(motor: CM300_Motor_ID, mode: CM300_Motor_Mode): void {

    }

    /**
     * Set screen color to display.
     * @param color gray, color
     */
    //% help=basic/clear-screen
    //% blockId=cm300_setScreenColor block="#set screen mode to %color"
    //% weight=1 blockGap=8
    export function setScreenColor(color: CM300_Screen_Color): void {

    }

    /**
     * Read screen brightness.
     */
    //% help=basic/clear-screen
    //% blockId=cm300_readcreenBrightnes block="#read screen brightness"
    //% weight=1 blockGap=8
    export function readcreenBrightnes(): number {
        return 0;
    }

    /**
     * Set screen brightness.
     * @param bright brightness to set
     */
    //% help=basic/print/print
    //% blockId=cm300_setScreenBrightness block="#set screen brightness to %bright"
    //% weight=1 blockGap=8
    //% bright.defl=50 bright.min=1 bright.max=100
    export function setScreenBrightness(bright: number): void {
        
    }
}