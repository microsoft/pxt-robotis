#pragma once
#include "dynamixel_protocol.h"
#include "dynamixel_port.h"

#define DEVICE_ID_DYNAMIXEL 40000
#define CFG_PIN_DXL_RX 40000
#define CFG_PIN_DXL_TX 40001
#define CFG_PIN_DXL_DIR 40002
#define CFG_PIN_DXL_PWR 40003

enum class DXLBaudRate {
  //% block=1M
  BaudRate1M = 1000000,
  //% block=115200
  BaudRate115200 = 115200,
  //% block=57600
  BaudRate57600 = 57600,
  //% block=9600
  BaudRate9600 = 9600
};

enum class DXLOperatingMode {
  //% block=Velocity
  OPModeVelocity = 1,
  //% block=Position
  OPModePosition = 3,
  //% block=Extended Position
  OPModeExPosition = 4,
  //% block=PWM
  OPModePWM = 16
};

namespace dynamixel {

typedef struct InfoFromPing{
  uint8_t id;
  uint16_t model_number;
  uint8_t firmware_version;
} InfoFromPing_t;

typedef struct InfoSyncBulkBuffer{
  uint8_t* p_buf;
  uint16_t buf_capacity;
  uint16_t gen_length;
  bool is_completed;
} __attribute__((packed)) InfoSyncBulkBuffer_t;

/* Sync Instructions */
typedef struct XELInfoSyncRead{
  uint8_t *p_recv_buf;
  uint8_t id;
  uint8_t error;
} __attribute__((packed)) XELInfoSyncRead_t;

typedef struct InfoSyncReadInst{
  uint16_t addr;
  uint16_t addr_length;
  XELInfoSyncRead_t* p_xels;
  uint8_t xel_count;
  bool is_info_changed;
  InfoSyncBulkBuffer_t packet;
} __attribute__((packed)) InfoSyncReadInst_t;

typedef struct XELInfoSyncWrite{
  uint8_t* p_data;
  uint8_t id;
} __attribute__((packed)) XELInfoSyncWrite_t;

typedef struct InfoSyncWriteInst{
  uint16_t addr;
  uint16_t addr_length;
  XELInfoSyncWrite_t* p_xels;
  uint8_t xel_count;
  bool is_info_changed;
  InfoSyncBulkBuffer_t packet;
} __attribute__((packed)) InfoSyncWriteInst_t;

/* Bulk Instructions */
typedef struct XELInfoBulkRead{
  uint16_t addr;
  uint16_t addr_length;
  uint8_t *p_recv_buf;
  uint8_t id;
  uint8_t error;
} __attribute__((packed)) XELInfoBulkRead_t;

typedef struct InfoBulkReadInst{
  XELInfoBulkRead_t* p_xels;
  uint8_t xel_count;
  bool is_info_changed;
  InfoSyncBulkBuffer_t packet;
} __attribute__((packed)) InfoBulkReadInst_t;

typedef struct XELInfoBulkWrite{
  uint16_t addr;
  uint16_t addr_length;
  uint8_t* p_data;
  uint8_t id;
} __attribute__((packed)) XELInfoBulkWrite_t;

typedef struct InfoBulkWriteInst{
  XELInfoBulkWrite_t* p_xels;
  uint8_t xel_count;
  bool is_info_changed;
  InfoSyncBulkBuffer_t packet;
} __attribute__((packed)) InfoBulkWriteInst_t;

class Master
{
  public:
    /**
     * @brief The constructor.
     * @code
     * const int DXL_DIR_PIN = 2;
     * const float PROTOCOL_VER = 2.0;
     * DYNAMIXEL::SerialPortHandler dxl_port(Serial1, DXL_DIR_PIN);
     * DYNAMIXEL::Master dxl_master(dxl_port, PROTOCOL_VER);
     * @endcode
     * @param port The DXLPortHandler instance you want to use on the board to communicate with DYNAMIXELs.
     *             It can be used not only for Serial but also for other communication port handlers like SerialPortHandler class.
     * @param protocol_ver DYNAMIXEL protocol version used for communications. (default : 2.0)
     */
    Master(DXLPortHandler &port, float protocol_ver = 2.0, uint16_t malloc_buf_size = 256);

    /**
     * @brief The constructor.
     *        This constructor must be added to the PortHanlder instance via the @setPort () function after creation.
     * @code
     * const float PROTOCOL_VER = 2.0;
     * DYNAMIXEL::Master dxl_master(PROTOCOL_VER);
     * @endcode
     * @param protocol_ver DYNAMIXEL protocol version used for communications. (default : 2.0)        
     */    
    Master(float protocol_ver = 2.0, uint16_t malloc_buf_size = 256);

    bool setPacketBuffer(uint8_t* p_buf, uint16_t buf_capacity);
    uint8_t* getPacketBuffer() const;
    uint16_t getPacketBufferCapacity() const;

    bool setPortProtocolVersion(float version);
    bool setPortProtocolVersionUsingIndex(uint8_t version_idx);
    float getPortProtocolVersion() const;

    bool setPort(DXLPortHandler &port);
    bool setPort(DXLPortHandler *p_port);
    DXLPortHandler* getPort() const;

    /* Instructions */
    uint8_t ping(uint8_t id, uint8_t *p_recv_id_array, uint8_t recv_array_capacity,
      uint32_t timeout_ms = 10);
    uint8_t ping(uint8_t id, InfoFromPing_t *recv_ping_info_array, uint8_t recv_array_cnt,
      uint32_t timeout_ms = 10);
    int32_t read(uint8_t id, uint16_t addr, uint16_t addr_length,
      uint8_t *p_recv_buf, uint16_t recv_buf_capacity, uint32_t timeout_ms = 10);
    bool write(uint8_t id, uint16_t addr, 
      const uint8_t *p_data, uint16_t data_length, uint32_t timeout_ms = 10);      
    bool writeNoResp(uint8_t id, uint16_t addr, 
      const uint8_t *p_data, uint16_t data_length);
    bool regWrite(uint8_t id, uint16_t addr, 
      const uint8_t *p_data, uint16_t data_length, uint32_t timeout_ms = 10);
    bool action(uint8_t id, uint32_t timeout_ms = 10);      
    bool factoryReset(uint8_t id, uint8_t option, uint32_t timeout_ms = 10);
    bool reboot(uint8_t id, uint32_t timeout_ms = 10);
    bool clear(uint8_t id, uint8_t option, uint32_t ex_option, uint32_t timeout_ms = 10);
    uint8_t syncRead(InfoSyncReadInst_t* p_info, uint32_t timeout_ms = 10);
    bool syncWrite(InfoSyncWriteInst_t* p_info);
    uint8_t bulkRead(InfoBulkReadInst_t* p_info, uint32_t timeout_ms = 10);
    bool bulkWrite(InfoBulkWriteInst_t* p_info);

    uint8_t getLastStatusPacketError() const;
    
    void setLastLibErrCode(DXLLibErrorCode_t err_code);
    DXLLibErrorCode_t getLastLibErrCode() const;

    // raw APIs
    bool txInstPacket(uint8_t id, uint8_t inst_idx, uint8_t *p_param, uint16_t param_len);
    const InfoToParseDXLPacket_t* rxStatusPacket(uint8_t* p_param_buf, uint16_t param_buf_cap, uint32_t timeout_ms = 10);


  private:
    DXLPortHandler *p_port_;

    uint8_t protocol_ver_idx_;

    bool is_buf_malloced_;
    uint8_t *p_packet_buf_;
    uint16_t packet_buf_capacity_;
    InfoToMakeDXLPacket_t info_tx_packet_;
    InfoToParseDXLPacket_t info_rx_packet_;

    DXLLibErrorCode_t last_lib_err_;
};


class DynamixelMaster:public dynamixel::Master {
  private:
    DevicePin *tx;
    DevicePin *rx;
    DevicePin *dir;
    CODAL_SERIAL ser;

  public:
    SerialPortHandler port;

    DynamixelMaster(DevicePin *_tx, DevicePin *_rx, DevicePin *_dir, int id)
        : Master(), tx(_tx), rx(_rx), dir(_dir), ser(*tx, *rx), port(ser, *dir){
        if (id <= 0)
            id = allocateNotifyEvent();
        ser.id = id;
        this->setPort(&port);
    }
    
    void setPortBaudRate(DXLBaudRate rate) { port.begin((unsigned long)rate); }
};

typedef DynamixelMaster* DynamixelDevice;

} // namespace dynamixel
