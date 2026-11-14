#!/usr/bin/env node
// S-51: download a recipe's source photo, upload it to the Storage bucket exactly as downloaded,
// and set the recipe's photo_path to the uploaded file's name. Nothing is saved in images/.
// Usage (from the repo root):
//   SUPABASE_SERVICE_KEY=... node supabase/upload-photo.js "<recipe name>" "<photo address>" <recipe id>
// Prints "PHOTO UPLOADED <file name>" (exit 0) or "PHOTO FAILED: <why>" (exit 1). On failure the
// photo path is left as it was and the caller tells the Owner (S-52). The key is read from the
// environment only and is removed from every message this script prints.
const URL_BASE = process.env.SUPABASE_URL || "https://wbeaswhbzkqmxcsweisu.supabase.co";
const BUCKET = "recipe-photos";

// S-51.3: the extension comes from the file type actually downloaded.
const TYPES = { "image/jpeg": "jpg", "image/png": "png", "image/webp": "webp", "image/gif": "gif", "image/avif": "avif" };

function sniff(buf) {
  const b = Buffer.from(buf);
  if (b.length > 3 && b[0] === 0xff && b[1] === 0xd8 && b[2] === 0xff) return "image/jpeg";
  if (b.length > 7 && b.slice(0, 8).equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]))) return "image/png";
  if (b.length > 11 && b.slice(0, 4).toString() === "RIFF" && b.slice(8, 12).toString() === "WEBP") return "image/webp";
  if (b.length > 5 && /^GIF8[79]a/.test(b.slice(0, 6).toString())) return "image/gif";
  if (b.length > 11 && b.slice(4, 8).toString() === "ftyp" && /avif|avis/.test(b.slice(8, 12).toString())) return "image/avif";
  return null;
}

// The real type: what the bytes say, else the header. Not an image at all -> null.
function fileType(contentType, buf) {
  const header = String(contentType || "").split(";")[0].trim().toLowerCase();
  return sniff(buf) || (TYPES[header] ? header : null);
}

const scrub = (text, key) => (key ? String(text).split(key).join("[removed]") : String(text));

async function uploadPhoto({ name, photoUrl, recipeId }, key, fetchFn = fetch) {
  const fail = (why) => ({ ok: false, why: scrub(why, key) });
  if (!key) return fail("SUPABASE_SERVICE_KEY is not set.");
  if (!name || !String(name).trim()) return fail("The recipe has no name.");
  if (!photoUrl) return fail("There is no photo address.");
  if (recipeId === undefined || recipeId === null || recipeId === "") return fail("There is no recipe id.");

  // S-51.1: download from the address on the recipe page.
  let buf, type;
  try {
    const res = await fetchFn(photoUrl, { redirect: "follow" });
    if (!res.ok) return fail(`the photo could not be downloaded: ${res.status}`);
    buf = Buffer.from(await res.arrayBuffer());
    type = fileType(res.headers.get("content-type"), buf);
  } catch (e) {
    return fail("the photo could not be downloaded: " + e.message);
  }
  if (!type) return fail("the photo could not be downloaded: the address did not give an image file.");

  // S-51.3: named after the recipe; a slash would make a folder, so it becomes a hyphen.
  const file = `${String(name).trim().replace(/[\/\\]/g, "-")}.${TYPES[type]}`;
  const auth = { apikey: key, Authorization: "Bearer " + key };

  // S-51.2: the bytes go up untouched. x-upsert lets a replaced recipe overwrite its old photo.
  try {
    const up = await fetchFn(`${URL_BASE}/storage/v1/object/${BUCKET}/${encodeURIComponent(file)}`, {
      method: "POST", headers: { ...auth, "Content-Type": type, "x-upsert": "true" }, body: buf,
    });
    if (!up.ok) return fail(`the photo could not be uploaded: ${up.status} ${await up.text()}`);
  } catch (e) {
    return fail("the photo could not be uploaded: " + e.message);
  }

  // S-51.4: point the recipe at the file. S-51.5: no source address is stored anywhere.
  try {
    const patch = await fetchFn(`${URL_BASE}/rest/v1/recipe?id=eq.${encodeURIComponent(recipeId)}`, {
      method: "PATCH",
      headers: { ...auth, "Content-Type": "application/json", "Content-Profile": "recipes", Prefer: "return=representation" },
      body: JSON.stringify({ photo_path: file }),
    });
    const body = await patch.text();
    if (!patch.ok) return fail(`the file was uploaded as "${file}" but the photo path could not be set: ${patch.status} ${body}`);
    let rows = [];
    try { rows = JSON.parse(body); } catch {}
    if (!rows.length) return fail(`the file was uploaded as "${file}" but no recipe has id ${recipeId}.`);
  } catch (e) {
    return fail(`the file was uploaded as "${file}" but the photo path could not be set: ` + e.message);
  }
  return { ok: true, file };
}

module.exports = { uploadPhoto, fileType, sniff, scrub };

if (require.main === module) {
  const [name, photoUrl, recipeId] = process.argv.slice(2);
  const key = process.env.SUPABASE_SERVICE_KEY;
  uploadPhoto({ name, photoUrl, recipeId }, key).then((out) => {
    console.log(out.ok ? "PHOTO UPLOADED " + out.file : "PHOTO FAILED: " + out.why);
    process.exit(out.ok ? 0 : 1);
  });
}
