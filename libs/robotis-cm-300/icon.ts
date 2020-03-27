namespace icon {

    /**
     * Exits the program to the main menu. (in the simulator restarts it)
     */
    //% blockId=loopstop block="exit program"
    //% help=reference/brick/exit-program
    //% weight=10
    //% blockGap=8
    //% group="Icons"
    export function exitProgram() {
        control.reset();
    }

        /**
     * 
     * @param image  image to draw.
     */
    //% blockId=icon_show_image block="showing imasges %image=robotis_image_picker"
    //% weight=100 group="Screen" blockGap=8
    //% advanced=false
    //% subcategory="Robotis"
    export function showImage(image:Image){
    }

    /**
     *  An image
     * @param image the image
     */
    //% blockId=robotis_image_picker block="%image" blockHidden=true shim=TD_ID
    //% image.fieldEditor="images"
    //% image.fieldOptions.columns=2
    //% image.fieldOptions.width=200
    //% group="Icons"
    export function __imagePicker(image: Image): Image{
        return image;
    }

}