import { AX25Defs, AX25Frame, AX25Packet } from "../lib/ax.25";

const encoding = new TextEncoder();

const ax25Frame: AX25Frame = {
  destinationCallsign: "APRX29",
  destinationSSID: 0,
  sourceCallsign: "SP4MK ",
  sourceSSID: 15,
  repeaterPath: [
    {
      callsign: "SR4DIG",
      ssid: 0,
    },
  ],
  pollFinal: 0,
  command: 0,
  type: 0,
  nr: 0,
  ns: 0,
  pid: AX25Defs.PID_NONE,
  info: Array.from(encoding.encode("Siema!")),
  sent: false,
  modulo128: false,
};

console.log(ax25Frame);

const ax25PacketToEncode = new AX25Packet(ax25Frame);

const encodedArr = ax25PacketToEncode.encode();

console.log(encodedArr);

const ax25PacketToDecode = new AX25Packet();
ax25PacketToDecode.decode(encodedArr);

const decodedFrame = ax25PacketToDecode.getAX25Frame();

console.log(decodedFrame);

const packetsEquals =
  JSON.stringify(ax25Frame) === JSON.stringify(decodedFrame);

if (!packetsEquals) {
  throw new Error("Packets not equals!");
}

console.log("Packets is equals!");
