require("dotenv").config();
const { db } = require("./src/lib/db");
async function main() {
  const members = await db.organizationMember.findMany();
  console.log(members);
}
main().finally(() => db.$disconnect());
