import "dotenv/config";
import { getSharedDb } from "../src/lib/db";
import { defaultTemplates, buildTemplateHtml } from "../src/actions/default-templates";

async function main() {
  const db = getSharedDb();
  
  for (const t of defaultTemplates) {
    const htmlBody = buildTemplateHtml(t);
    
    // Update all matching templates across all organizations
    const result = await db.emailTemplate.updateMany({
      where: { code: t.code },
      data: { body: htmlBody }
    });
    
    console.log(`Updated ${result.count} templates for ${t.code}`);
  }
  
  // Clear any global layout that might be overriding the template
  const settingsResult = await db.setting.deleteMany({
    where: { key: 'email_global_layout' }
  });
  console.log(`Cleared ${settingsResult.count} global layout overrides`);
  
  console.log("Done updating all templates to Vercel UI!");
}
main().catch(console.error).finally(() => process.exit(0));
