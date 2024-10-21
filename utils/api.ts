import md5 from "md5";
const aes = new Aes();

/**
 * Creates a custom $fetch instance with request/response interceptors.
 * Handles API requests by signing headers and encrypting request bodies.
 * Decrypts response bodies on receiving the data.
 */
export const $api = $fetch.create({
  /**
   * Request interceptor: Modifies request before it is sent.
   * - Adds base URL from runtime config.
   * - Adds headers with signing logic.
   * - Encrypts the request body if it exists.
   *
   * @param {Object} options - Request options, includes URL, headers, body, etc.
   */

  async onRequest({ options }) {
    options.baseURL = useRuntimeConfig().public.apiBaseUrl;
    // Set headers
    options.headers = signTheHeaders(options.headers);
    // Encrypt the body in case body exits
    if (options.body) {
      options.body = encryptBody(options.body);
    }
  },

  /**
   * Response interceptor: Modifies response before passing it to the application.
   * - Decrypts the encrypted response data.
   *
   * @param {Object} response - Response object received from the server.
   * @returns {Object} - The modified response with decrypted data.
   */
  async onResponse({ response }) {
    // Decrypt the response
    console.log({response})
    if (response._data) {
      const decryptedData = aes.doDecrypt(response._data);
      console.log({dc:decryptedData});
      log("<-", {
        method: "response",
        path: response.url,
        data: decryptedData,
      });
      response._data = JSON.parse(decryptedData);
    }
    return response;
  },
});

/**
 * Generates a random nonce (number used once) for security purposes.
 *
 * @param {number} [len=32] - Length of the nonce to be generated.
 * @returns {string} - Randomly generated nonce string.
 */
const setNonce = (len = 32) => {
  const $chars = "ABCDEFGHJKMNPQRSTWXYZabcdefhijkmnprstwxyz2345678";
  const maxPos = $chars.length;
  let pwd = "";
  for (let i = 0; i < len; i++)
    pwd += $chars.charAt(Math.floor(Math.random() * maxPos));

  return pwd;
};

/**
 * Signs the request headers by adding authentication tokens, Nonce, and Timestamp.
 * Generates an md5 hash for request verification (Sign header).
 *
 * @param {Object} headers - Request headers object.
 * @returns {Object} - Modified headers with additional security headers.
 */
const signTheHeaders = (headers) => {

  const token =  useCookie("auth").value?.token;
  console.log({token});
  const nonce = setNonce(32);
  const timestamp = new Date().getTime();
  const key = "rh5ffurhv28m2q14";
  headers = {
    ...headers,
    "Content-Type": "application/json",
    Accept: "application/json",
    Nonce: nonce,
    Timestamp: timestamp,
  };
  if (token) {
    const param = `Authorization=Bearer ${token}&Nonce=${nonce}&Timestamp=${timestamp}&Key=${key}`;
    headers.Sign = md5(param).toUpperCase();
    headers.Authorization = `Bearer ${token}`;
  } else {
    const param = `Nonce=${nonce}&Timestamp=${timestamp}&Key=${key}`;
    headers.Sign = md5(param).toUpperCase();
  }
  return headers;
};

/**
 * Encrypts the request body using AES encryption.
 * Logs the body before and after encryption.
 *
 * @param {any} body - The request body to be encrypted.
 * @returns {string} - Encrypted request body as a string.
 */
const encryptBody = (body: any) => {
  log("-> before encryption", { method: "body", path: "", data: body });
  if (body) {
    const encryptedBody =
      typeof body === "string"
        ? aes.doEncrypt(body)
        : aes.doEncrypt(JSON.stringify(body));
    log("->", {
      method: "encrypt body",
      path: "",
      data: JSON.stringify(encryptedBody),
    });
    return JSON.stringify(encryptedBody);
  }
  return JSON.stringify(body);
};
