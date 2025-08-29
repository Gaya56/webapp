import apiClient from './apiClient'
import uploadFile from './uploadFile'

export const processUploadedFile = async (file, setIsProcessingUploadedFile) => {
  // check file size
  if(file.size > 50 * 1024 * 1024) return null;

  setIsProcessingUploadedFile(true);

  const fileUrl = await uploadFile(file, import.meta.env.VITE_TEMP_FILE_HOST_URL);
  const formData = new FormData();
  formData.append("url", fileUrl);

  const { data, ok } = await apiClient.post("/process-file", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
  setIsProcessingUploadedFile(false);

  return ok ? data : null;
};