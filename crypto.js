
import CryptoJS from 'crypto-js';
const encrypt = (text) => {
  return CryptoJS.enc.Base64.stringify(CryptoJS.enc.Utf8.parse(text));
};

const decrypt = (data) => {
  return CryptoJS.enc.Base64.parse(data).toString(CryptoJS.enc.Utf8);
};

const toLocalDt = (unix_ts) => {
  // Create a new JavaScript Date object based on the timestamp
  // multiplied by 1000 so that the argument is in milliseconds, not seconds.
  var date = new Date(unix_ts * 1000);
  // Hours part from the timestamp
  var hours = date.getHours();
  // Minutes part from the timestamp
  var minutes = "0" + date.getMinutes();
  // Seconds part from the timestamp
  var seconds = "0" + date.getSeconds();

  // Will display time in 10:30:23 format
  return hours + ':' + minutes.substr(-2) + ':' + seconds.substr(-2);
}

function test() {
    let enStr = encrypt("e88e1a8096cd4897b79b230a9c49b243");
    console.log("Encrypted Key: " + enStr);
    console.log("Decrypted key: " + decrypt(enStr));

}

// test();
export {encrypt, decrypt, toLocalDt};