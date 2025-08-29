const store = (key, value, expireDate = null) => {
  if (typeof window == "undefined") return "";

  try {
    const item = {
      value,
      timestamp: Date.now(),
    };

    if (expireDate) item["expireAt"] = expireDate;

    localStorage.setItem(key, JSON.stringify(item));
  } catch (error) {
    console.log(error);
  }
};

const get = (key) => {
  if (typeof window == "undefined") return "";

  try {
    const value = localStorage.getItem(key);
    const item = JSON.parse(value);

    if (!item) return null;
    if (!item.timestamp) return item;

    if (item.expireAt && Date.now() <= new Date(item.expireAt).valueOf()) {
      localStorage.removeItem(key);

      return null;
    }

    return item.value;
  } catch (error) {
    console.log(error);
  }
};

const remove = (key) => {
  if (typeof window == "undefined") return "";

  localStorage.removeItem(key);
};

export default {
  store,
  get,
  remove,
};
