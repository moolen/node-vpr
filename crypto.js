const crypto = require('crypto');

module.exports = {
    encrypt: function (buf, key){
        const iv = crypto.randomBytes(16);
        const salt = crypto.randomBytes(64);
        const _key = crypto.pbkdf2Sync(key, salt, 2145, 32, 'sha512');
        const cipher = crypto.createCipheriv('aes-256-gcm', _key, iv);
        const encrypted = Buffer.concat([cipher.update(buf), cipher.final()]);
        const tag = cipher.getAuthTag();
        return Buffer.concat([salt, iv, tag, encrypted]);
    },
    decrypt: function (data, key){
        const salt = data.slice(0, 64);
        const iv = data.slice(64, 80);
        const tag = data.slice(80, 96);
        const text = data.slice(96);
        const _key = crypto.pbkdf2Sync(key, salt , 2145, 32, 'sha512');
        const decipher = crypto.createDecipheriv('aes-256-gcm', _key, iv);
        decipher.setAuthTag(tag);
        return decipher.update(text) + decipher.final();
    }
};