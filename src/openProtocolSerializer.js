//@ts-check
/*
  Dynamic Serializer with Vendor-Specific Logic
  Supports: AtlasCopco, Bosch, Desoutter
  Copyright: (c) 2024 Diwaker Jha
  Copyright: (c) 2023 Alejandro de la Mata Chico
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
 * @param {number} Header.stationID The station the message is addressed to in the case of a controller with multi-station configuration.
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
   * This transforms MID (object) into MID (Buffer) with vendor-specific logic.
   * @param {Object} opts Options passed to the constructor, including vendor
   * @param {string} opts.vendor The vendor name (e.g., "AtlasCopco", "Bosch", "Desoutter")
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

    try {
      // Validate and normalize MID
      chunk.mid = Number(chunk.mid);
      if (isNaN(chunk.mid) || chunk.mid < 1 || chunk.mid > 9999) {
        throw new Error(`Invalid MID [${chunk.mid}]`);
      }

      // Set default revision if not provided
      if (!chunk.revision || chunk.revision === "   ") {
        chunk.revision = 1;
      }
      chunk.revision = Number(chunk.revision);
      if (isNaN(chunk.revision) || chunk.revision < 0 || chunk.revision > 999) {
        throw new Error(`Invalid revision [${chunk.revision}]`);
      }

      // Apply vendor-specific serialization
      if (
        this.vendor.toLowerCase() === "desoutter" ||
        this.vendor.toLowerCase() === "bosch"
      ) {
        debug(
          `Vendor: ${this.vendor}, applying Desoutter/Bosch-specific serialization`
        );
        this.push(this._serializeForDesoutterOrBosch(chunk));
      } else if (this.vendor.toLowerCase() === "atlascopco") {
        debug(
          `Vendor: ${this.vendor}, applying AtlasCopco-specific serialization`
        );
        this.push(this._serializeForAtlasCopco(chunk));
      } else {
        throw new Error(`Unsupported vendor: ${this.vendor}`);
      }
    } catch (error) {
      debug("openProtocolSerializer _transform error:", error);
      cb(error);
    }

    cb();
  }

  _serializeForDesoutterOrBosch(chunk) {
    debug(`Serializing for Desoutter/Bosch:`, chunk);

    let sizePayload = chunk.payload ? chunk.payload.length : 0;
    let sizeMessage = 16 + sizePayload;
    let buf = Buffer.alloc(sizeMessage);

    buf.write(pad(sizeMessage - 1, 4), 0, 4, encodingOP); // Message length
    buf.write(pad(chunk.mid, 4), 4, 4, encodingOP); // MID
    buf.write("            ", 8, encodingOP); // Simplified header for Desoutter/Bosch
    if (chunk.payload) {
      buf.write(chunk.payload.toString(encodingOP), 16, encodingOP); // Payload
    }
    buf.write("\u0000", sizeMessage - 1, encodingOP); // Null terminator

    debug("Desoutter/Bosch serialization result:", buf);
    return buf;
  }

  _serializeForAtlasCopco(chunk) {
    debug("Serializing for AtlasCopco:", chunk);

    // Normalize fields
    chunk.stationID = this._normalizeField(
      chunk.stationID,
      1,
      0,
      99,
      "stationID"
    );
    chunk.spindleID = this._normalizeField(
      chunk.spindleID,
      1,
      0,
      99,
      "spindleID"
    );
    chunk.sequenceNumber = this._normalizeField(
      chunk.sequenceNumber,
      0,
      0,
      99,
      "sequenceNumber"
    );
    chunk.messageParts = this._normalizeField(
      chunk.messageParts,
      0,
      0,
      9,
      "messageParts"
    );
    chunk.messageNumber = this._normalizeField(
      chunk.messageNumber,
      0,
      0,
      9,
      "messageNumber"
    );

    if (chunk.payload === undefined) {
      chunk.payload = "";
    }

    let sizePayload = chunk.payload.length;
    let sizeMessage = 21 + sizePayload;
    let buf = Buffer.alloc(sizeMessage);

    buf.write(pad(sizeMessage - 1, 4), 0, 4, encodingOP); // Message length
    buf.write(pad(chunk.mid, 4), 4, 4, encodingOP); // MID
    buf.write(pad(chunk.revision, 3), 8, encodingOP); // Revision
    buf.write(chunk.noAck ? "1" : "0", 11, encodingOP); // No Ack
    buf.write(pad(chunk.stationID, 2), 12, encodingOP); // Station ID
    buf.write(pad(chunk.spindleID, 2), 14, encodingOP); // Spindle ID
    buf.write(pad(chunk.sequenceNumber, 2), 16, encodingOP); // Sequence Number
    buf.write(pad(chunk.messageParts, 1), 18, encodingOP); // Message Parts
    buf.write(pad(chunk.messageNumber, 1), 19, encodingOP); // Message Number
    buf.write(chunk.payload.toString(encodingOP), 20, encodingOP); // Payload
    buf.write("\u0000", sizeMessage - 1, encodingOP); // Null terminator

    debug("AtlasCopco serialization result:", buf);
    return buf;
  }

  _normalizeField(field, defaultValue, min, max, fieldName) {
    if (field === undefined || field === " " || field === "  ") {
      return defaultValue;
    }
    field = Number(field);
    if (isNaN(field) || field < min || field > max) {
      throw new Error(`Invalid ${fieldName} [${field}]`);
    }
    return field;
  }

  _destroy() {
    // No-op, needed to handle older Node.js versions
  }
}

module.exports = OpenProtocolSerializer;
