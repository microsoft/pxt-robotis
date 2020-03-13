#include "pxt.h"
#include "dynamixel_master.h"

namespace dynamixel {

    static DynamixelDevice dxlDevice = NULL;

    /**
     * Opens a DYNAMIXEL communication driver
     */
    //%
    DynamixelDevice internalCreateDXLDevice(DigitalInOutPin tx, DigitalInOutPin rx, DigitalInOutPin dir, int id)
    {
        if(dxlDevice == NULL){
            dxlDevice = new DynamixelMaster(tx, rx, dir, id);
        }
        return dxlDevice;
    }
} // namespace dynamixel


namespace DynamixelDeviceMethods {

/**
 */
//%
void setPortBaudRate(DynamixelDevice device, DXLBaudRate rate) 
{
    device->setPortBaudRate(rate);
}

/**
 */
//%
bool ping(DynamixelDevice device, uint8_t id) 
{
    uint8_t recv_id;
    return device->ping(id, &recv_id, 1)==1?true:false;
}

/**
 */
//%
Buffer read(DynamixelDevice device, uint8_t id, uint16_t addr, uint16_t len)
{
    auto buf = mkBuffer(NULL, len);
    if(buf)
        device->read(id, addr, len, buf->data, buf->length);
    return buf;
}

// /**
//  */
// //%
// void write(DynamixelDevice device, uint8_t id, uint16_t addr, uint16_t len, Buffer buffer)
// {
//     if(buffer == NULL || buffer->length < len)
//         return;
//     device->write(id, addr, buffer->data, len);
// }

/**
 */
//%
void write(DynamixelDevice device, uint8_t id, uint16_t addr, Buffer buffer)
{
    if(buffer == NULL || buffer->length <= 0)
        return;
    device->write(id, addr, buffer->data, buffer->length);
}

} // namespace DynamixelDeviceMethods