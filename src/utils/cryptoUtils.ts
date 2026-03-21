import CryptoJS from 'crypto-js';


const CRYPTO_CONFIG = {
    CAESAR: {
        OFFSET: parseInt(import.meta.env.VITE_CAESAR_OFFSET) || 0,
        VALID_TOKEN: import.meta.env.VITE_CAESAR_VALID_TOKEN || ''
    },
    AES: {
        SECRET_KEY: import.meta.env.VITE_AES_SECRET_KEY || '',
        IV: import.meta.env.VITE_AES_IV || ''
    }
};

/**
 * 凯撒加密
 * @param str 待加密字符串
 * @param offset 偏移量
 * @returns 加密后字符串
 */
export function caesarEncrypt(str: string, offset: number = CRYPTO_CONFIG.CAESAR.OFFSET): string {
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
 * AES 加密（CBC 模式）
 * @param str 待加密字符串
 * @returns Base64 加密结果
 */
export function aesEncrypt(str: string): string {
    const key = CryptoJS.enc.Utf8.parse(CRYPTO_CONFIG.AES.SECRET_KEY);
    const iv = CryptoJS.enc.Utf8.parse(CRYPTO_CONFIG.AES.IV);

    const encrypted = CryptoJS.AES.encrypt(str, key, {
        iv: iv,
        mode: CryptoJS.mode.CBC,
        padding: CryptoJS.pad.Pkcs7
    });

    return encrypted.toString();
}

/**
 * 生成鉴权 Token（凯撒加密 → AES 加密）
 * @returns 最终的加密 Token
 */
export function generateAuthToken(): string {
    const baseToken = CRYPTO_CONFIG.CAESAR.VALID_TOKEN;

    if (!baseToken) {

    }

    const caesarToken = caesarEncrypt(baseToken);
    const encrypted = aesEncrypt(caesarToken);

    return encrypted;
}
