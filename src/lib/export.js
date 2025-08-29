import { fileOpen, fileSave } from "browser-fs-access";

export async function exportData() {
  const data = {
    sync: { ...localStorage },
    local: { ...localStorage },
    localStorage: { ...localStorage },
  };
  const blob = new Blob([JSON.stringify(data)], { type: "application/json" });
  await fileSave(blob, { fileName: "combochat.json" });
}

export async function importData() {
  const blob = await fileOpen({ extensions: [".json"] });
  const json = JSON.parse(await blob.text());

  if (!json.sync || !json.local) {
    throw new Error("Invalid data");
  }

  if (
    !window.confirm(
      "Are you sure you want to import data? This will overwrite your current data"
    )
  ) {
    return;
  }

  // localStorage.clear();

  for (const [key, value] of Object.entries(json.local)) {
    localStorage.setItem(key, JSON.stringify(value));
  }

  if (json.localStorage) {
    for (const [k, v] of Object.entries(json.localStorage)) {
      localStorage.setItem(k, v);
    }
  }

  alert("Imported data successfully");
  location.reload();
}
