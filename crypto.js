const crypto = require('crypto');
const buffer = require('buffer');

const ALGO = 'aes-128-cbc';

const encrypt = key => buf => {
  const iv = Buffer.from(crypto.randomBytes(16));
  const cipher = crypto.createCipheriv(ALGO, key, iv);
  return Buffer.concat([iv, cipher.update(buf), cipher.final()])
};

const decrypt = key => buf => {
  const iv = buf.slice(0,16)
  const enc = buf.slice(16)
  const decipher = crypto.createDecipheriv(ALGO, key, iv);
  return Buffer.concat([decipher.update(enc), decipher.final()])
};

module.exports = {
  encrypt: encrypt,
  decrypt: decrypt
}
