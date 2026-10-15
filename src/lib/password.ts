import {
  randomBytes,
  scrypt as scryptCallback,
  timingSafeEqual,
} from "node:crypto";

const SCRYPT_N = 16384;
const SCRYPT_R = 8;
const SCRYPT_P = 1;

const KEY_LENGTH = 64;

function deriveKey(
  password: string,
  salt: Buffer,
): Promise<Buffer> {
  return new Promise(
    (resolve, reject) => {
      scryptCallback(
        password,
        salt,
        KEY_LENGTH,
        {
          N: SCRYPT_N,
          r: SCRYPT_R,
          p: SCRYPT_P,
        },
        (error, derivedKey) => {
          if (error) {
            reject(error);
            return;
          }

          resolve(
            derivedKey as Buffer,
          );
        },
      );
    },
  );
}

export async function hashPassword(
  password: string,
): Promise<string> {
  const salt =
    randomBytes(16);

  const derivedKey =
    await deriveKey(
      password,
      salt,
    );

  return [
    "scrypt",
    SCRYPT_N,
    SCRYPT_R,
    SCRYPT_P,
    salt.toString("hex"),
    derivedKey.toString("hex"),
  ].join("$");
}

export async function verifyPassword(
  password: string,
  storedHash: string,
): Promise<boolean> {
  const parts =
    storedHash.split("$");

  if (
    parts.length !== 6 ||
    parts[0] !== "scrypt"
  ) {
    return false;
  }

  const [
    ,
    nValue,
    rValue,
    pValue,
    saltHex,
    hashHex,
  ] = parts;

  const n =
    Number(nValue);

  const r =
    Number(rValue);

  const p =
    Number(pValue);

  if (
    !Number.isInteger(n) ||
    !Number.isInteger(r) ||
    !Number.isInteger(p)
  ) {
    return false;
  }

  const salt =
    Buffer.from(
      saltHex,
      "hex",
    );

  const expectedHash =
    Buffer.from(
      hashHex,
      "hex",
    );

  const actualHash =
    await new Promise<Buffer>(
      (resolve, reject) => {
        scryptCallback(
          password,
          salt,
          expectedHash.length,
          {
            N: n,
            r,
            p,
          },
          (
            error,
            derivedKey,
          ) => {
            if (error) {
              reject(error);
              return;
            }

            resolve(
              derivedKey as Buffer,
            );
          },
        );
      },
    );

  if (
    actualHash.length !==
    expectedHash.length
  ) {
    return false;
  }

  return timingSafeEqual(
    actualHash,
    expectedHash,
  );
}