const aes = new Aes()

export const useApi = () => {
  const get = async (url: string, params?: any) => {
    log('->', { method: 'get', url, params })
    try {
      return await $api(url, { params })
    }
    catch (error) {
      handleError(error)
    }
  }

  const getFile = async (url: string, data?: any) => {
    try {
      return await $api(url, {
        ...data,
        responseType: 'blob',
      })
    }
    catch (error) {
      handleError(error)
    }
  }

  const post = async (url: string, data: any) => {
    log('->', { method: 'post', url, data })
    try {
      const encryptedData = typeof data === 'string' ? aes.doEncrypt(data) : aes.doEncrypt(JSON.stringify(data))
      console.log(encryptedData)
      return await $api(url, {
        method: 'post',
        body: encryptedData,
      })
    }
    catch (error) {
      handleError(error)
    }
  }

  const put = async (url: string, data: any) => {
    log('->', { method: 'put', url, data })

    try {
      const encryptedData = typeof data === 'string' ? aes.doEncrypt(data) : aes.doEncrypt(JSON.stringify(data))

      return await $api(url, {
        method: 'PUT',
        body: encryptedData,
      })
    }
    catch (error) {
      handleError(error)
    }
  }

  const del = async (url: string, config?: any) => {
    log('->', { method: 'delete', url })

    try {
      if (config?.data) {
        config.data = typeof config.data === 'string'
          ? aes.doEncrypt(config.data)
          : aes.doEncrypt(JSON.stringify(config.data))
      }

      return await $api(url, {
        method: 'DELETE',
        ...config,
      })
    }
    catch (error) {
      handleError(error)
    }
  }

  const patch = async (url: string, data: any) => {
    console.log(data)

    try {
      const encryptedData = aes.doEncrypt(JSON.stringify(data))

      console.log({ encryptedData })

      return await $api(url, {
        method: 'PATCH',
        body: encryptedData,
      })
    }
    catch (error) {
      handleError(error)
    }
  }

  const upload = async (url: string, formData: FormData, config: any = {}) => {
    log('->', { method: 'upload', url, data: formData })

    try {
      return await $api(url, {
        method: 'POST',
        body: formData,
        headers: {
          'Content-Type': 'multipart/form-data',
          'Authorization': `Bearer ${localStorage.getItem('mst')}`,
          ...config.headers,
        },
      })
    }
    catch (error) {
      handleError(error)
    }
  }

  const handleError = (error: any) => {
    console.log('============Catch Block=============')
    if (error?.data) {
      const errorResponse = aes.doDecrypt(error.data)

      console.log(errorResponse.message)
    }
    else {
      console.error(error)
    }
    console.log('=============End Block============')
  }

  return {
    get,
    getFile,
    post,
    put,
    del,
    patch,
    upload,
  }
}
