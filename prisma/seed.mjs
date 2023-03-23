import { hash } from "@node-rs/argon2";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const username = "cenph";
const password = await hash("1234", { algorithm: 1 });

try {
  await prisma.user.upsert({
    where: { username },
    update: {},
    create: { username, password },
  });
  await prisma.$disconnect();
} catch (e) {
  console.error(e);
  await prisma.$disconnect();
  process.exit(1);
}
