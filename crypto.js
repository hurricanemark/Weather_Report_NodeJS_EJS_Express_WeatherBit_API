
import CryptoJS from 'crypto-js';
const encrypt = (text) => {
  return CryptoJS.enc.Base64.stringify(CryptoJS.enc.Utf8.parse(text));
};

const decrypt = (data) => {
  return CryptoJS.enc.Base64.parse(data).toString(CryptoJS.enc.Utf8);
};

function test() {
    let enStr = encrypt("e88e1a8096cd4897b79b230a9c49b243");
    console.log("Encrypted Key: " + enStr);
    console.log("Decrypted key: " + decrypt(enStr));

}

// test();
export {encrypt, decrypt};