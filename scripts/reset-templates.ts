import { getSystemDb } from "../src/lib/db";
import { defaultTemplates } from "../src/actions/default-templates";

async function main() {
  const db = getSystemDb();
  
  const templateBody = defaultTemplates.find(t => t.code === 'QUOTATION_SIGN_REQUEST_SENT')?.body;
  if (templateBody) {
    await db.emailTemplate.updateMany({
      where: { code: 'QUOTATION_SIGN_REQUEST_SENT' },
      data: { body: templateBody }
    });
    console.log("Updated QUOTATION_SIGN_REQUEST_SENT!");
  }
  
  await db.setting.deleteMany({
    where: { key: 'email_global_layout' }
  });
  console.log("Cleared email_global_layout from tenant settings");
  
  try {
    await db.systemSettings.update({
      where: { id: "global" },
      data: { email_global_layout: "" }
    });
  } catch (e) {
    // Ignore if not exists
  }
  console.log("Done!");
}
main();
