import md5 from 'md5';
export const $api = $fetch.create({
  async onRequest({ options }) {
    options.baseURL = useRuntimeConfig().public.apiBaseUrl || localStorage.baseUrl || '/api'

    const token = useCookie('authToken').value
    const nonce = setNonce(32)
    const timestamp = new Date().getTime()
    const key = 'rh5ffurhv28m2q14'

    // Set headers
    options.headers = {
      ...options.headers,
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      'Nonce': nonce,
      'Timestamp': timestamp,
    }

    if (token) {
      const param = `Authorization=Bearer ${token}&Nonce=${nonce}&Timestamp=${timestamp}&Key=${key}`

      options.headers.Sign = md5(param).toUpperCase()
      options.headers.Authorization = `Bearer ${token}`
    }
    else {
      // Signature without token
      const param = `Nonce=${nonce}&Timestamp=${timestamp}&Key=${key}`

      options.headers.Sign = md5(param).toUpperCase()
    }
  },
})

// Function to generate nonce
function setNonce(len = 32) {
  const $chars = 'ABCDEFGHJKMNPQRSTWXYZabcdefhijkmnprstwxyz2345678'
  const maxPos = $chars.length
  let pwd = ''
  for (let i = 0; i < len; i++)
    pwd += $chars.charAt(Math.floor(Math.random() * maxPos))

  return pwd
}
