#ifndef __PXT_H
#define __PXT_H

#include "pxtbase.h"

#include "CodalConfig.h"
#include "CodalHeapAllocator.h"
#include "CodalDevice.h"
#include "CodalDmesg.h"
#include "ErrorNo.h"
#include "Timer.h"
#include "Matrix4.h"
#include "CodalCompat.h"
#include "CodalComponent.h"
#include "ManagedType.h"
#include "Event.h"
#include "NotifyEvents.h"
#include "Button.h"
#include "CodalFiber.h"
#include "MessageBus.h"

using namespace codal;

// codal::ManagedString compat
#define MSTR(s) codal::ManagedString((s)->data, (s)->length)
#define PSTR(s) mkString((s).toCharArray(), (s).length())

#include "pins.h"

#if CONFIG_ENABLED(DEVICE_USB)
#include "hf2.h"
#include "hf2dbg.h"
#if CONFIG_ENABLED(DEVICE_MOUSE)
#include "HIDMouse.h"
#endif
#if CONFIG_ENABLED(DEVICE_KEYBOARD)
#include "HIDKeyboard.h"
#endif
#if CONFIG_ENABLED(DEVICE_JOYSTICK)
#include "HIDJoystick.h"
#endif
#if CONFIG_ENABLED(DEVICE_JACDAC_DEBUG)
#include "USBJACDAC.h"
#endif
#endif

namespace pxt {

#if CONFIG_ENABLED(DEVICE_USB)
extern CodalUSB usb;
extern HF2 hf2;
#if CONFIG_ENABLED(DEVICE_MOUSE)
extern USBHIDMouse mouse;
#endif
#if CONFIG_ENABLED(DEVICE_KEYBOARD)
extern USBHIDKeyboard keyboard;
#endif
#if CONFIG_ENABLED(DEVICE_JOYSTICK)
extern USBHIDJoystick joystick;
#endif
#if CONFIG_ENABLED(DEVICE_JACDAC_DEBUG)
extern USBJACDAC *jacdacDebug;
#endif
#endif

// Utility functions
extern Event lastEvent;
extern CODAL_TIMER devTimer;
extern MessageBus devMessageBus;
extern codal::CodalDevice device;

void set_usb_strings(const char *uf2_info);

} // namespace pxt

namespace pins {
class CodalSPIProxy;
class CodalI2CProxy;
} // namespace pins

typedef pins::CodalI2CProxy* I2C_;
typedef pins::CodalSPIProxy* SPI_;

namespace pxt {
codal::LowLevelTimer *allocateTimer();

#ifdef CODAL_I2C
CODAL_I2C* getI2C(DigitalInOutPin sda, DigitalInOutPin scl);
#endif
CODAL_SPI* getSPI(DigitalInOutPin mosi, DigitalInOutPin miso, DigitalInOutPin sck);
#ifdef CODAL_JACDAC_WIRE_SERIAL
LowLevelTimer* getJACDACTimer();
#endif
class PressureButton;
uint32_t readButtonMultiplexer(int bits);
}

namespace serial {
class CodalSerialDeviceProxy;
}

typedef serial::CodalSerialDeviceProxy* SerialDevice;

namespace jacdac {
class JDProxyDriver;
} // namespace network

typedef jacdac::JDProxyDriver* JacDacDriverStatus;

namespace dynamixel {
class DynamixelMaster;    
} // namespace dynamixel

typedef dynamixel::DynamixelMaster* DynamixelDevice;

#define DEVICE_ID_BUTTON_SLIDE 3000
#define DEVICE_ID_MICROPHONE 3001
#define DEVICE_ID_FIRST_BUTTON 4000
#define DEVICE_ID_FIRST_TOUCHBUTTON 4100

#endif
