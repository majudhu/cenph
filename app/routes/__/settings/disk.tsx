import type { ActionArgs, LoaderArgs } from "@remix-run/node";
import { json } from "@remix-run/node";
import { Form, useLoaderData } from "@remix-run/react";
import { authGuard } from "~/utils/session.server";
import { removeFile, statfs } from "~/utils/upload.server";

export async function loader({ request }: LoaderArgs) {
  await authGuard(request);

  const { free, size, files } = await statfs();

  return json({ files, free, size });
}

export default function Customers() {
  const { files, free, size } = useLoaderData<typeof loader>();

  const uploads = Math.ceil(
    files.reduce((total, file) => total + file.size, 0) / 1024
  );

  return (
    <Form className="w-full">
      <h1 className="flex flex-wrap justify-between">Disk Usage</h1>

      <p className="font-medium mb-8">
        Disk: {Math.round(size)} MB | Usage: {Math.round(size - free)} MB |
        Free: {Math.round(free)} MB | Uploads: {uploads} MB ({files.length}{" "}
        files)
      </p>

      <table className="table table-auto table-compact text-xs w-full">
        <thead>
          <tr>
            <th>#</th>
            <th className="hidden sm:table-cell">Name</th>
            <th className="hidden sm:table-cell">Size</th>
            <th className="hidden sm:table-cell">Date</th>
            <th className="hidden sm:table-cell">Delete</th>
          </tr>
        </thead>
        <tbody>
          {files.map(({ name, date, size }, i) => (
            <tr key={name} className="hover" role="button">
              <td>{i + 1}</td>
              <td className="whitespace-break-spaces">
                <a target="_blank" href={`/uploads/${name}`} rel="noreferrer">
                  {name}
                </a>
              </td>
              <td className="whitespace-break-spaces">{size}KB</td>
              <td className="whitespace-break-spaces">
                {dateFormat.format(new Date(date))}
              </td>
              <td className="hidden sm:table-cell">
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
    if (request.method == "DELETE") {
      const formData = await request.formData();
      const file = formData.get("file") as string;
      await removeFile(file);
    }
    return null;
  } catch (ex) {}
  return new Response(null, { status: 400 });
}

const dateFormat = new Intl.DateTimeFormat("en-uk", {
  dateStyle: "short",
  timeStyle: "short",
});
