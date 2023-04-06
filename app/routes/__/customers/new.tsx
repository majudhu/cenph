import { ArrowPathIcon } from "@heroicons/react/20/solid";
import type { ActionArgs, LoaderArgs } from "@remix-run/node";
import { redirect } from "@remix-run/node";
import { Form, useNavigation } from "@remix-run/react";
import { useRef, useState } from "react";
import { db } from "~/utils/db.server";
import { authGuard } from "~/utils/session.server";
import {
  pastePhotoFromClipboard,
  previewPhotoFromInput,
} from "~/utils/upload-hooks";
import { parseMultipart } from "~/utils/upload.server";

export async function loader({ request }: LoaderArgs) {
  await authGuard(request);
  return null;
}

export default function NewCustomer() {
  const { state } = useNavigation();
  const [base64Image, setBase64Image] = useState("");
  const uploadRef = useRef<HTMLInputElement>(null);

  return (
    <Form
      method="post"
      className="bg-base-200 max-w-md"
      encType="multipart/form-data"
    >
      <h1>Add a customer</h1>

      <label className="label" htmlFor="name">
        Name
      </label>
      <input
        id="name"
        name="name"
        type="text"
        className="input input-bordered w-full mb-2"
      />

      <label className="label" htmlFor="nid">
        ID Card No.
      </label>
      <input
        id="nid"
        name="nid"
        type="text"
        className="input input-bordered w-full mb-2"
      />

      <label className="label" htmlFor="phone">
        Phone
      </label>
      <input
        id="phone"
        name="phone"
        type="text"
        className="input input-bordered w-full mb-2"
      />

      <label className="label" htmlFor="address">
        Address
      </label>
      <input
        id="address"
        name="address"
        type="text"
        className="input input-bordered w-full mb-2"
      />

      <label className="label" htmlFor="photo">
        Photo
      </label>
      {base64Image && (
        <img
          src={base64Image}
          alt="preview"
          className="w-auto mx-auto h-[250px] mb-2 object-contain"
        />
      )}

      <input
        ref={uploadRef}
        id="photo"
        name="photo"
        type="file"
        className="input file-input input-bordered px-0 w-full mb-2"
        accept="image/*"
        onChange={previewPhotoFromInput(setBase64Image)}
      />
      <button
        type="button"
        className="btn w-full"
        onClick={pastePhotoFromClipboard(setBase64Image, uploadRef)}
      >
        Paste from clipboard
      </button>

      <label className="label" htmlFor="notes">
        Notes
      </label>
      <textarea
        rows={8}
        className="textarea textarea-bordered w-full mb-4"
        id="notes"
        name="notes"
      />

      <div className="flex gap-8">
        <button
          type="submit"
          className="btn btn-primary w-40"
          disabled={state != "idle"}
        >
          {state != "idle" ? (
            <ArrowPathIcon className="mx-auto animate-spin w-6" />
          ) : (
            "Save"
          )}
        </button>
      </div>
    </Form>
  );
}

export async function action({ request }: ActionArgs) {
  await authGuard(request);
  try {
    const formData = await parseMultipart(request);

    const data = Object.fromEntries(formData);
    data.photo = (data.photo as File).name;
    // @ts-expect-error
    const { id } = await db.customer.create({ data });
    return redirect(`/customers/${id}`);
  } catch (ex) {}
  return new Response(null, { status: 400 });
}
