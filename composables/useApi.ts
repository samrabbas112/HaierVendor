const aes = new Aes()

export const useApi = () => {
  const makeRequest = async (url: string, method: string, body: any = null, params: any = null) => {
    try {
      const options: any = { method };
      if (method === 'get' && params) {
        options.params = params;
      } else if (['post', 'put', 'patch'].includes(method) && body) {
        options.body = body;
      }
      return await $api(url, options);
    } catch (error) {
       return handleError(error);
    }
  };


  const getFile = async (url: string, data?: any) => {
    try {
      return await $api(url, {
        ...data,
        responseType: 'blob',
      })
    }
    catch (error) {
      return  handleError(error)
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
      return handleError(error)
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
    log('<-', { method: 'error', path: '', data: error.data ,color: '#ff6633' });
    console.log('=============End Block============')
    return error.data ?? error;
  }

  return {
    makeRequest,
    getFile,
    del,
    upload,
  }
}
