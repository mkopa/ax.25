import { utils } from "./utils";

export enum AX25Defs {
  FLAG = (1 << 1) | (1 << 2) | (1 << 3) | (1 << 4) | (1 << 5) | (1 << 6), // Unused, but included for non-KISS implementations.

  // Address field - SSID subfield bitmasks
  A_CRH = 1 << 7, // Command/Response or Has-Been-Repeated bit of an SSID octet
  A_RR = (1 << 5) | (1 << 6), // The "R" (reserved) bits of an SSID octet
  A_SSID = (1 << 1) | (1 << 2) | (1 << 3) | (1 << 4), // The SSID portion of an SSID octet

  // Control field bitmasks
  PF = 1 << 4, // Poll/Final
  NS = (1 << 1) | (1 << 2) | (1 << 3), // N(S) - send sequence number
  NR = (1 << 5) | (1 << 6) | (1 << 7), // N(R) - receive sequence number
  PF_MODULO128 = 1 << 8, // Poll/Final in modulo 128 mode I & S frames
  NS_MODULO128 = 127 << 1, // N(S) in modulo 128 I frames
  NR_MODULO128 = 127 << 9, // N(R) in modulo 128 I & S frames
  // 	Information frame
  I_FRAME = 0,
  I_FRAME_MASK = 1,
  // 	Supervisory frame and subtypes
  S_FRAME = 1,
  S_FRAME_RR = 1, // Receive Ready
  S_FRAME_RNR = 1 | (1 << 2), // Receive Not Ready
  S_FRAME_REJ = 1 | (1 << 3), // Reject
  S_FRAME_SREJ = 1 | (1 << 2) | (1 << 3), // Selective Reject
  S_FRAME_MASK = 1 | (1 << 2) | (1 << 3),
  // 	Unnumbered frame and subtypes
  U_FRAME = 3,
  U_FRAME_SABM = 3 | (1 << 2) | (1 << 3) | (1 << 5), // Set Asynchronous Balanced Mode
  U_FRAME_SABME = 3 | (1 << 3) | (1 << 5) | (1 << 6), // SABM for modulo 128 operation
  U_FRAME_DISC = 3 | (1 << 6), // Disconnect
  U_FRAME_DM = 3 | (1 << 2) | (1 << 3), // Disconnected Mode
  U_FRAME_UA = 3 | (1 << 5) | (1 << 6), // Acknowledge
  U_FRAME_FRMR = 3 | (1 << 2) | (1 << 7), // Frame Reject
  U_FRAME_UI = 3, // Information
  U_FRAME_XID = 3 | (1 << 2) | (1 << 3) | (1 << 5) | (1 << 7), // Exchange Identification
  U_FRAME_TEST = 3 | (1 << 5) | (1 << 6) | (1 << 7), // Test
  U_FRAME_MASK = 3 | (1 << 2) | (1 << 3) | (1 << 5) | (1 << 6) | (1 << 7),

  // Protocol ID field bitmasks (most are unlikely to be used, but are here for the sake of completeness.)
  PID_X25 = 1, // ISO 8208/CCITT X.25 PLP
  PID_CTCPIP = (1 << 1) | (1 << 2), // Compressed TCP/IP packet. Van Jacobson (RFC 1144)
  PID_UCTCPIP = (1 << 0) | (1 << 1) | (1 << 2), // Uncompressed TCP/IP packet. Van Jacobson (RFC 1144)
  PID_SEGF = 1 << 4, // Segmentation fragment
  PID_TEXNET = (1 << 0) | (1 << 1) | (1 << 6) | (1 << 7), // TEXNET datagram protocol
  PID_LQP = (1 << 2) | (1 << 6) | (1 << 7), // Link Quality Protocol
  PID_ATALK = (1 << 1) | (1 << 3) | (1 << 6) | (1 << 7), // Appletalk
  PID_ATALKARP = (1 << 0) | (1 << 1) | (1 << 3) | (1 << 6) | (1 << 7), // Appletalk ARP
  PID_ARPAIP = (1 << 2) | (1 << 3) | (1 << 6) | (1 << 7), // ARPA Internet Protocol
  PID_ARPAAR = (1 << 0) | (1 << 2) | (1 << 3) | (1 << 6) | (1 << 7), // ARPA Address Resolution
  PID_FLEXNET = (1 << 1) | (1 << 2) | (1 << 3) | (1 << 6) | (1 << 7), // FlexNet
  PID_NETROM = (1 << 0) | (1 << 1) | (1 << 2) | (1 << 3) | (1 << 6) | (1 << 7), // Net/ROM
  PID_NONE = (1 << 4) | (1 << 5) | (1 << 6) | (1 << 7), // No layer 3 protocol implemented
  PID_ESC = 255,
}

export type RepeaterPath = {
  callsign: string;
  ssid: number;
};

export type AX25Frame = {
  destinationCallsign: string;
  destinationSSID: number;
  sourceCallsign: string;
  sourceSSID: number;
  repeaterPath: RepeaterPath[];
  pollFinal: number;
  command: number;
  type: number;
  nr: number;
  ns: number;
  pid: number;
  info: number[];
  sent: boolean;
  modulo128: boolean;
};

export class AX25Packet {
  constructor(
    private properties: AX25Frame = {
      destinationCallsign: "",
      destinationSSID: 0,
      sourceCallsign: "",
      sourceSSID: 0,
      repeaterPath: [],
      pollFinal: 0,
      command: 0,
      type: 0,
      nr: 0,
      ns: 0,
      pid: AX25Defs.PID_NONE,
      info: [],
      sent: false,
      modulo128: false,
    }
  ) {}

  public getAX25Frame() {
    return this.properties;
  }

  public get destinationCallsign(): string {
    if (!utils.testCallsign(this.properties.destinationCallsign)) {
      throw "ax25.Packet: Invalid destination callsign.";
    }
    return this.properties.destinationCallsign;
  }

  public set destinationCallsign(callsign: string) {
    if (typeof callsign == "undefined" || !utils.testCallsign(callsign)) {
      throw "ax25.Packet: Invalid destination callsign.";
    }
    this.properties.destinationCallsign = callsign;
  }

  public get destinationSSID(): number {
    if (
      this.properties.destinationSSID < 0 ||
      this.properties.destinationSSID > 15
    ) {
      throw "ax25.Packet: Invalid destination SSID.";
    }
    return this.properties.destinationSSID;
  }

  public set destinationSSID(ssid: number) {
    if (typeof ssid != "number" || ssid < 0 || ssid > 15) {
      throw "ax25.Packet: Invalid destination SSID.";
    }
    this.properties.destinationSSID = ssid;
  }

  public get sourceCallsign(): string {
    if (!utils.testCallsign(this.properties.sourceCallsign)) {
      throw "ax25.Packet: Invalid source callsign.";
    }
    return this.properties.sourceCallsign;
  }

  public set sourceCallsign(callsign: string) {
    if (typeof callsign == "undefined" || !utils.testCallsign(callsign)) {
      throw "ax25.Packet: Invalid source callsign.";
    }
    this.properties.destinationCallsign = callsign;
  }

  public get sourceSSID(): number {
    if (this.properties.sourceSSID < 0 || this.properties.sourceSSID > 15) {
      throw "ax25.Packet: Invalid destination SSID.";
    }
    return this.properties.sourceSSID;
  }

  public set sourceSSID(ssid: number) {
    if (typeof ssid != "number" || ssid < 0 || ssid > 15) {
      throw "ax25.Packet: Invalid source SSID.";
    }
    this.properties.sourceSSID = ssid;
  }

  public get repeaterPath(): RepeaterPath[] {
    return this.properties.repeaterPath;
  }

  public set repeaterPath(repeaters: RepeaterPath[]) {
    const msg =
      "ax25.Packet: Repeater path must be array of valid {callsign, ssid} objects.";
    if (typeof repeaters == "undefined" || !(repeaters instanceof Array))
      throw msg;
    for (var r = 0; r < repeaters.length; r++) {
      if (
        !repeaters[r]!.hasOwnProperty("callsign") ||
        !utils.testCallsign(repeaters[r]!.callsign)
      ) {
        throw msg;
      }
      if (!repeaters[r] || repeaters[r]!.ssid < 0 || repeaters[r]!.ssid > 15) {
        throw msg;
      }
    }
    this.properties.repeaterPath = repeaters;
  }

  public get pollFinal(): boolean {
    return this.properties.pollFinal === 1;
  }

  public set pollFinal(pollFinal: boolean) {
    this.properties.pollFinal = pollFinal ? 1 : 0;
  }

  public get command(): boolean {
    return this.properties.command === 1;
  }

  public set command(cmd: boolean) {
    this.properties.command = cmd ? 1 : 0;
  }

  public get response(): boolean {
    return this.properties.command === 1;
  }

  public set response(resp: boolean) {
    this.properties.command = resp ? 1 : 0;
  }

  /*	Assemble and return a control octet based on the properties of this
		packet.  (Note that there is no corresponding setter - the control
		field is always generated based on packet type, poll/final, and the
		N(S) and N(R) values if applicable, and must always be fetched from
		this getter. */
  public get control(): number {
    let cntrl = this.properties.type;
    if (
      this.properties.type == AX25Defs.I_FRAME ||
      (this.properties.type & AX25Defs.U_FRAME) == AX25Defs.S_FRAME
    ) {
      cntrl |= this.properties.nr << (this.properties.modulo128 ? 9 : 5);
    }
    if (this.properties.type == AX25Defs.I_FRAME)
      cntrl |= this.properties.ns << 1;
    if (this.pollFinal)
      cntrl |= this.properties.pollFinal << (this.properties.modulo128 ? 8 : 4);
    return cntrl;
  }

  public get type(): number {
    return this.properties.type;
  }

  public set type(type: number) {
    this.properties.type = type;
  }

  public get nr(): number {
    return this.properties.nr;
  }

  public set nr(_nr: number) {
    if (
      typeof _nr != "number" ||
      _nr < 0 ||
      _nr > (this.properties.modulo128 ? 127 : 7)
    ) {
      throw "ax25.Packet: Invalid N(R) assignment.";
    }
    this.properties.nr = _nr;
  }

  public get ns(): number {
    return this.properties.ns;
  }

  public set ns(_ns: number) {
    if (
      typeof _ns != "number" ||
      _ns < 0 ||
      _ns > (this.properties.modulo128 ? 127 : 7)
    ) {
      throw "ax25.Packet: Invalid N(S) assignment.";
    }
    this.properties.ns = _ns;
  }

  public get pid(): undefined | number {
    return this.properties.pid == 0 ? undefined : this.properties.pid;
  }

  public set pid(_pid: undefined | number) {
    if (typeof _pid != "number")
      throw "ax25.Packet: Invalid PID field assignment.";
    if (
      this.properties.type == AX25Defs.I_FRAME ||
      this.properties.type == AX25Defs.U_FRAME_UI
    ) {
      this.properties.pid = _pid;
    } else {
      throw "ax25.Packet: PID can only be set on I and UI frames.";
    }
  }

  public get info(): number[] {
    return this.properties.info;
  }

  public set info(_info: number[]) {
    if (typeof _info == "undefined")
      throw "ax25.Packet: Invalid information field assignment.";
    if (
      this.properties.type == AX25Defs.I_FRAME ||
      this.properties.type == AX25Defs.U_FRAME
    )
      this.properties.info = _info;
    else
      throw "ax25.Defs.Packet: Info field can only be set on I and UI frames.";
  }

  public get infoString(): string {
    return utils.byteArrayToString(this.properties.info);
  }

  public set infoString(_infoString: string) {
    if (typeof _infoString != "string")
      throw "ax25.Packet.infoString: type mismatch.";
    this.properties.info = utils.stringToByteArray(_infoString);
  }

  public get sent(): boolean {
    return this.properties.sent;
  }

  public set sent(_sent: boolean) {
    this.properties.sent = _sent;
  }

  public get modulo128(): boolean {
    return this.properties.modulo128;
  }

  public set modulo128(_modulo128: boolean) {
    this.properties.modulo128 = _modulo128;
  }

  public decode(frame: number[]) {
    if (frame.length < 15)
      throw "ax25.Packet.disassemble: Frame does not meet minimum length.";

    // Address Field: Destination subfield
    const field = frame.splice(0, 6);
    for (let f = 0; f < field.length; f++)
      this.properties.destinationCallsign += String.fromCharCode(
        (field[f] as number) >> 1
      );
    const _field = frame.shift();
    this.properties.destinationSSID =
      ((_field as number) & AX25Defs.A_SSID) >> 1;
    this.properties.command = ((_field as number) & AX25Defs.A_CRH) >> 7;

    // Address Field: Source subfield
    const fieldCALL = frame.splice(0, 6);
    for (let f = 0; f < fieldCALL.length; f++)
      this.properties.sourceCallsign += String.fromCharCode(
        (fieldCALL[f] as number) >> 1
      );
    const fieldSSID = frame.shift();
    this.properties.sourceSSID = ((fieldSSID as number) & AX25Defs.A_SSID) >> 1;

    let repeaterField = fieldSSID as number;
    // Address Field: Repeater path
    while (!((repeaterField as number) & 1)) {
      const repeaterFieldArr = frame.splice(0, 6);
      let repeater = {
        callsign: "",
        ssid: 0,
      };
      for (var f = 0; f < field.length; f++)
        repeater.callsign += String.fromCharCode(
          (repeaterFieldArr[f] as number) >> 1
        );
      repeaterField = frame.shift() as number;
      repeater.ssid = (repeaterField & AX25Defs.A_SSID) >> 1;
      this.properties.repeaterPath.push(repeater);
    }

    // Control field
    let control = frame.shift() as number;
    if ((control & AX25Defs.U_FRAME) == AX25Defs.U_FRAME) {
      this.properties.pollFinal = (control & AX25Defs.PF) >> 4;
      this.properties.type = control & AX25Defs.U_FRAME_MASK;
      if (this.properties.type == AX25Defs.U_FRAME_UI) {
        this.properties.pid = frame.shift() as number;
        this.properties.info = frame;
      } else if (
        this.properties.type == AX25Defs.U_FRAME_XID &&
        frame.length > 0
      ) {
        // Parse XID parameter fields and break out to properties
      } else if (
        this.properties.type == AX25Defs.U_FRAME_TEST &&
        frame.length > 0
      ) {
        this.properties.info = frame;
      }
    } else if ((control & AX25Defs.U_FRAME) == AX25Defs.S_FRAME) {
      this.properties.type = control & AX25Defs.S_FRAME_MASK;
      if (this.properties.modulo128) {
        control |= (frame.shift() as number) << 8;
        this.properties.nr = (control & AX25Defs.NR_MODULO128) >> 8;
        this.properties.pollFinal = (control & AX25Defs.PF) >> 7;
      } else {
        this.properties.nr = (control & AX25Defs.NR) >> 5;
        this.properties.pollFinal = (control & AX25Defs.PF) >> 4;
      }
    } else if ((control & 1) == AX25Defs.I_FRAME) {
      this.properties.type = AX25Defs.I_FRAME;
      if (this.properties.modulo128) {
        control |= (frame.shift() as number) << 8;
        this.properties.nr = (control & AX25Defs.NR_MODULO128) >> 8;
        this.properties.ns = (control & AX25Defs.NS_MODULO128) >> 1;
        this.properties.pollFinal = (control & AX25Defs.PF) >> 7;
      } else {
        this.properties.nr = (control & AX25Defs.NR) >> 5;
        this.properties.ns = (control & AX25Defs.NS) >> 1;
        this.properties.pollFinal = (control & AX25Defs.PF) >> 4;
      }
      this.properties.pid = frame.shift() as number;
      this.properties.info = frame;
    } else {
      throw "ax25.Packet.dissassemble: Invalid packet.";
    }
  }

  public encode(): number[] {
    // Try to catch a few obvious derps
    if (this.properties.destinationCallsign.length == 0)
      throw "ax25.Packet: Destination callsign not set.";
    if (this.properties.sourceCallsign.length == 0)
      throw "ax25.Packet: Source callsign not set.";
    if (
      this.properties.type == AX25Defs.I_FRAME &&
      (typeof this.properties.pid == "undefined" ||
        this.properties.info.length < 1)
    ) {
      throw "ax25.Packet: I or UI frame with no payload.";
    }

    const frame: number[] = [];

    // Address field: Destination subfield
    for (let c = 0; c < 6; c++) {
      frame.push(
        (this.properties.destinationCallsign.length - 1 >= c
          ? (this.properties.destinationCallsign[c] as string).charCodeAt(0)
          : 32) << 1
      );
    }
    frame.push(
      (this.properties.command << 7) |
        (3 << 5) |
        (this.properties.destinationSSID << 1)
    );

    // Address field: Source subfield
    for (let c = 0; c < 6; c++) {
      frame.push(
        (this.properties.sourceCallsign.length - 1 >= c
          ? (this.properties.sourceCallsign[c] as string).charCodeAt(0)
          : 32) << 1
      );
    }
    frame.push(
      ((this.properties.command ^ 1) << 7) |
        ((this.properties.modulo128 ? 0 : 1) << 6) |
        (1 << 5) |
        (this.properties.sourceSSID << 1) |
        (this.properties.repeaterPath.length < 1 ? 1 : 0)
    );

    // Address Field: Repeater path
    for (let r = 0; r < this.properties.repeaterPath.length; r++) {
      for (let c = 0; c < 6; c++) {
        frame.push(
          ((this.properties.repeaterPath[r] as RepeaterPath).callsign.length -
            1 >=
          c
            ? (
                (this.properties.repeaterPath[r] as RepeaterPath).callsign[
                  c
                ] as string
              ).charCodeAt(0)
            : 32) << 1
        );
      }
      frame.push(
        ((this.properties.repeaterPath[r] as RepeaterPath).ssid << 1) |
          (r == this.properties.repeaterPath.length - 1 ? 1 : 0)
      );
    }

    // Control field
    if (!this.properties.modulo128) {
      frame.push(this.control);
    } else {
      frame.push(this.control & 255);
      frame.push(this.control >> 8);
    }

    // PID field (I and UI frames only)
    if (
      this.properties.pid &&
      (this.properties.type == AX25Defs.I_FRAME ||
        this.properties.type == AX25Defs.U_FRAME_UI)
    ) {
      frame.push(this.properties.pid);
    }

    // Info field
    if (
      this.properties.info.length > 0 &&
      (this.properties.type == AX25Defs.I_FRAME ||
        this.properties.type == AX25Defs.U_FRAME_UI ||
        this.properties.type == AX25Defs.U_FRAME_TEST)
    ) {
      for (let i = 0; i < this.properties.info.length; i++)
        frame.push(this.properties.info[i] as number);
    }

    return frame;
  }
}
