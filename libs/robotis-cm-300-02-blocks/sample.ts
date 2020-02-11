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

