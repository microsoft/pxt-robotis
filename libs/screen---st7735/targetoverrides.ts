enum ScreenChanel {
    //% block="chanel1"
    chanel1,
    //% block="chanel2"
    chanel2,
    //% block="chanel3"
    chanel3,
    //% block="chanel4"
    chanel4,
}
/**
 * by kjs 20200422
 */
/**
 * Tagged image literal converter
 */
//% shim=@f4 helper=image::ofBuffer blockIdentity="sprites._createImageShim"
//% groups=["0.","1#","2T","3t","4N","5n","6G","7g","8","9","aAR","bBP","cCp","dDO","eEY","fFW"]
function img(lits: any, ...args: any[]): Image { return null }

// set palette before creating screen, so the JS version has the right BPP
image.setPalette(hex`__palette`)
//% whenUsed
const screen = _screen_internal.createScreen();

namespace image {
    //% shim=pxt::setPalette
    export function setPalette(buf: Buffer) { }
}

namespace _screen_internal {
    //% shim=pxt::updateScreen
    function updateScreen(img: Image): void { }
    //% shim=pxt::updateStats
    function updateStats(msg: string): void { }

    //% shim=pxt::updateScreenStatusBar
    function updateScreenStatusBar(img: Image): void { return }
    //% shim=pxt::setupScreenStatusBar
    function setupScreenStatusBar(barHeight: number): void { return }

    //% parts="screen"
    export function createScreen() {
        const img = image.create(160, 120)
        
        setupScreenStatusBar(8)

        const status = image.create(160, 8)
        updateScreenStatusBar(status) // clear the status area

        control.__screen.setupUpdate(() => updateScreen(img))
        control.EventContext.onStats = function (msg: string) {
            status.fill(0)
            status.print(msg, 2, 2, 1, image.font5)
            updateScreenStatusBar(status)
            updateStats(msg);
        }

        return img as ScreenImage;
    }
}
namespace communication {
    

    /**
     * An image
     * @param image the image
     */
    //% blockId=robotis_image_picker block="%image" shim=TD_ID
    //% image.fieldEditor="images"
    //% image.fieldOptions.columns=3
    //% image.fieldOptions.width=300
    //% group="Screen" weight=0 blockHidden=1
    export function __imagePicker(image: Image): Image {
        return image;
    }

    /**
     * Show an image on the screen
     * @param image image to draw
     */
    //% blockId=screen_show_image block="RF : %image=robotis_image_picker 을 %channel 에 보내기"
    //% weight=7 blockGap=8
    export function showImage(image: Image, channel?: ScreenChanel) {
        if (!image) return;
    }

    /**
     * This is an event handler block
     * * @param image image to draw
     */
    //% blockId=received_icon_event block="RF : %image=robotis_image_picker 를 받았을 때 실행"
    //% weight=6
    //% blockGap=8
    export function receivedIconEvent(image: Image, handler: () => void) {

    }    

    /**
     * 받은 메시지를 LCD에 출력
     * @param msg received message
     */
    //% blockId=received_msg_display block="RF : 받은 %msg 를 LCD에 출력"
    //% weight=5
    //% blockGap=8
    export function receivedMsgDisplay(msg: string){
        if(!msg) return;
    }

    /**
     * 받은 아이콘을 LCD에 출력
     * @param image received icon
     */
    //% blockId=received_icon_display block="RF : 받은 %image=robotis_image_picker 을 LCD에 출력"
    //% weight=4
    //% blockGap=8
    export function receivedIconDisplay(image: Image){
        if(!image) return;
    }

}

namespace lcd {
    /**
     * LCD 창에 그린 이미지 출력
     * @param image draw image
     */
    //% blockId=image_lcd_display block="LCD 출력 %image=background_image_picker"
    //% weight=6
    //% blockGap=8
    export function drawImageDisplay(image: Image){
        if(!image) return;
    }

    /**
     * 목록에서 선택한 아이콘 출력
     * @param image draw icon
     */
    //% blockId=icon_lcd_display block="아이콘 출력 %image=robotis_image_picker"
    //% weight=5
    //% blockGap=8
    export function drawIconDisplay(image: Image){
        if(!image) return;
    }

    /**
     * LCD 화면 내용 지우기
     */
    //% blockId=clean_lcd_display block="LCD 지우기"
    //% weight=4
    //% blockGap=8
    export function clearDisplay(){
    }
}