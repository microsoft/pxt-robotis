//% color=#5C2D91 weight=1000 icon="\uf205"
namespace basic {
    /**
     * Print text on LCD
     * @param text text to print
     */
    //% help=basic/print/print
    //% block="#print %num"
    //% blockId=rcm300_printNum
    //% weight=1 blockGap=8
    export function printNum(num: number): void {
        
    }

    /**
     * Print text on LCD
     * @param text text to print
     */
    //% help=basic/print/print
    //% block="#print %img icon"
    //% blockId=rcm300_printIcon
    //% weight=1 blockGap=8
    export function printIcon(img: number): void {
        
    }

    /**
     * Print text on LCD
     * @param text text to print
     */
    //% help=basic/print/print
    //% block="#print %img drawing"
    //% blockId=rcm300_printDrawing
    //% weight=1 blockGap=8
    export function printDrawing(img: number): void {
        
    }

    /**
     * Repeats the code forever in the background. On each iteration, allows other codes to run.
     * @param body code to execute
     */
    //% help=loops/forever weight=1 afterOnStart=true
    //% blockId=rcm300_forever2 block="#forever" blockAllowMultiple=1
    //% weight=1 blockGap=8
    export function forever2(a: () => void): void {
        loops.forever(a);
    }

    /**
     * Pause for the specified time in milliseconds
     * @param ms how long to pause for, eg: 100, 200, 500, 1000, 2000
     */
    //% help=loops/pause weight=1
    //% async block="#pause %pause=timePicker|ms"
    //% blockId=rcm300_pause2
    //% weight=1 blockGap=8
    export function pause2(ms: number) {
        loops.pause(ms);
    }

    /**
     * Clear LCD Screen
     */
    //% help=basic/clear-screen weight=1
    //% blockId=rcm300_clearScreen block="#clear screen"
    //% weight=1 blockGap=8
    export function clearScreen() {
        
    }
} // namespace basic

enum Sensor_IR_Light {
    //% block="IR 1"
    IR1,
    //% block="IR 2"
    IR2,
    //% block="IR 3"
    IR3,
    //% block="IR 4"
    IR4,
    Light
}

enum SoundCount {
    //% block="Sound Detecting Count"
    SoundDetectingCount,
    //% block="Sound Detected Count"    
    SoundDetectedCount
}

enum Joystick {
    //% block="Joystick X"
    JoystickX,
    //% block="Joystick Y"
    JoystickY
}

//% color=#5C2D91 weight=900 icon="\uf205"
namespace input {
    /**
     * Read sensor (IR, Light)
     */
    //% help=basic/clear-screen weight=1
    //% blockId=rcm300_readSensorIrLight block="#%sensor value"
    //% weight=1 blockGap=8
    export function readSensorIrLight(sensor: Sensor_IR_Light): number {
        return 0;
    }

    /**
     * Read sound count
     */
    //% help=basic/clear-screen weight=1
    //% blockId=rcm300_readSoundCount block="#%sound value"
    //% weight=1 blockGap=8
    export function readSoundCount(sound: SoundCount): number {
        return 0;
    }

    /**
     * Read joystick
     */
    //% help=basic/clear-screen weight=1
    //% blockId=rcm300_readJoystick block="#%joystick value"
    //% weight=1 blockGap=8
    export function readJoystick(joystick: Joystick): number {
        return 0;
    }
} // namespace ButtonMethods

//% color=#5C2D91 weight=900 icon="\uf205"
namespace music {
    /**
     * Check if a button is pressed or not.
     * @param button the button to query the request
     */
    //% help=input/button/is-pressed
    //% block="#%button|is pressed#"
    //% blockId=buttonIsPressed02
    //% weight=50 blockGap=8
    //% trackArgs=0
    export function isPressed(x: Button): boolean {
        // return button->isPressed();
        return true;
    }
} // namespace ButtonMethods

//% color=#5C2D91 weight=900 icon="\uf205"
namespace output {
    /**
     * Check if a button is pressed or not.
     * @param button the button to query the request
     */
    //% help=input/button/is-pressed
    //% block="#%button|is pressed#"
    //% blockId=buttonIsPressed03
    //% weight=50 blockGap=8
    //% trackArgs=0
    export function isPressed(x: Button): boolean {
        // return button->isPressed();
        return true;
    }
} // namespace ButtonMethods

//% color=#5C2D91 weight=900 icon="\uf205"
namespace communication {
    /**
     * Check if a button is pressed or not.
     * @param button the button to query the request
     */
    //% help=input/button/is-pressed
    //% block="#%button|is pressed#"
    //% blockId=buttonIsPressed04
    //% weight=50 blockGap=8
    //% trackArgs=0
    export function isPressed(x: Button): boolean {
        // return button->isPressed();
        return true;
    }
} // namespace ButtonMethods

//% color=#5C2D91 weight=900 icon="\uf205"
namespace loops {
    /**
     * Check if a button is pressed or not.
     * @param button the button to query the request
     */
    //% help=input/button/is-pressed
    //% block="#%button|is pressed#"
    //% blockId=buttonIsPressed05
    //% weight=50 blockGap=8
    //% trackArgs=0
    export function isPressed(x: Button): boolean {
        // return button->isPressed();
        return true;
    }
} // namespace ButtonMethods

//% color=#5C2D91 weight=900 icon="\uf205"
namespace logic {
    /**
     * Check if a button is pressed or not.
     * @param button the button to query the request
     */
    //% help=input/button/is-pressed
    //% block="#%button|is pressed#"
    //% blockId=buttonIsPressed06
    //% weight=50 blockGap=8
    //% trackArgs=0
    export function isPressed(x: Button): boolean {
        // return button->isPressed();
        return true;
    }
} // namespace ButtonMethods