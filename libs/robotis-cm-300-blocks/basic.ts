//% color=#0078D7 weight=1000 icon="\uf02e" block="Basic"
namespace basic {
    /**
     * Print arrow on LCD
     * @param img arrow to print
     */
    //% help=basic/printIcon3
    //% blockId=cm300_printIcon3 block="#print %img (arrow UI)"
    //% weight=1 blockGap=8
    export function printIcon3(img: number): void {
        
    }

    /**
     * Clear LCD screen
     */
    //% help=basic/clear-screen
    //% blockId=cm300_clearScreen block="#clear screen"
    //% weight=1 blockGap=8
    export function clearScreen() {
        
    }

    /**
     * Pause for the specified time in milliseconds
     * @param ms how long to pause for, eg: 100, 200, 500, 1000, 2000
     */
    //% help=loops/pause
    //% async block="#pause %pause=timePicker|ms"
    //% blockId=cm300_pause2
    //% weight=1 blockGap=8
    export function pause2(ms: number) {
        loops.pause(ms);
    }

    /**
     * Repeats the code forever in the background. On each iteration, allows other codes to run.
     * @param body code to execute
     */
    //% help=loops/forever afterOnStart=true
    //% blockId=cm300_forever2 block="#forever" blockAllowMultiple=1
    //% weight=1 blockGap=8
    export function forever2(a: () => void): void {
        loops.forever(a);
    }

    /**
     * Print text on LCD
     * @param text text to print
     */
    //% help=basic/print/print
    //% blockId=cm300_printTextg block="#print %text"
    //% weight=1 blockGap=8
    export function printText(text: string): void {

    }

    /**
     * Print icon on LCD
     * @param img icon to print
     */
    //% help=basic/print/print
    //% blockId=cm300_printIcon2 block="#print %img (icon UI)"
    //% weight=1 blockGap=8
    export function printIcon2(img: number): void {
        
    }

    /**
     * Print drawing on LCD
     * @param img drawing to print
     */
    //% help=basic/print/print
    //% blockId=cm300_printDrawing block="#print %img=screen_image_picker (drawing UI)"
    //% weight=1 blockGap=8
    export function printDrawing(img: Image): void {
        img = _tileImage(img);
    }

    /**
     * Print Image
     * @param img num to print
     */
    //% blockId=cm300_printDrawing_picker block="%img"
    //% shim=TD_ID
    //% img.fieldEditor="sprite"
    //% img.fieldOptions.taggedTemplate="img"
    //% img.fieldOptions.decompileIndirectFixedInstances="true"
    //% img.fieldOptions.sizes="16,16;32,32;8,8"
    //% img.fieldOptions.filter="tile"
    //% weight=1 blockGap=8
    export function _tileImage(img: Image) {
        return img;
    }

    /**
     * Print number on LCD
     * @param num num to print
     */
    //% help=basic/print/print
    //% blockId=cm300_printNum2 block="#print %num"
    //% weight=1 blockGap=8
    export function printNum2(num: number): void {
        // printCM300();
    }
}