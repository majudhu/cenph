import { hash } from "@node-rs/argon2";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const username = "cenph";
  const password = await hash("1234", { algorithm: 1 });

  await prisma.user.upsert({
    where: { username },
    update: {},
    create: { username, password },
  });
}

main()
  .then(() => prisma.$disconnect())
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
