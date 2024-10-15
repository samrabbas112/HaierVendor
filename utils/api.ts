import md5 from 'md5';
const aes = new Aes();

export const $api = $fetch.create({
  async onRequest({ options }) {
    options.baseURL = useRuntimeConfig().public.apiBaseUrl
    // Set headers
    options.headers = signTheHeaders(options.headers);
    // Encrypt the body in case body exits
    if(options.body){
      options.body = encryptBody(options.body)
    }
  },
  async onResponse({ response }) {
    // Decrypt the response
    if(response._data){
      const decryptedData = aes.doDecrypt(response._data)
      log('<-', { method: 'response' , path:response.url, data: decryptedData })
      response._data = JSON.parse(decryptedData);
    }
    return response
  },
})

// Function to generate nonce
const setNonce = (len = 32) =>  {
  const $chars = 'ABCDEFGHJKMNPQRSTWXYZabcdefhijkmnprstwxyz2345678'
  const maxPos = $chars.length
  let pwd = ''
  for (let i = 0; i < len; i++)
    pwd += $chars.charAt(Math.floor(Math.random() * maxPos))

  return pwd
}

const signTheHeaders = (headers) => {
  const token = useCookie('authToken').value
  const nonce = setNonce(32)
  const timestamp = new Date().getTime()
  const key = 'rh5ffurhv28m2q14'
  headers = {
      ...headers,
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      'Nonce': nonce,
      'Timestamp': timestamp,
    }
  if (token) {
    const param = `Authorization=Bearer ${token}&Nonce=${nonce}&Timestamp=${timestamp}&Key=${key}`
    headers.Sign = md5(param).toUpperCase()
    headers.Authorization = `Bearer ${token}`
  } else {
    const param = `Nonce=${nonce}&Timestamp=${timestamp}&Key=${key}`
    headers.Sign = md5(param).toUpperCase()
  }
  return headers;
}

const encryptBody = (body:any) => {
  log('-> before encryption', { method: options.method , path:options.baseURL, data: body })
  if(body){
    const encryptedBody =  typeof body === 'string' ? aes.doEncrypt(body ) : aes.doEncrypt(JSON.stringify(body ))
    log('->', { method: options.method , path:options.baseURL, data: JSON.stringify(encryptedBody) })
    return encryptedBody;
  }
  return body
}
