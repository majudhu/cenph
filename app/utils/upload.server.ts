import { createId } from "@paralleldrive/cuid2";

import {
  unstable_composeUploadHandlers,
  unstable_createFileUploadHandler,
  unstable_createMemoryUploadHandler,
  unstable_parseMultipartFormData,
} from "@remix-run/node";
import type { FileUploadHandlerOptions } from "@remix-run/node/dist/upload/fileUploadHandler";
import fs from "fs/promises";

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
    await fs.unlink(`${__dirname}/../public/uploads/${name}`);
  } catch (ex) {}
}

export async function statfs() {
  const path = `${__dirname}/../public/uploads/`;
  const [{ bfree, bsize, blocks }, files] = await Promise.all([
    fs.statfs(path),
    fs.readdir(path).then((files) =>
      Promise.all(
        files.map(async (name) => {
          const stat = await fs.stat(path + name);
          return { name, size: Math.ceil(stat.size / 1024), date: stat.mtime };
        })
      )
    ),
  ]);

  files.sort((a, b) => b.size - a.size);

  return {
    files,
    free: (bfree * bsize) / 2 ** 20,
    size: (bsize * blocks) / 2 ** 20,
  };
}
