import Vue from 'vue'
import CryptoJS from 'crypto-js'

export default {
    //Uint转字符
    Uint8ArrayToString(fileData){
        var dataString = "";
        for (var i = 0; i < fileData.length; i++) {
          dataString += String.fromCharCode(fileData[i]);
        }
       
        return dataString
    },
    //init转byte
    intTobytes(n) {
        var bytes = [];
       
        for (var i = 0; i < 2; i++) {
          bytes[i] = n >> (8 - i * 8);
       
        }
        return bytes;
      },
    //数据解析
    Int8parse(u8arr) {
        // Shortcut
        var len = u8arr.length;
  
        // Convert
        var words = [];
        for (var i = 0; i < len; i++) {
            words[i >>> 2] |= (u8arr[i] & 0xff) << (24 - (i % 4) * 8);
        }
  
        return CryptoJS.lib.WordArray.create(words, len);
    },
    //本地加密
    encrypt (text,keyword) {
        //转换成WordArray
        let word = CryptoJS.enc.Utf8.parse(text)
        let key =  CryptoJS.enc.Utf8.parse(keyword)
        let encrypted = CryptoJS.AES.encrypt(word, key, {mode:CryptoJS.mode.ECB,padding:CryptoJS.pad.NoPadding})
        // console.log(srcs,'srcs')
        // return data.toString();
        //不使用toString返回的是base64
        return encrypted.toString()
        //不使用toString返回的是WordArray
        // return srcs
    },    
    decrypt (word,keyword) {
        //把key转换成WordArray
        let key = CryptoJS.enc.Utf8.parse(keyword);
        //对word进行解密（此时密文是WordArray）
        let decrypt = CryptoJS.AES.decrypt(word,key,{mode:CryptoJS.mode.ECB,padding:CryptoJS.pad.NoPadding})
        // let dcBase64String = decrypt.toString(CryptoJS.enc.Utf8)
        // let dcArrayBuffer
        // decrypt = CryptoJS.enc.Utf8.stringify(decrypt).toString();
        // console.log(word,'baseResult')
        // console.log(wordArr,'CryptoJS.enc.Utf8.stringify(decrypt).toString()')
        return CryptoJS.enc.Utf8.stringify(decrypt)
        // return decrypt
    }
}