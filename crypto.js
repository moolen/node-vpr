const crypto = require('crypto');
const buffer = require('buffer');

const ALGO = 'aes-128-gcm';

const encrypt = key => buf => {
  const iv = Buffer.from(crypto.randomBytes(16));
  const cipher = crypto.createCipheriv(ALGO, key, iv);
  let enc = cipher.update(buf, 'utf8', 'hex');
  enc += cipher.final('hex');
  return Buffer.concat([iv, cipher.getAuthTag(), Buffer.from(enc, 'hex')]);
};

const decrypt = key => buf => {
  iv = buf.slice(0,16)
  authTag = buf.slice(16,32)
  enc = buf.slice(32)
  
  const decipher = crypto.createDecipheriv(ALGO, key, iv);
  decipher.setAuthTag(authTag);
  let str = decipher.update(enc, 'hex', 'utf8');
  str += decipher.final('utf8');
  return Buffer.from(str, 'utf8');
};

module.exports = {
  encrypt: encrypt,
  decrypt: decrypt
}
