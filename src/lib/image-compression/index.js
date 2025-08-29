import { createCache } from "async-cache-dedupe";

import CompressionWorker from "./worker?worker";

async function compressImageFileViaWorker(image) {
  return new Promise((resolve, reject) => {
    const worker = new CompressionWorker();

    worker.addEventListener("message", (event) => {
      const blob = event.data;
      console.debug("worker result", blob);
      resolve(new File([blob], image.name, { type: blob.type }));
      worker.terminate();
    });

    worker.addEventListener("error", (err) => {
      worker.terminate();
      reject(err);
    });

    worker.postMessage({ image });
  });
}

async function _compressImageFile(image) {
  try {
    const result = await compressImageFileViaWorker(image);
    return result;
  } catch (err) {
    console.error(err);
    return image;
  }
}

const cache = createCache({
  ttl: 5,
  storage: { type: "memory" },
});

const cacheInstance = cache.define("compressImageFile", _compressImageFile);

export const compressImageFile =
  cacheInstance.compressImageFile.bind(cacheInstance);
