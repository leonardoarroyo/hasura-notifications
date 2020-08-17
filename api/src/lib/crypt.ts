import crypto from 'crypto'

const algorithm = 'aes256';
const inputEncoding = 'utf8';
const outputEncoding = 'hex';
const ivlength = 16  // aes blocksize

const PASSWORD = process.env.PG_SECRET_DATA_KEY || 'secret'
const secretDataKey = crypto.pbkdf2Sync(PASSWORD, 'salt', 100000, 32, 'sha512')


export const encrypt = (text: string) => {
  const iv = crypto.randomBytes(ivlength)
  const cipher = crypto.createCipheriv(algorithm, secretDataKey, iv)
  var ciphered = cipher.update(text, inputEncoding, outputEncoding)
  ciphered += cipher.final(outputEncoding)
  const ciphertext = iv.toString(outputEncoding) + ':' + ciphered
  return ciphertext
}


export const decrypt = (ciphertext: string) => {
  var components = ciphertext.split(':')
  var iv_from_ciphertext = Buffer.from(components[0], outputEncoding)
  var decipher = crypto.createDecipheriv(algorithm, secretDataKey, iv_from_ciphertext)
  var deciphered = decipher.update(components[1], outputEncoding, inputEncoding)
  deciphered += decipher.final(inputEncoding)

  return deciphered
}

