// Auto-generated. Do not edit.
declare namespace input {

    /**
     * Run some code when the temperature changes from hot to cold, or from cold to hot.
     * @param condition the condition, hot or cold, the event triggers on
     * @param temperature the temperature at which this event happens, eg: 15
     * @param unit the unit of the temperature
     */
    //% blockId=input_on_irsensor_condition_changed block="on irsensor %id |at %temperature|%unit"
    //% parts="thermometer"
    //% help=input/on-temperature-condition-changed blockExternalInputs=0
    //% group="More" weight=76 shim=input::onirsensorConditionChanged
    function onirsensorConditionChanged(id: int32, temperature: int32, unit: TemperatureUnit, handler: () => void): void;

    /**
     * Get the temperature in Celsius or Fahrenheit degrees.
     */
    //% help=input/temperature
    //% blockId=device_irsensor block="irsensor in %id"
    //% id.min=0 id.max=4
    //% parts="irsensor"
    //% weight=26 id.defl=0 shim=input::irsensor
    function irsensor(id?: int32): int32;
}

// Auto-generated. Do not edit. Really.
