import Vue from 'vue'
import CryptoJS from 'crypto-js'

export default {
    encrypt (word, keyStr) {
        keyStr = keyStr ? keyStr : 'abcdefgabcdefg12'
        let key = CryptoJS.enc.Utf8.parse(keyStr)
        let srcs = CryptoJS.enc.Utf8.parse(word)
        let encrypted = CryptoJS.AES.encrypt(srcs, key, {mode:CryptoJS.mode.ECB,padding:CryptoJS.pad.Pkcs7})
        return encrypted.toString();
    },

    decrypt (word, keyStr) {
        keyStr = keyStr ? keyStr : 'abcdefgabcdefg12'
        let key = CryptoJS.enc.Utf8.parse(keyStr)
        let decrypt = CryptoJS.AES.decrypt(word, key, {mode:CryptoJS.mode.ECB,padding:CryptoJS.pad.Pkcs7})
        return CryptoJS.enc.Utf8.stringify(decrypt).toString();
    }
}