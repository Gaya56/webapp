import { create } from "apisauce";

import authStorage from "./authStorage";

const apiClient = create({
  baseURL: import.meta.env.VITE_API_URL,
});

apiClient.addAsyncRequestTransform(async (request) => {
  const authToken = authStorage.getToken();
  if (authToken) request.headers["x-auth-token"] = authToken;
});

apiClient.addAsyncResponseTransform(async response => {
  if(response.status === 401) {
    authStorage.removeToken();
  }
});

export default apiClient;
