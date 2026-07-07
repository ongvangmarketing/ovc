import { config } from 'dotenv';
config({ path: '.env.local' });
import { db } from './src/lib/db/index.ts';

async function run() {
  const org = await db.organization.findFirst({ where: { slug: 'ovmain' } });
  if (!org) {
    console.log("No ovmain org");
    return;
  }

  let user = await db.user.findUnique({ where: { email: 'trungongvang@gmail.com' } });
  let contact = await db.contact.findFirst({ where: { email: 'trungongvang@gmail.com', organizationId: org.id } });

  console.log("User:", user?.id, "Contact:", contact?.id);

  if (user && contact) {
    const projects = await db.project.findMany({ where: { organizationId: org.id } });
    console.log(`Found ${projects.length} projects in org.`);
    
    let cnt = 0;
    for (let i = 0; i < projects.length; i++) {
      const p = projects[i];
      if (!p) continue;
      
      await db.project.update({
        where: { id: p.id },
        data: { 
          contactId: contact.id,
          customFields: { portalVisible: true, facebookReport: { enabledSources: { page: false, ads: false } } }
        }
      });
      console.log(`Updated project ${p.name} to belong to contact ${contact.id}`);
      cnt++;
      if (cnt >= 3) break;
    }
  }
}

run().then(() => process.exit(0)).catch(console.error);
