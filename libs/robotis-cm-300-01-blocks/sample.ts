//% color=#5C2D91 weight=1000 icon="\uf205"
namespace basic {
    /**
     * Print text on LCD
     * @param text text to print
     */
    //% help=basic/print/print
    //% block="#print %num"
    //% blockId=rcm300printNum
    //% weight=2 blockGap=8
    export function printNum(num: number): void {
        
    }

    /**
     * Print text on LCD
     * @param text text to print
     */
    //% help=basic/print/print
    //% block="#print %img icon"
    //% blockId=rcm300printIcon
    //% weight=2 blockGap=8
    export function printIcon(x: number): void {
        
    }

    /**
     * Print text on LCD
     * @param text text to print
     */
    //% help=basic/print/print
    //% block="#print %img drawing"
    //% blockId=rcm300printDrawing
    //% weight=2 blockGap=8
    export function printDrawing(x: number): void {
        
    }

    /**
     * Repeats the code forever in the background. On each iteration, allows other codes to run.
     * @param body code to execute
     */
    //% help=loops/forever weight=100 afterOnStart=true
    //% blockId=forever2 block="#forever" blockAllowMultiple=1
    export function forever2(a: () => void): void {
        loops.forever(a);
    }

    /**
     * Pause for the specified time in milliseconds
     * @param ms how long to pause for, eg: 100, 200, 500, 1000, 2000
     */
    //% help=loops/pause weight=99
    //% async block="#pause %pause=timePicker|ms"
    //% blockId=device_pause2
    export function pause2(ms: number) {
        loops.pause(ms);
    }
} // namespace basic

//% color=#5C2D91 weight=900 icon="\uf205"
namespace input {
    /**
     * Check if a button is pressed or not.
     * @param button the button to query the request
     */
    //% help=input/button/is-pressed
    //% block="#%button|is pressed#"
    //% blockId=buttonIsPressed01
    //% weight=50 blockGap=8
    //% trackArgs=0
    export function isPressed(x: Button): boolean {
        // return button->isPressed();
        return true;
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