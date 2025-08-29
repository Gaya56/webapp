export default async function uploadFile(file, url = "https://tmpfiles.org/api/v1/upload") {
  const formData = new FormData();
  formData.append("file", file);

  const response = await fetch(url, {
    method: "POST",
    body: formData,
  });

  if (!response.ok) return undefined;

  const json = await response.json();

  const imageUrl = json.data?.url || json.url;
  console.log({imageUrl})
  const modifiedImageUrl = imageUrl.replace(
    "https://tmpfiles.org/",
    "https://tmpfiles.org/dl/"
  ).replace(
    "http://tmpfiles.org/",
    "https://tmpfiles.org/dl/"
  );

  return modifiedImageUrl;
}