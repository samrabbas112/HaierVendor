import CryptoJS from "crypto-js";

// eslint-disable-next-line max-statements-per-line
const a = "a";
const d = "o";
const f = "8";
const e = "2";
const b = "1";
const g = "f";
const h = "r";
const i = "v";
const c = "o";
const o = "j";
const j = "ce";
const k = "hj";
const l = "gi";

/***
 * Encryption and decryption processing
 */
export class Aes {
  private iv: string;
  private times: CryptoJS.lib.WordArray;
  private keySize: number;
  private iterationCount: number;
  private salt: string;
  private passPhrase: string;

  constructor(
    keySize: number = 128,
    iterationCount: number = 8,
    iv: string = "",
    itc: string = "",
  ) {
    const ioc = b + g + h + i + k + l + a + d + f + e + c + o + j;

    this.iv = iv;
    this.times = CryptoJS.enc.Utf8.parse(ioc);
    this.keySize = keySize;
    this.iterationCount = iterationCount;
    this.salt = "";
    this.passPhrase = "";
  }

  setNewKey(
    iv: string,
    key: CryptoJS.lib.WordArray,
  ): Promise<[string, CryptoJS.lib.WordArray]> {
    return new Promise((resolve, reject) => {
      if (iv && key) {
        this.iv = iv;
        this.times = key;
        resolve([this.iv, this.times]);
      } else {
        reject(new Error("Invalid iv or key"));
      }
    });
  }

  objPipe(
    obj: Record<string, any>,
    type: number,
    props: string[],
  ): Record<string, any> {
    const result = this.objCopy(obj);

    props.forEach((prop) => {
      if (type > 0) result[prop] = this.encrypt(obj[prop]);
      else result[prop] = this.decrypt(obj[prop]);
    });

    return result;
  }

  private objCopy(obj: Record<string, any>): Record<string, any> {
    const copy: Record<string, any> = {};
    for (const prop in obj) {
      const typeOf = Object.prototype.toString.call(obj[prop]);
      if (typeOf === "[object Object]" || typeOf === "[object Array]")
        copy[prop] = this.objCopy(obj[prop]);
      else copy[prop] = obj[prop];
    }

    return copy;
  }

  encrypt(data: any, props?: string[]): string | Record<string, any> | null {
    const typeOf = Object.prototype.toString.call(data);
    let result: string | Record<string, any> | null = null;
    switch (typeOf) {
      case "[object Object]":
        result = props
          ? this.objPipe(data, 1, props)
          : this.doEncrypt(JSON.stringify(data));
        break;
      case "[object Array]":
        result = props
          ? data.map((e: any) => this.objPipe(e, 1, props))
          : this.doEncrypt(JSON.stringify(data));
        break;
      case "[object String]":
        result = this.doEncrypt(data as string);
        break;
      case "[object Number]":
        result = this.doEncrypt(String(data));
        break;
    }

    return result || console.error("Encryption Error");
  }

  decrypt(data: any, props?: string[]): string | Record<string, any> | null {
    const typeOf = Object.prototype.toString.call(data);
    let result: string | Record<string, any> | null = null;
    switch (typeOf) {
      case "[object Object]":
        result = props
          ? this.objPipe(data, 0, props)
          : this.doDecrypt(JSON.stringify(data));
        break;
      case "[object Array]":
        result = props
          ? data.map((e: any) => this.objPipe(e, 0, props))
          : this.doDecrypt(JSON.stringify(data));
        break;
      case "[object String]":
        result = this.doDecrypt(data as string);
        break;
      case "[object Number]":
        result = this.doDecrypt(String(data));
        break;
    }

    return result || console.error("Decryption Error");
  }

  generateKey(salt: string, passPhrase: string): void {
    const key = CryptoJS.PBKDF2(passPhrase, CryptoJS.enc.Hex.parse(salt), {
      keySize: this.keySize / 32,
      iterations: this.iterationCount,
    });

    this.times = key;
  }

  public doEncrypt(plainText: string): string {
    const encrypted = CryptoJS.AES.encrypt(plainText, this.times, {
      iv: CryptoJS.enc.Latin1.parse(this.iv),
      mode: CryptoJS.mode.ECB,
      padding: CryptoJS.pad.Pkcs7,
    });

    return encrypted.ciphertext.toString(CryptoJS.enc.Base64);
  }

  private doDecrypt(cipherText: string): string {
    const decrypted = CryptoJS.AES.decrypt(cipherText, this.times, {
      iv: CryptoJS.enc.Latin1.parse(this.iv),
      mode: CryptoJS.mode.ECB,
      padding: CryptoJS.pad.Pkcs7,
    });

    return decrypted.toString(CryptoJS.enc.Utf8);
  }
}
