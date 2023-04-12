class Utils {
  constructor() {}

  testCallsign(callsign: string) {
    if (typeof callsign == "undefined" || callsign.length > 6) return false;
    callsign = callsign.toUpperCase().replace(/\s*$/g, "");
    for (let c = 0; c < callsign.length; c++) {
      const a = callsign[c]!.charCodeAt(0);
      if ((a >= 48 && a <= 57) || (a >= 65 && a <= 90)) {
        continue;
      }
      return false;
    }
    return true;
  }

  /*	distanceBetween(leader, follower, modulus)
		Find the difference between 'leader' and 'follower' modulo 'modulus'. */
  distanceBetween(l: number, f: number, m: number) {
    return l < f ? l + (m - f) : l - f;
  }

  // Turns a string into an array of character codes
  stringToByteArray(s: string) {
    const sArray = s.split("");
    var r: number[] = [];
    for (var i = 0; i < sArray.length; i++) r.push(sArray[i]!.charCodeAt(0));
    return r;
  }

  // Turns an array of ASCII character codes into a string
  byteArrayToString(s: number[]) {
    let r = "";
    for (let i = 0; i < s.length; i++) r += String.fromCharCode(s[i] as number);
    return r;
  }
}

export const utils = new Utils();
