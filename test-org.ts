require("dotenv").config();
const { db } = require("./src/lib/db");
async function main() {
  const orgs = await db.organization.findMany();
  console.log(orgs.map(o => ({ id: o.id, name: o.name, slug: o.slug })));
}
main().finally(() => db.$disconnect());
