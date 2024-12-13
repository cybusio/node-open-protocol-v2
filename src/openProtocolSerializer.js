//@ts-check
/*
  Copyright: (c) 2023, Alejandro de la Mata Chico
  Copyright: (c) 2018-2020, Smart-Tech Controle e Automação
  GNU General Public License v3.0+ (see LICENSE or https://www.gnu.org/licenses/gpl-3.0.txt)
*/

const util = require("util");
const { Transform } = require("stream");

const constants = require("./constants.json");
const encodingOP = constants.defaultEncoder;

const helpers = require("./helpers.js");
const pad = helpers.padLeft;

var debug = util.debuglog("open-protocol");

/**
 * @class
 * @name Header
 * @param {object} Header
 * @param {number} Header.mid The MID describes how to interpret the message.
 * @param {number} Header.revision The MID Revision is unique per MID and is used in case different versions are available for the same MID.
 * @param {boolean} Header.noAck The No Ack Flag is used when setting a subscription.
 * @param {number} Header.stationID The station the message is addressed to in the case of controller with multi-station configuration.
 * @param {number} Header.spindleID The spindle the message is addressed to in the case several spindles are connected to the same controller.
 * @param {number} Header.sequenceNumber For acknowledging on “Link Level” with MIDs 0997 and 0998.
 * @param {number} Header.messageParts Linking function can be up to 9 = possible to send 9*9999 bytes messages. ~ 90 kB.
 * @param {number} Header.messageNumber Linking function, can be 1- 9 at message length > 9999.
 * @param {buffer | string} Header.payload the user's data
 */
class OpenProtocolSerializer extends Transform {
  /**
   * @class OpenProtocolSerializer
   * @description This class performs the serialization of the MID header.
   * This transforms MID (object) in MID (Buffer).
   * @param {Object} opts an object with the option passed to the constructor
   */
  constructor(opts) {
    opts = opts || {};
    opts.writableObjectMode = true;
    super(opts);

    this.vendor = opts.vendor || "AtlasCopco"; // Default vendor
    debug("OpenProtocolSerializer initialized for vendor:", this.vendor);
  }

  _transform(chunk, encoding, cb) {
    debug("openProtocolSerializer _transform", chunk);

    chunk.mid = Number(chunk.mid);

    if (isNaN(chunk.mid) || chunk.mid < 1 || chunk.mid > 9999) {
      cb(new Error(`Invalid MID [${chunk.mid}]`));
      debug("openProtocolSerializer _transform err-mid:", chunk);
      return;
    }

    if (
      chunk.revision === "   " ||
      chunk.revision === 0 ||
      chunk.revision === undefined
    ) {
      chunk.revision = 1;
    }

    chunk.revision = Number(chunk.revision);

    if (isNaN(chunk.revision) || chunk.revision < 0 || chunk.revision > 999) {
      cb(new Error(`Invalid revision [${chunk.revision}]`));
      debug("openProtocolSerializer _transform err-revision:", chunk);
      return;
    }

    // Call appropriate vendor-specific serialization logic
    try {
      if (this.vendor === "Bosch" || this.vendor === "Desoutter") {
        debug(
          `Vendor: ${this.vendor}, applying Desoutter/Bosch-specific serialization`
        );
        this.push(this._serializeForDesoutterOrBosch(chunk));
      } else {
        debug(`Vendor: ${this.vendor}, applying full serialization logic`);
        this.push(this._serializeForAtlasCopco(chunk));
      }
    } catch (err) {
      cb(err);
      debug("openProtocolSerializer _transform error:", err);
      return;
    }

    cb();
  }

  _serializeForAtlasCopco(chunk) {
    let sizePayload = chunk.payload.length;
    let sizeMessage = 21 + sizePayload;
    let buf = Buffer.alloc(sizeMessage);

    buf.write(pad(sizeMessage - 1, 4), 0, 4, encodingOP);
    buf.write(pad(chunk.mid, 4), 4, 4, encodingOP);
    buf.write(pad(chunk.revision, 3), 8, encodingOP);
    buf.write(chunk.noAck ? "1" : "0", 11, encodingOP);
    buf.write(pad(chunk.stationID, 2), 12, encodingOP);
    buf.write(pad(chunk.spindleID, 2), 14, encodingOP);
    buf.write(pad(chunk.sequenceNumber, 2), 16, encodingOP);
    buf.write(pad(chunk.messageParts, 1), 18, encodingOP);
    buf.write(pad(chunk.messageNumber, 1), 19, encodingOP);
    buf.write(chunk.payload.toString(encodingOP), 20, encodingOP);
    buf.write("\u0000", sizeMessage - 1, encodingOP);

    debug("AtlasCopco serialization result:", buf);
    return buf;
  }

  _serializeForDesoutterOrBosch(chunk) {
    let sizePayload = chunk.payload.length;
    let sizeMessage = 20 + sizePayload; // Desoutter/Bosch uses a different message size
    let buf = Buffer.alloc(sizeMessage);

    buf.write(pad(sizeMessage - 1, 4), 0, 4, encodingOP);
    buf.write(pad(chunk.mid, 4), 4, 4, encodingOP);
    buf.write("            ", 8, encodingOP); // Simplified header for Bosch/Desoutter
    buf.write(chunk.payload.toString(encodingOP), 20, encodingOP); // Start at offset 20
    buf.write("\u0000", sizeMessage - 1, encodingOP);

    debug("Desoutter/Bosch serialization result:", buf);
    return buf;
  }
}

module.exports = OpenProtocolSerializer;
