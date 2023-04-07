import type { ActionArgs, LoaderArgs } from "@remix-run/node";
import { json } from "@remix-run/node";
import { Form, useLoaderData } from "@remix-run/react";
import { authGuard } from "~/utils/session.server";
import { removeFile, statfs } from "~/utils/upload.server";
import { db } from "~/utils/db.server";

export async function loader({ request }: LoaderArgs) {
  await authGuard(request);
  return json(await statfs());
}

export default function Customers() {
  const { files, free, size, db } = useLoaderData<typeof loader>();

  const uploads = Math.ceil(
    files.reduce((total, file) => total + file.size, 0) / 1024
  );

  return (
    <Form className="w-full">
      <h1 className="flex flex-wrap justify-between">Disk Usage</h1>

      <p className="font-medium mb-6">
        Disk: {Math.round(size)} MB | Usage: {Math.round(size - free)} MB |
        Free: {Math.round(free)} MB
        <br />
        Database: {Math.ceil(db)} MB | Uploads: {uploads} MB ({files.length}{" "}
        files)
      </p>

      <a download href="db-backup" className="btn btn-success btn-sm mb-6">
        Backup Database
      </a>

      <table className="table table-auto table-compact text-xs w-full">
        <thead>
          <tr>
            <th>#</th>
            <th>Name</th>
            <th>Size</th>
            <th>Date</th>
            <th>Delete</th>
          </tr>
        </thead>
        <tbody>
          {files.map(({ name, date, size }, i) => (
            <tr key={name} className="hover" role="button">
              <td>{i + 1}</td>
              <td>
                <a target="_blank" href={`/uploads/${name}`} rel="noreferrer">
                  {name}
                </a>
              </td>
              <td>{size}KB</td>
              <td>{date}</td>
              <td>
                <button
                  type="submit"
                  name="file"
                  value={name}
                  formMethod="delete"
                  className="btn btn-xs btn-error"
                >
                  Delete
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </Form>
  );
}

export async function action({ request }: ActionArgs) {
  await authGuard(request);
  try {
    const formData = await request.formData();
    if (request.method == "DELETE") {
      const file = formData.get("file") as string;
      await removeFile(file);
    }

    return null;
  } catch (ex) {}
  return new Response(null, { status: 400 });
}
