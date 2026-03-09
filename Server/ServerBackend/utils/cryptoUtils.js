const CryptoJS = require('crypto-js');
require('dotenv').config();


const CAESAR = {
    OFFSET: parseInt(process.env.CAESAR_OFFSET) || 0,
    VALID_TOKEN: process.env.CAESAR_VALID_TOKEN || ''
};

const AES = {
    SECRET_KEY: process.env.AES_SECRET_KEY || '',
    IV: process.env.AES_IV || ''
};

/**
 * 凯撒加密（字符偏移）
 * @param {string} str 待加密字符串
 * @param {number} offset 偏移量（默认用配置文件的值）
 * @returns {string} 加密后字符串
 */
function caesarEncrypt(str, offset = CAESAR.OFFSET) {
    return str.split('').map(char => {
        const charCode = char.charCodeAt(0);

        if (charCode >= 65 && charCode <= 90) {
            return String.fromCharCode(((charCode - 65 + offset) % 26) + 65);
        } else if (charCode >= 97 && charCode <= 122) {
            return String.fromCharCode(((charCode - 97 + offset) % 26) + 97);
        }
        return char;
    }).join('');
}

/**
 * 凯撒解密
 * @param {string} str 待解密字符串
 * @param {number} offset 偏移量
 * @returns {string} 解密后字符串
 */
function caesarDecrypt(str, offset = CAESAR.OFFSET) {
    return caesarEncrypt(str, 26 - offset);
}

/**
 * AES加密（CBC模式 + PKCS7填充）
 * @param {string} str 待加密字符串
 * @returns {string} Base64格式加密结果
 */
function aesEncrypt(str) {
    const key = CryptoJS.enc.Utf8.parse(AES.SECRET_KEY);
    const iv = CryptoJS.enc.Utf8.parse(AES.IV);
    const encrypted = CryptoJS.AES.encrypt(str, key, {
        iv: iv,
        mode: CryptoJS.mode.CBC,
        padding: CryptoJS.pad.Pkcs7
    });
    return encrypted.toString();
}

/**
 * AES解密
 * @param {string} str Base64格式的加密字符串
 * @returns {string} 解密后字符串
 */
function aesDecrypt(str) {
    const key = CryptoJS.enc.Utf8.parse(AES.SECRET_KEY);
    const iv = CryptoJS.enc.Utf8.parse(AES.IV);
    const decrypted = CryptoJS.AES.decrypt(str, key, {
        iv: iv,
        mode: CryptoJS.mode.CBC,
        padding: CryptoJS.pad.Pkcs7
    });
    return decrypted.toString(CryptoJS.enc.Utf8);
}


module.exports = {
    caesarEncrypt,
    caesarDecrypt,
    aesEncrypt,
    aesDecrypt
};
