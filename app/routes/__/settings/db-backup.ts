import type { LoaderArgs } from "@remix-run/node";
import { redirect } from "@remix-run/node";
import { spawn } from "node:child_process";
import { readdir, unlink } from "node:fs/promises";
import { authGuard } from "~/utils/session.server";

export async function loader({ request }: LoaderArgs) {
  await authGuard(request);

  const deleteOldBackups = readdir("public").then((files) =>
    Promise.allSettled(
      files.map(
        (file) => file.startsWith("db-backup-") && unlink("public/" + file)
      )
    )
  );

  const dbfile = process.env.DATABASE_URL!.startsWith("file:./")
    ? "prisma" + process.env.DATABASE_URL!.substring(6)
    : process.env.DATABASE_URL!.substring(5);

  const backupPath = `/db-backup-${new Date(Date.now() + 5 * 60 * 1000)
    .toJSON()
    .substring(0, 16)
    .replace("T", "-")
    .replace(":", "")}.db`;

  await new Promise((resolve) => {
    const sqliteBackup = spawn("sqlite3", [
      dbfile,
      `.backup public${backupPath}`,
    ]);
    sqliteBackup.on("close", () => {
      const xz = spawn("xz", [`public${backupPath}`]);
      xz.on("close", resolve);
    });
  });

  await deleteOldBackups;

  return redirect(backupPath + ".xz");
}
