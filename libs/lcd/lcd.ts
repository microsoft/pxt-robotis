enum Mode {
    //% block="흑백"
    grayscale,
    //% block="칼라"
    color,
}

//% color="#00852B" weight=97
namespace lcd{

    /**
     * LCD 화면에 숫자(값) 출력
     * @param displayNum display number
     */
    //% blockId=display_lcd_num block="수 출력 %displayNum"
    //% weight=8
    //% blockGap=8
    export function displayNum(displayNum?:number) {
    }

    /**
     * 현재 LCD의 스크린 밝기
     */
    //% blockId=lcd_brightness block="LCD 스크린 밝기"
    //% weight=3
    //% blockGap=8
    export function getBrightness(): number {
        return 0;
    }

    /**
     * 흑백/칼라 등으로 LCD 화면 설정
     * @param mode color mode
     */
    //% blockId=set_lcd_mode block="LCD 출력을 %mode 으로 설정"
    //% weight=2
    //% blockGap=8
    export function setLcdMode(mode: Mode) {
    }

    /**
     * 입력한 문자열 출력
     * @param text draw text
     */
    //% blockId=text_lcd_display block="문자 출력 %text"
    //% weight=1
    //% blockGap=8
    export function drawTextDisplay(text: string){
        if(!text) return;
    }

    /**
     * 지정한 값으로 LCD 밝기 변경
     * @param brightness LCD brightness settings
     */
    //% blockId=set_lcd_brightness block="LCD 스크린 밝기 %brightness 변경"
    //% brightness.min=0 brightness.max=100
    //% weight=0
    //% blockGap=8
    export function setLCDbrightness(brightness: number){
    }

}