import Vue from 'vue'
import CryptoJS from 'crypto-js'

export default {
    //将ArrayBuffer转换成字符串
    ab2str(buf) {
        return String.fromCharCode.apply(null, new Uint16Array(buf));
    },
    //字符串转换成ArrayBuffer
    str2ab(str) {
        var buf = new ArrayBuffer(str.length*2); // 每个字符占用2个字节
        var bufView = new Uint16Array(buf);
        for (var i=0, strLen=str.length; i<strLen; i++) {
             bufView[i] = str.charCodeAt(i);
        }
        return buf;
    },
    //base64转码
    b64EncodeUnicode(str) {
        return btoa(encodeURIComponent(str).replace(/%([0-9A-F]{2})/g, function(match, p1) {
            return String.fromCharCode('0x' + p1);
        }));
    },
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
        // console.log(CryptoJS,'CryptoJS')
        let word = CryptoJS.enc.Utf8.parse(text)
        let key =  CryptoJS.enc.Utf8.parse(keyword)
        let encrypted = CryptoJS.AES.encrypt(word, key, {mode:CryptoJS.mode.ECB,padding:CryptoJS.pad.Pkcs7})
        // console.log(srcs,'srcs')
        // return data.toString();
        //不使用toString返回的是base64
        return encrypted.toString()
        //不使用toString返回的是WordArray
        // return srcs
    },    
    decrypt (word,keyword) {
        // let word = CryptoJS.enc.Utf8.parse(text)
        //把key转换成WordArray
        let key = CryptoJS.enc.Utf8.parse(keyword);
        //对word进行解密（此时密文是WordArray）
        let decrypt = CryptoJS.AES.decrypt(word,key,{mode:CryptoJS.mode.ECB,padding:CryptoJS.pad.Pkcs7})
        // let dcBase64String = decrypt.toString(CryptoJS.enc.Utf8)
        // let dcArrayBuffer
        // decrypt = CryptoJS.enc.Utf8.stringify(decrypt).toString();
        console.log(decrypt,'baseResult')
        // console.log(wordArr,'CryptoJS.enc.Utf8.stringify(decrypt).toString()')
        return CryptoJS.enc.Utf8.stringify(decrypt).toString()
        // return decryptKey
    }
}