#include "pxt.h"
#include "dynamixel_master.h"

namespace network {

    static DYNAMIXELDevice dxlDevice = NULL;

    /**
     * Opens a DYNAMIXEL communication driver
     */
    //%
    DYNAMIXELDevice InternalCreateDXLDevice(DigitalInOutPin tx, DigitalInOutPin rx, DigitalInOutPin dir, int id)
    {
        if(dxlDevice == NULL){
            dxlDevice = new DYNAMIXELMaster(tx, rx, dir, id);
        }
        return dxlDevice;
    }
} // namespace network


namespace DYNAMIXELDeviceMethods {

/**
 */
//%
void setPortBaudRate(DYNAMIXELDevice device, DXLBaudRate rate) 
{
    device->setPortBaudRate(rate);
}

/**
 */
//%
bool ping(DYNAMIXELDevice device, uint8_t id) 
{
    uint8_t recv_id;
    return device->ping(id, &recv_id, 1)==1?true:false;
}

/**
 */
//%
Buffer read(DYNAMIXELDevice device, uint8_t id, uint16_t addr, uint16_t len)
{
    auto buf = mkBuffer(NULL, len);
    if(buf)
        device->read(id, addr, len, buf->data, buf->length);
    return buf;
}

// /**
//  */
// //%
// void write(DYNAMIXELDevice device, uint8_t id, uint16_t addr, uint16_t len, Buffer buffer)
// {
//     if(buffer == NULL || buffer->length < len)
//         return;
//     device->write(id, addr, buffer->data, len);
// }

/**
 */
//%
void write(DYNAMIXELDevice device, uint8_t id, uint16_t addr, Buffer buffer)
{
    if(buffer == NULL || buffer->length <= 0)
        return;
    device->write(id, addr, buffer->data, buffer->length);
}

} // namespace DYNAMIXELDeviceMethods