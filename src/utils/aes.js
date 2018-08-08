import Vue from 'vue'
import CryptoJS from 'crypto-js'

export default {
    //本地加密
    encrypt (word) {
        let srcs = CryptoJS.enc.Utf8.parse(word)
        // let encrypted = CryptoJS.AES.encrypt(srcs, key, {mode:CryptoJS.mode.ECB,padding:CryptoJS.pad.ZeroPadding})
        // console.log(srcs,'srcs')
        return srcs.toString();
    },    
    decrypt (word, keyStr) {
        let key = CryptoJS.enc.Utf8.parse(keyStr);
        let decrypt = CryptoJS.AES.decrypt(word,key,{mode:CryptoJS.mode.ECB,padding:CryptoJS.pad.ZeroPadding})
        // console.log(word,'baseResult')
        // console.log(wordArr,'CryptoJS.enc.Utf8.stringify(decrypt).toString()')
        return CryptoJS.enc.Utf8.stringify(decrypt).toString();
    },
    Uint8ArrayToString(fileData){
        var dataString = "";
        for (var i = 0; i < fileData.length; i++) {
            dataString += String.fromCharCode(fileData[i]);
        }
        
        return dataString
    },
}