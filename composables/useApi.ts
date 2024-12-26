import { RequestStatusCode } from "@/utils/constants";

const aes = new Aes();
export const useApi = () => {
  const handleError = (error: any) => {
    if (error.status === RequestStatusCode.HTTP_UNAUTHORIZED) {
      console.log("status", RequestStatusCode.HTTP_UNAUTHORIZED);
      useAuthStore().logout();
      useRouter().push("/login").then();
    }
    log("<-", {
      method: "error",
      path: "",
      data: error.data,
      color: "#ff6633",
    });

    return error.data ?? error;
  };

  const makeRequest = async (
    url: string,
    method: string,
    body: any = null,
    params: any = null,
  ) => {
    try {
      const options: any = { method };
      if (method === "get" && params) options.params = params;
      else if (["post", "put", "patch"].includes(method) && body)
        options.body = body;

      return await $api(url, options);
    } catch (error) {
      return handleError(error);
    }
  };

  const getFile = async (url: string, data?: any) => {
    try {
      return await $api(url, {
        ...data,
        responseType: "blob",
      });
    } catch (error) {
      return handleError(error);
    }
  };

  const del = async (url: string, config?: any) => {
    log("->", { method: "delete", url });

    try {
      if (config?.data) {
        config.data =
          typeof config.data === "string"
            ? aes.doEncrypt(config.data)
            : aes.doEncrypt(JSON.stringify(config.data));
      }

      return await $api(url, {
        method: "DELETE",
        ...config,
      });
    } catch (error) {
      return handleError(error);
    }
  };

  const upload = async (url: string, formData: FormData, config: any = {}) => {
    console.log("url:", url);
    console.log("formData:", formData);
    log("->", { method: "upload", url, data: formData });

    try {
      return await $api(url, {
        method: "POST",
        body: formData,
        headers: {
          "Content-Type": "multipart/form-data",
          Authorization: `Bearer ${localStorage.getItem("mst")}`,
          ...config.headers,
        },
      });
    } catch (error) {
      return handleError(error);
    }
  };

  return {
    makeRequest,
    getFile,
    del,
    upload,
  };
};
