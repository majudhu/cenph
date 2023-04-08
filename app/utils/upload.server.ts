import { createId } from "@paralleldrive/cuid2";
import {
  unstable_composeUploadHandlers,
  unstable_createFileUploadHandler,
  unstable_createMemoryUploadHandler,
  unstable_parseMultipartFormData,
} from "@remix-run/node";
import type { FileUploadHandlerOptions } from "@remix-run/node/dist/upload/fileUploadHandler";
import fs from "node:fs/promises";

export function parseMultipart(request: Request) {
  return unstable_parseMultipartFormData(
    request,
    unstable_composeUploadHandlers(
      unstable_createFileUploadHandler(FILE_UPLOAD_OPTIONS),
      unstable_createMemoryUploadHandler()
    )
  );
}

const FILE_UPLOAD_OPTIONS: FileUploadHandlerOptions = {
  directory: "public/uploads",
  file: ({ contentType }) => `${createId()}.${MIME2EXT[contentType]}`,
};

const MIME2EXT: Record<string, string> = {
  "image/apng": "apng",
  "image/avif": "avif",
  "image/gif": "gif",
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/svg+xml": "svg",
  "image/webp": "webp",
  "application/pdf": "pdf",
};

export async function removeFile(name: string) {
  try {
    await fs.unlink(`public/uploads/${name}`);
  } catch (ex) {}
}

export async function statfs() {
  const uploads = `public/uploads/`;

  const dbfile = process.env.DATABASE_URL!.startsWith("file:./")
    ? "prisma" + process.env.DATABASE_URL!.substring(6)
    : process.env.DATABASE_URL!.substring(5);

  const [{ bfree, bsize, blocks }, files, db] = await Promise.all([
    fs.statfs(uploads),
    fs.readdir(uploads).then((files) =>
      Promise.all(
        files.map(async (name) => {
          const stat = await fs.stat(uploads + name);
          return {
            name,
            size: Math.ceil(stat.size / 1024),
            date: dateFormat(stat.mtime),
          };
        })
      )
    ),
    fs.stat(dbfile),
  ]);

  files.sort((a, b) => b.size - a.size);

  return {
    files,
    free: (bfree * bsize) / MB_BYTES,
    size: (bsize * blocks) / MB_BYTES,
    db: db.size / MB_BYTES,
  };
}

const MB_BYTES = 2 ** 20;

const dateFormat = new Intl.DateTimeFormat("en-uk", {
  dateStyle: "short",
  timeStyle: "short",
  timeZone: "Indian/Maldives",
}).format;
