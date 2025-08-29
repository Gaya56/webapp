// @ts-nocheck
import { jwtDecode } from "jwt-decode";
import Cookie from "js-cookie";

const key = "cp-auth-token";

const storeToken = (authToken) => {
  if(typeof window == 'undefined') return;

  try {
    Cookie.set(key, authToken, {
      expires: 365,
      secure: false,
      domain: import.meta.env.VITE_IS_DEV ? "localhost" : ".combochat.ai",
    });
  } catch (error) {
    console.log(error);
  }
};

const getToken = () => {
  if(typeof window == 'undefined') return;

  try {
    return Cookie.get(key);
  } catch (error) {
    console.log(error);
  }
};

const getUser = () => {
  if(typeof window == 'undefined') return;

  const token = getToken();
  return token ? jwtDecode(token) : null;
};

const removeToken = () => {
  if(typeof window == 'undefined') return;
  
  try {
    Cookie.remove(key, {
      domain: import.meta.env.VITE_IS_DEV ? "localhost" : ".combochat.ai",
    });
  } catch (error) {
    console.log(error);
  }
};

// removeToken();

export default { getToken, getUser, removeToken, storeToken };
