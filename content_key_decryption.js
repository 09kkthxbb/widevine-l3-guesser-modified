/*
This is where the magic happens
*/


var WidevineCrypto = {};
var _freeStr, stringToUTF8, writeArrayToMemory, UTF8ToString, stackSave, stackRestore, stackAlloc;


// Convert a hex string to a byte array
function hexToBytes(hex) {
    for (var bytes = [], c = 0; c < hex.length; c += 2)
    bytes.push(parseInt(hex.substr(c, 2), 16));
    return bytes;
}

// Convert a byte array to a hex string
function bytesToHex(bytes) {
    for (var hex = [], i = 0; i < bytes.length; i++) {
        var current = bytes[i] < 0 ? bytes[i] + 256 : bytes[i];
        hex.push((current >>> 4).toString(16));
        hex.push((current & 0xF).toString(16));
    }
    return hex.join("");
}



(async function() {

// The public 2048-bit RSA key Widevine uses for Chrome devices in L3, on Windows
WidevineCrypto.Module= await WasmDsp();
await WidevineCrypto.Module.ready;
_freeStr=WidevineCrypto.Module._freeStr;
stringToUTF8=WidevineCrypto.Module.stringToUTF8;
writeArrayToMemory=WidevineCrypto.Module.writeArrayToMemory;
UTF8ToString=WidevineCrypto.Module.UTF8ToString;
stackSave=WidevineCrypto.Module.stackSave;
stackRestore=WidevineCrypto.Module.stackRestore;
stackAlloc=WidevineCrypto.Module.stackAlloc;

WidevineCrypto.getCFunc = function (ident) {
  return this.Module[`_${ident}`]; // closure exported function
}
WidevineCrypto.scall = function (ident, returnType, argTypes, args, opts) {
  const toC = {
    string (str) {
      let ret = 0;
      if (str !== null && str !== undefined && str !== 0) {
        const len = (str.length << 2) + 1;
        ret = stackAlloc(len);
        stringToUTF8(str, ret, len);
      }
      return ret;
    },
    array (arr) {
      const ret = stackAlloc(arr.length);
      writeArrayToMemory(arr, ret);
      return ret;
    }
  };
  function convertReturnValue (ret) {
    if (returnType === 'string') return UTF8ToString(ret);
    if (returnType === 'boolean') return Boolean(ret);
    return ret;
  }
  const func = this.getCFunc(ident);
  const cArgs = [];
  let stack = 0;
  if (args) {
    for (let i = 0; i < args.length; i++) {
      const converter = toC[argTypes[i]];
      if (converter) {
        if (stack === 0) stack = stackSave();
        cArgs[i] = converter(args[i]);
      } else {
        cArgs[i] = args[i];
      }
    }
  }
  const _ret = func.apply(null, cArgs);
  const ret = convertReturnValue(_ret);
  _freeStr(_ret);
  if (stack !== 0) stackRestore(stack);
  return ret;
}
WidevineCrypto.swrap=function  (ident, returnType, argTypes, opts) {
  argTypes = argTypes || [];
  const numericArgs = argTypes.every((type) => type === 'number');
  const numericRet = returnType !== 'string';
  if (numericRet && numericArgs && !opts) {
    return this.getCFunc(ident);
  }
  return function () {
     
    return this.scall(ident, returnType, argTypes, arguments, opts);
  };
}
WidevineCrypto.tryUsingDecoder = WidevineCrypto.swrap('tryUsingDecoder', 'string', ['string']); 


WidevineCrypto.chromeRSAPublicKey = 
`-----BEGIN PUBLIC KEY-----
MIIEpQIBAAKCAQEA3CRKux53ESQyi3RwguxIjoPWLXiEiyzjX2RiDOJmhE0B8u+r
OhHAgUWjsccBT2HdNztoOSrPMIOg5jJ/Rl9MIMVOsURYsyD3sVWWUlSvmPLtsNrl
TttEABpnBG8TJDCBLVx+5F/mn2PzwM5EV/2Nx1RqgTrRUu3fm2g5LeJwoBHDKYmi
vzWCl5kICHYw3nxLVh7EddaMVV87aoyjoZqbVsr+jGgANIENHt0FdWQxprJUS72o
0F6gj2iSIfxI9ojrZkpp6o2ACIitYVqjxVSt6u6YHJgXySi2hdFmWFhKI6R0jdAf
TrsnuWPZTl2gs5DPl8u18n3B88dwDwYAAwhz8QIDAQABAoIBAQCzEGIpKnK3YrYq
cSBDnma2Zc6FVg6aFn0sTr7itBWnb+wx63lf1qi7fiXUqYcLRxNlpdD1DzlQwQDT
vieA2mtWDKgh0PJFYn+Xo4KOnYvn4VIuFR+IsRny64b4OFFdkobAmwgsQ0WYSPkw
z5cP65KznJq1W16BEjRceL5p8FKkH8t+oOuAcQITy/U2/hGTYGYs2LTdZHo3lcEB
BdK/iPOzoKFg8CXujnTa7bu5JomgOr0aTIWf752gUeMLz7JcgILooN7FYiCthh2W
DhlNLpqctsx0VDRXN4zkdX721IoaP1kNH+Qcn/hKY9jQaNvNEm6774qbP2Eju5Nh
YLNJsdRBAoGBAP5IV21s2oMkE8gbtTFRFoUTMTHAaEtlLr4XuEDPhiegDDlC7+yh
PF0JeSKcE5SbDnHjqNjceZyqjcyVha3juMKrM3c4ngQVkwhEsgZ8pFOQe59WeRbf
3QP4/jeDZbakYK7+h6WcF/AeCEj++0A1psOUZ6VI2zh1DZ9D0YaNCKw9AoGBAN2g
65+tE+SN+xyuXbkHWMgZeufVXnc0JsRTi8bRGga82iOJ451Ugp7xPtGpfhZbZQuC
VRYfFwc8lcGfMr+qeX2Im++IsG4QAnFI7+v3zLnOhegHGjefJiSiDwqVKAzFKObK
Cg8amNIYMnXDCM3DZvIRzlZDWyKJ00WefFoPzR3FAoGBAM0xaUOHBKmwsjnXihaa
3bZTL257Wm4E33xMPcYm8JYHQ/XtOxjTX5egLl0sX2ya10Q2NymQeJ5gzv5ZZj9V
NOH6LxS03mZjVnvkm1g6uowoWmnQ6PP5gCtVgScg5DJHYTG1eZa9aF++jGcDQ5Kj
+Md4eU7ahPSBGJX9rxWJt4btAoGBAINk0gyaif6ohkWcwofd6S7InGsxvo2hZ5Jh
ja7TbUCtWg5Tw5QU9FPS5tFaURxkFuXZ4SP6TqbFrmtaPLYRFXHtObWrLh4yc6BC
A6u7/63w2MaU32A2hGCXi59Uiqf3g6ZABfKqbAuyuMfEV0XWIQRGtjPCPxec6pqN
uV+TmqGZAoGAYLtz4/HrC1lpocwwRBcDBmHySli+CWB1Xw1ZBI4tfdTmK9axxwVu
5f7vB1xmv1EkZu7dph1lt1WdW3UYBhocV6JMX5yaCTJTPF9vTr/+p4pH29dUUm9w
FJs5O43NzDKavFpSW0BVzsBOeyqw1SKk53LYa7SIwQZdEil3B5EI16k=
-----END PUBLIC KEY-----`;

// The private 2048-bit RSA key Widevine uses for authenticating Chrome devices in L3, on Windows
// Could not extract it completely, so resorted to clumsy code lifting


WidevineCrypto.initializeKeys = async function()
{
    // load the device RSA keys for various purposes
    this.publicKeyEncrypt =  await crypto.subtle.importKey('spki', PEM2Binary(this.chromeRSAPublicKey),   {name: 'RSA-OAEP', hash: { name: 'SHA-1' },}, true, ['encrypt']);
    this.publicKeyVerify =   await crypto.subtle.importKey('spki', PEM2Binary(this.chromeRSAPublicKey),   {name: 'RSA-PSS',  hash: { name: 'SHA-1' },}, true, ['verify']);

    this.keysInitialized = true;
}
WidevineCrypto.tryDecodingKey=async function(encKey)
{

    let hex=bytesToHex(encKey);
    let res=this.tryUsingDecoder(hex);
    console.log(hex);
   
    console.log("Output");
    console.log(res);
    if(res.length<10)
    {
        throw "Could not remove padding, probably invalid key or decoding failure"
    }
    return new Uint8Array(hexToBytes(res));
}

WidevineCrypto.decryptContentKey = async function(licenseRequest, licenseResponse)
{
    licenseRequest = SignedMessage.read(new Pbf(licenseRequest));
    licenseResponse = SignedMessage.read(new Pbf(licenseResponse));
    //console.log("Decrypting?")
    //console.log("Request (from us)")
    console.log(licenseRequest)
    //console.log("Response")
    console.log(licenseResponse)
    if (licenseRequest.type != SignedMessage.MessageType.LICENSE_REQUEST.value) return;

    license = License.read(new Pbf(licenseResponse.msg));
    
    if (!this.keysInitialized) await this.initializeKeys();
    
    // make sure the signature in the license request validates under the private key
    var signatureVerified = await window.crypto.subtle.verify({name: "RSA-PSS", saltLength: 20,}, this.publicKeyVerify, 
                                                              licenseRequest.signature, licenseRequest.msg)
    if (!signatureVerified)
    {
        console.log("Can't verify license request signature; either the platform is wrong or the key has changed!");
        return null;
    }
    var sessionKey=await this.tryDecodingKey(licenseResponse.session_key);
    // decrypt the session key
    // = await crypto.subtle.decrypt({name: "RSA-OAEP"}, this.privateKeyDecrypt, licenseResponse.session_key);

    // calculate context_enc
    var encoder = new TextEncoder();
    var keySize = 128;
    var context_enc = concatBuffers([[0x01], encoder.encode("ENCRYPTION"), [0x00], licenseRequest.msg, intToBuffer(keySize)]);

    // calculate encrypt_key using CMAC
    var encryptKey = wordToByteArray(
                    CryptoJS.CMAC(arrayToWordArray(new Uint8Array(sessionKey)), 
                                  arrayToWordArray(new Uint8Array(context_enc))).words);

    // iterate the keys we got to find those we want to decrypt (the content key(s))
    var contentKeys = []
    for (currentKey of license.key)
    {
        if (currentKey.type != License.KeyContainer.KeyType.CONTENT.value) continue;

        var keyId = currentKey.id;
        var keyData = currentKey.key.slice(0, 16); 
        var keyIv = currentKey.iv.slice(0, 16);

        // finally decrypt the content key
        var decryptedKey = wordToByteArray(
            CryptoJS.AES.decrypt({ ciphertext: arrayToWordArray(keyData) }, arrayToWordArray(encryptKey), { iv: arrayToWordArray(keyIv) }).words);

        contentKeys.push(decryptedKey);
        console.log("WidevineDecryptor: Found key: " + toHexString(decryptedKey) + " (KID=" + toHexString(keyId) + ")");
        try {
                // if (!window.__wvcounter)
                //     window.__wvcounter = 0;
                let _kid = toHexString(keyId);
                let _hex = toHexString(decryptedKey);
                let _data = { kid: _kid, hex_key: _hex };
                window.postMessage({ action: "pushKey", data: _data }, '*');
                // if (!window.top.document.getElementById(escape(JSON.stringify(_data)))) {
                //     window.postMessage({ action: "pushKey", data: _data });
                //     window.postMessage({ action: "noticeKey", count: (++__wvcounter).toString() }); //处理逻辑在content_script
                // }
        } catch (e) {
           console.log(e)
        }
    }

    return contentKeys[0];
}

//
// Helper functions
//

async function isRSAConsistent(publicKey, privateKey)
{
    // See if the data is correctly decrypted after encryption
    var testData = new Uint8Array([0x41, 0x42, 0x43, 0x44]);
    var encryptedData = await crypto.subtle.encrypt({name: "RSA-OAEP"}, publicKey, testData);
    var testDecryptedData = await crypto.subtle.decrypt({name: "RSA-OAEP"}, privateKey, encryptedData);

    return areBuffersEqual(testData, testDecryptedData);
}

function areBuffersEqual(buf1, buf2)
{
    if (buf1.byteLength != buf2.byteLength) return false;
    var dv1 = new Int8Array(buf1);
    var dv2 = new Int8Array(buf2);
    for (var i = 0 ; i != buf1.byteLength ; i++)
    {
        if (dv1[i] != dv2[i]) return false;
    }
    return true;
}

function concatBuffers(arrays) 
{
    // Get the total length of all arrays.
    let length = 0;
    arrays.forEach(item => {
      length += item.length;
    });
    
    // Create a new array with total length and merge all source arrays.
    let mergedArray = new Uint8Array(length);
    let offset = 0;
    arrays.forEach(item => {
      mergedArray.set(new Uint8Array(item), offset);
      offset += item.length;
    }); 
    
    return mergedArray;
}

// CryptoJS format to byte array
function wordToByteArray(wordArray) 
{
    var byteArray = [], word, i, j;
    for (i = 0; i < wordArray.length; ++i) {
        word = wordArray[i];
        for (j = 3; j >= 0; --j) {
            byteArray.push((word >> 8 * j) & 0xFF);
        }
    }
    return byteArray;
}

// byte array to CryptoJS format
function arrayToWordArray(u8Array) 
{
    var words = [], i = 0, len = u8Array.length;

    while (i < len) {
        words.push(
            (u8Array[i++] << 24) |
            (u8Array[i++] << 16) |
            (u8Array[i++] << 8)  |
            (u8Array[i++])
        );
    }

    return {
        sigBytes: len,
        words: words
    };
}

const toHexString = bytes => bytes.reduce((str, byte) => str + byte.toString(16).padStart(2, '0'), '');

const intToBuffer = num => 
{
    let b = new ArrayBuffer(4);
    new DataView(b).setUint32(0, num);
    return Array.from(new Uint8Array(b));
}

function PEM2Binary(pem) 
{
    var encoded = '';
    var lines = pem.split('\n');
    for (var i = 0; i < lines.length; i++) {
        if (lines[i].indexOf('-----') < 0) {
            encoded += lines[i];
        }
    }
    var byteStr = atob(encoded);
    var bytes = new Uint8Array(byteStr.length);
    for (var i = 0; i < byteStr.length; i++) {
        bytes[i] = byteStr.charCodeAt(i);
    }
    return bytes.buffer;
}

}());
