#include "pxt.h"
#include "target_temperature.h"

enum class TemperatureCondition {
    //% block="hot"
    Hot = SENSOR_THRESHOLD_HIGH,
    //% block="cold"
    Cold = SENSOR_THRESHOLD_LOW
};

enum class TemperatureUnit {
    //% block="°C"
    Celsius,
    //% block="°F"
    Fahrenheit
};

namespace pxt {
SINGLETON_IF_PIN(WTemp, TEMPERATURE);
}

namespace input {

/**
* Run some code when the temperature changes from hot to cold, or from cold to hot.
* @param condition the condition, hot or cold, the event triggers on
* @param temperature the temperature at which this event happens, eg: 15
* @param unit the unit of the temperature
*/
//% blockId=input_on_irSensor_condition_changed block="on irSensor %id |at %temperature|%unit"
//% parts="thermometer"
//% help=input/on-temperature-condition-changed blockExternalInputs=0
//% group="More" weight=76
void onIrSensorConditionChanged(int id, int temperature, TemperatureUnit unit, Action handler) {
    auto thermo = getWTemp();
    if (!thermo) return;

    auto sensor = &thermo->sensor;
    sensor->updateSample();

    int t = unit == TemperatureUnit::Celsius ? temperature : ((temperature - 32) * 10) / 18;

    registerWithDal(sensor->id, id, handler);
}

/**
 * Get the temperature in Celsius or Fahrenheit degrees.
 */
//% help=input/temperature
//% blockId=device_irSensor block="irSensor in %id"
//% id.defl=0 id.min=0 id.max=4
//% parts="irSensor"
//% weight=26
int irSensor(int id) {
    auto thermo = getWTemp();
    // default to 21 if not present
    int value = (NULL != thermo) ? thermo->sensor.getValue() : 21;
    return value;    
}
}
