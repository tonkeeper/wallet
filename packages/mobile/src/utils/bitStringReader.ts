import { Buffer } from 'buffer';
import TonWeb from 'tonweb';

const BigNumber = TonWeb.utils.BN;

export class BitStringReader {
  private buffer: Buffer;
  private length: number;
  private offset = 0;

  get currentOffset() {
    return this.offset;
  }

  get remaining() {
    return this.length - this.offset;
  }

  constructor(bits) {
    let r = Buffer.from(bits.array);
    this.buffer = r;
    this.length = bits.length;
  }

  skip(bits: number) {
    for (let i = 0; i < bits; i++) {
      this.readBit();
    }
  }

  readUint(bits: number) {
    if (bits == 0) {
      return new BigNumber(0);
    }

    let res = '';
    for (let i = 0; i < bits; i++) {
      res += this.readBit() ? '1' : '0';
    }
    return new BigNumber(res, 2);
  }

  readUintNumber(bits: number) {
    return this.readUint(bits).toNumber();
  }

  readInt(bits: number) {
    if (bits === 0) {
      return new BigNumber(0);
    }
    if (bits === 1) {
      if (this.readBit() /* isNegative */) {
        return new BigNumber(-1);
      } else {
        return new BigNumber(0);
      }
    }

    if (this.readBit() /* isNegative */) {
      let base = this.readUint(bits - 1);
      const b = new BigNumber(2);
      const nb = b.pow(new BigNumber(bits - 1));
      return base.sub(nb);
    } else {
      return this.readUint(bits - 1);
    }
  }

  readIntNumber(bits: number) {
    return this.readInt(bits).toNumber();
  }

  readBuffer(size: number) {
    let res: number[] = [];
    for (let i = 0; i < size; i++) {
      res.push(this.readUintNumber(8));
    }
    return Buffer.from(res);
  }

  readBit() {
    let r = this.getBit(this.offset);
    this.offset++;
    return r;
  }

  readCoins() {
    let bytes = this.readUintNumber(4);
    if (bytes === 0) {
      return '0';
    }
    return new BigNumber(this.readBuffer(bytes).toString('hex'), 'hex').toString(10);
  }

  readVarUInt(headerBits: number) {
    let bytes = this.readUintNumber(headerBits);
    if (bytes === 0) {
      return new BigNumber(0);
    }
    return new BigNumber(this.readBuffer(bytes).toString('hex'), 'hex');
  }

  readVarUIntNumber(headerBits: number) {
    return this.readVarUInt(headerBits).toNumber();
  }

  readUnaryLength() {
    let res = 0;
    while (this.readBit()) {
      res++;
    }
    return res;
  }

  readRemaining() {
    try {
      if (this.offset == this.length) {
        return null;
      }
      let res = Buffer.alloc(Math.ceil(1023 / 8), 0);
      let offset = 0;
      while (this.offset < this.length) {
        if (this.readBit()) {
          res[(offset / 8) | 0] |= 1 << (7 - (offset % 8));
        } else {
          res[(offset / 8) | 0] &= ~(1 << (7 - (offset % 8)));
        }
        offset++;
      }
      return res;
    } catch (e) {
      console.log(e);
      return null;
    }
  }

  readAddress() {
    let type = this.readUintNumber(2);
    if (type === 0) {
      return '';
    }
    if (type !== 2) {
      throw Error('Only STD address supported');
    }
    if (this.readUintNumber(1) !== 0) {
      throw Error('Only STD address supported');
    }

    const wc = this.readIntNumber(8);
    const hashPart = this.readBuffer(32);
    const addr = new TonWeb.Address(`${wc}:${TonWeb.utils.bytesToHex(hashPart)}`);
    return addr.toString(true, true, true);
  }

  readBitString(n: number) {
    let res = new BigNumber(0);
    for (let i = 0; i < n; i++) {
      if (this.readBit()) {
        res.setn(i);
      }
    }
    return res;
  }

  private getBit(n: number) {
    if (n >= this.length || n < 0) {
      throw Error('Out of range');
    }
    return (this.buffer[(n / 8) | 0] & (1 << (7 - (n % 8)))) > 0;
  }
}
