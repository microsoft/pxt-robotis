enum CM300_Sensor_IR_Light {
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

enum CM300_SoundCount {
    //% block="Sound Detecting Count"
    SoundDetectingCount,
    //% block="Sound Detected Count"    
    SoundDetectedCount
}

enum CM300_Joystick_XY {
    //% block="Joystick X"
    JoystickX,
    //% block="Joystick Y"
    JoystickY
}

enum CM300_Joystick_Button {
    //% block="Joystick Up"
    JoystickUp,
    //% block="Joystick Down"
    JoystickDown,
    //% block="Joystick Left"
    JoystickLeft,
    //% block="Joystick Right"
    JoystickRight
}

enum CM300_Gesture {
    /**
     * Raised when shaken
     */
    //% block=shake
    Shake = 11,  // ACCELEROMETER_EVT_SHAKE
    /**
     * Raised when the device tilts up
     */
    //% block="tilt up"
    TiltUp = 1,  // ACCELEROMETER_EVT_TILT_UP
    /**
     * Raised when the device tilts down
     */
    //% block="tilt down"
    TiltDown = 2,  // ACCELEROMETER_EVT_TILT_DOWN
    /**
     * Raised when the screen is pointing left
     */
    //% block="tilt left"
    TiltLeft = 3,  // ACCELEROMETER_EVT_TILT_LEFT
    /**
     * Raised when the screen is pointing right
     */
    //% block="tilt right"
    TiltRight = 4,  // ACCELEROMETER_EVT_TILT_RIGHT
    /**
     * Raised when the screen faces up
     */
    //% block="face up"
    FaceUp = 5,  // ACCELEROMETER_EVT_FACE_UP
    /**
     * Raised when the screen is pointing up and the board is horizontal
     */
    //% block="face down"
    FaceDown = 6,  // ACCELEROMETER_EVT_FACE_DOWN
    /**
     * Raised when the board is falling!
     */
    //% block="free fall"
    FreeFall = 7,  // ACCELEROMETER_EVT_FREEFALL
    /**
     * Raised when a 2G shock is detected
     */
    //% block="2g (step)"
    TwoG = 12,  // ACCELEROMETER_EVT_2G
    /**
     * Raised when a 3G shock is detected
     */
    //% block="3g"
    ThreeG = 8,  // ACCELEROMETER_EVT_3G
    /**
     * Raised when a 6G shock is detected
     */
    //% block="6g"
    SixG = 9,  // ACCELEROMETER_EVT_6G
    /**
     * Raised when a 8G shock is detected
     */
    //% block="8g"
    EightG = 10,  // ACCELEROMETER_EVT_8G
}


//% color=#B4009E weight=900 icon="\uf192" block="Input"
namespace input {
    /**
     * Read working time. (time from boot to present.)
     */
    //% help=basic/clear-screen
    //% blockId=cm300_readWorkingTime block="#working time"
    //% weight=1 blockGap=8
    export function readWorkingTime(): number {
        return 0;
    }

    /**
     * Check controller status.
     * @param controller status to check (shake, till up, till down, face up, etc...)
     */
    //% help=input/button/is-pressed
    //% blockId=cm300_isController block="#controller is %controller"
    //% weight=1 blockGap=8
    //% trackArgs=0
    export function isController(controller: CM300_Gesture): boolean {
        // return button->isPressed();
        return true;
    }

    /**
     * Check if a button of joystic is pressed or not.
     * @param joystick joystic button (up, down, left, right)
     */
    //% help=input/button/is-pressed
    //% blockId=cm300_isJoysticPressed block="#joystick %joystick| is pressed"
    //% weight=1 blockGap=8
    //% trackArgs=0
    export function isJoysticPressed(joystick: CM300_Joystick_Button): boolean {
        // return button->isPressed();
        return true;
    }

    /**
     * Read joystick position
     * @param joystick Position X, Position Y 
     */
    //% help=basic/clear-screen
    //% blockId=cm300_readJoystick block="#%joystick value"
    //% weight=1 blockGap=8
    export function readJoystick(joystick: CM300_Joystick_XY): number {
        return 0;
    }

    /**
     * Read sound count
     * @param sound Detecting, Detected
     */
    //% help=basic/clear-screen
    //% blockId=cm300_readSoundCount block="#%sound value"
    //% weight=1 blockGap=8
    export function readSoundCount(sound: CM300_SoundCount): number {
        return 0;
    }

    /**
     * Read sensor
     * @param sensor IR, Light
     */
    //% help=basic/clear-screen
    //% blockId=cm300_readSensorIrLight block="#%sensor value"
    //% weight=1 blockGap=8
    export function readSensorIrLight(sensor: CM300_Sensor_IR_Light): number {
        return 0;
    }
}