declare namespace pins {
    //% fixedInstance shim=pxt::getPin(PIN_LED1)
    const LED1: DigitalInOutPin;
    //% fixedInstance shim=pxt::getPin(PIN_BATTSENSE)
    const VOLTAGE: AnalogInPin;
    // //% fixedInstance shim=pxt::getPin(PIN_LED3)
    // const LED3: DigitalInOutPin;
    // //% fixedInstance shim=pxt::getPin(PIN_LED4)
    // const LED4: DigitalInOutPin;

    //% fixedInstance shim=pxt::getPin(PIN_RX)
    const RX: DigitalInOutPin;
    //% fixedInstance shim=pxt::getPin(PIN_TX)
    const TX: DigitalInOutPin;    
}

declare namespace input {
    //% block="button A" fixedInstance
    //% shim=pxt::getButton(0) 
    //% parts="buttons"
    const buttonA: Button;

    //% block="button B" fixedInstance
    //% shim=pxt::getButton(1) 
    //% parts="buttons"
    const buttonB: Button;

    //% block="button AB" fixedInstance
    //% shim=pxt::getButton(2) 
    //% parts="buttons"
    const buttonAB: Button;

    //getButtonByPinCfg(CFG_PIN_BTN_A,BUTTON_ACTIVE_LOW_PULL_UP)  //getButton(0)  //getButtonByPin(PIN_BTN_A,BUTTON_ACTIVE_LOW_PULL_UP)
    //getButtonByPinCfg(CFG_PIN_BTN_B,BUTTON_ACTIVE_LOW_PULL_UP)  //getButton(1)  //getButtonByPin(PIN_BTN_B,BUTTON_ACTIVE_LOW_PULL_UP)

    // //% block="button Left" fixedInstance
    // //% shim=pxt::getButtonByPin(PIN_BTN_LEFT,BUTTON_ACTIVE_LOW_PULL_UP)
    // //% parts="buttons"
    // const buttonL: Button;

    // //% block="button Right" fixedInstance
    // //% shim=pxt::getButtonByPin(PIN_BTN_RIGHT,BUTTON_ACTIVE_LOW_PULL_UP)
    // //% parts="buttons"
    // const buttonR: Button;
}
