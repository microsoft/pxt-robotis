#ifndef DYNAMIXEL_PROTOCOL_H_
#define DYNAMIXEL_PROTOCOL_H_

#include <stdint.h>
#include <stdbool.h>
#include <string.h>

#define DXL_BROADCAST_ID        0xFE


#ifdef __cplusplus
extern "C" {
#endif

// http://emanual.robotis.com/docs/en/dxl/protocol1/#instruction
// http://emanual.robotis.com/docs/en/dxl/protocol2/#instruction
enum DXLInstruction{
  DXL_INST_PING = 0x01,
  DXL_INST_READ = 0x02,
  DXL_INST_WRITE = 0x03,
  DXL_INST_REG_WRITE = 0x04,
  DXL_INST_ACTION = 0x05,
  DXL_INST_FACTORY_RESET = 0x06,
  DXL_INST_REBOOT = 0x08,
  DXL_INST_CLEAR = 0x10, //ONLY Protocol2.0
  DXL_INST_STATUS = 0x55, //ONLY Protocol2.0
  DXL_INST_SYNC_READ = 0x82, //ONLY Protocol2.0
  DXL_INST_SYNC_WRITE = 0x83,
  DXL_INST_BULK_READ = 0x92,
  DXL_INST_BULK_WRITE = 0x93 //ONLY Protocol2.0
};

enum DXL1_0PacketError{
  DXL1_0_ERR_INPUT_VOLTAGE_BIT = 0,
  DXL1_0_ERR_ANGLE_LIMIT_BIT,
  DXL1_0_ERR_OVERHEATING_BIT,
  DXL1_0_ERR_RANGE_BIT,
  DXL1_0_ERR_CHECKSUM_BIT,
  DXL1_0_ERR_OVERLOAD_BIT,
  DXL1_0_ERR_INSTRUCTION_BIT
};

enum DXL2_0PacketError{
  DXL2_0_ERR_NONE = 0x00,
  DXL2_0_ERR_RESULT_FAIL,
  DXL2_0_ERR_INST_ERROR,
  DXL2_0_ERR_CRC_ERROR,
  DXL2_0_ERR_DATA_RANGE,
  DXL2_0_ERR_DATA_LENGTH,
  DXL2_0_ERR_DATA_LIMIT,
  DXL2_0_ERR_ACCESS
};

enum DXL1_0PacketState{
  DXL1_0_PACKET_PARSING_STATE_IDLE = 0,
  DXL1_0_PACKET_PARSING_STATE_ID,
  DXL1_0_PACKET_PARSING_STATE_LENGTH,
  DXL1_0_PACKET_PARSING_STATE_INST_ERR,
  DXL1_0_PACKET_PARSING_STATE_PARAM,
  DXL1_0_PACKET_PARSING_STATE_CHECK_SUM
};

enum DXL2_0PacketState{
   DXL2_0_PACKET_PARSING_STATE_IDLE = 0,
   DXL2_0_PACKET_PARSING_STATE_RESERVED,
   DXL2_0_PACKET_PARSING_STATE_ID,
   DXL2_0_PACKET_PARSING_STATE_LENGTH_L,
   DXL2_0_PACKET_PARSING_STATE_LENGTH_H,
   DXL2_0_PACKET_PARSING_STATE_INST,
   DXL2_0_PACKET_PARSING_STATE_ERROR,
   DXL2_0_PACKET_PARSING_STATE_PARAM,
   DXL2_0_PACKET_PARSING_STATE_CRC_L,
   DXL2_0_PACKET_PARSING_STATE_CRC_H
};

enum DXLLibErrorCode
{
  DXL_LIB_OK = 0,
  DXL_LIB_PROCEEDING,

  DXL_LIB_ERROR_NOT_SUPPORTED,
  DXL_LIB_ERROR_TIMEOUT,
  DXL_LIB_ERROR_INVAILD_ID,
  DXL_LIB_ERROR_NOT_SUPPORT_BROADCAST,
  DXL_LIB_ERROR_NULLPTR,
  DXL_LIB_ERROR_LENGTH,
  DXL_LIB_ERROR_INVAILD_ADDR,
  DXL_LIB_ERROR_ADDR_LENGTH,
  DXL_LIB_ERROR_BUFFER_OVERFLOW,
  DXL_LIB_ERROR_PORT_NOT_OPEN,
  DXL_LIB_ERROR_WRONG_PACKET,
  DXL_LIB_ERROR_CHECK_SUM,
  DXL_LIB_ERROR_CRC,
  DXL_LIB_ERROR_INVAILD_DATA_LENGTH,
  DXL_LIB_ERROR_MEMORY_ALLOCATION_FAIL,
  DXL_LIB_ERROR_INVAILD_PROTOCOL_VERSION,
  DXL_LIB_ERROR_NOT_INITIALIZED,
  DXL_LIB_ERROR_NOT_ENOUGH_BUFFER_SIZE
};

typedef struct InfoToParseDXLPacket{
  uint8_t header[3];
  uint8_t header_cnt;
  uint8_t id;
  uint8_t protocol_ver;
  uint8_t inst_idx;
  uint8_t err_idx;
  uint8_t *p_param_buf;
  uint16_t param_buf_capacity;
  uint16_t recv_param_len;
  uint16_t packet_len;
  uint16_t calculated_crc;
  uint16_t recv_crc;
  uint8_t calculated_check_sum;
  uint8_t recv_check_sum;
  uint8_t reserved;
  uint8_t parse_state;
  bool is_init;
}InfoToParseDXLPacket_t;

typedef struct InfoToMakeDXLPacket{
  uint8_t id;
  uint8_t protocol_ver;
  uint8_t inst_idx;
  uint8_t err_idx;
  uint8_t *p_packet_buf;
  uint16_t packet_buf_capacity;
  uint16_t param_length;
  uint16_t generated_packet_length;
  bool is_init;
}InfoToMakeDXLPacket_t;


typedef int32_t DXLLibErrorCode_t;

DXLLibErrorCode_t begin_make_dxl_packet(InfoToMakeDXLPacket_t* p_make_packet, 
  uint8_t id, uint8_t protocol_ver, uint8_t inst_idx, uint8_t err_idx, 
  uint8_t* p_packet_buf, uint16_t packet_buf_capacity);
DXLLibErrorCode_t add_param_to_dxl_packet(InfoToMakeDXLPacket_t* p_make_packet,
  uint8_t *p_param, uint16_t param_len);
DXLLibErrorCode_t end_make_dxl_packet(InfoToMakeDXLPacket_t* p_make_packet);


DXLLibErrorCode_t begin_parse_dxl_packet(InfoToParseDXLPacket_t* p_parse_packet, 
  uint8_t protocol_ver, uint8_t* p_param_buf, uint16_t param_buf_cap);
DXLLibErrorCode_t parse_dxl_packet(InfoToParseDXLPacket_t* p_parse_packet, uint8_t recv_data);


#ifdef __cplusplus
}
#endif

#endif /* DYNAMIXEL_PROTOCOL_H_ */
