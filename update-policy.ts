import { getSystemDb } from "./src/lib/db";
async function run() {
  const db = getSystemDb();
  await db.storagePolicy.updateMany({
    data: { folderMapping: null }
  });
  console.log("Done");
}
run();
