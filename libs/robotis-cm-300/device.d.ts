declare namespace pins {
    //% fixedInstance shim=pxt::getPin(PIN_LED)
    const LED: PwmPin;
    //% fixedInstance shim=pxt::getPin(PIN_BATTSENSE)
    const VOLTAGE: AnalogInPin;

    //% fixedInstance shim=pxt::getPin(PIN_RX)
    const RX: DigitalInOutPin;
    //% fixedInstance shim=pxt::getPin(PIN_TX)
    const TX: DigitalInOutPin;

    //% fixedInstance shim=pxt::getPin(PIN_DXL_PWR)
    const DXL_PWR: DigitalInOutPin;        
}

declare namespace input {
    //% block="button START" fixedInstance
    //% shim=pxt::getButton(0) 
    //% parts="buttons"
    const buttonA: Button;

    //% block="button MODE" fixedInstance
    //% shim=pxt::getButton(1) 
    //% parts="buttons"
    const buttonB: Button;

    //% block="button ALL" fixedInstance
    //% shim=pxt::getButton(2) 
    //% parts="buttons"
    const buttonAB: Button;
}
