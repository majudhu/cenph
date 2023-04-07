import {
  ArrowPathIcon,
  ArrowTopRightOnSquareIcon,
  HomeIcon,
  IdentificationIcon,
  PhoneIcon,
  UserIcon,
} from "@heroicons/react/20/solid";
import { json, redirect } from "@remix-run/node";
import { Form, Link, useLoaderData, useNavigation } from "@remix-run/react";
import { db } from "~/utils/db.server";
import { authGuard } from "~/utils/session.server";

import type { ActionArgs, LoaderArgs } from "@remix-run/node";
import { parseMultipart, removeFile } from "~/utils/upload.server";

export async function loader({ request, params }: LoaderArgs) {
  await authGuard(request);

  try {
    const prescription = await db.prescription.findFirstOrThrow({
      where: { id: +params.id! },
      include: { customer: true },
    });
    return json({ prescription });
  } catch (ex) {}
  throw redirect("/prescriptions");
}

export default function PrescriptionDetails() {
  const { prescription } = useLoaderData<typeof loader>();
  const { state } = useNavigation();

  return (
    <>
      <h1 className="flex flex-wrap justify-between text-base">Customer</h1>

      <Link
        to={`/customers/${prescription.customerId}`}
        className="flex flex-wrap gap-4 text-sm md:text-base card flex-row bg-base-100 p-2 font-medium mb-3 hover:bg-base-300"
      >
        <div className="flex-1">
          <p className="mb-1">
            <UserIcon className="inline mr-1 align-[-1px] w-4" />
            {prescription.customer.name}
          </p>
          <p>
            <HomeIcon className="inline mr-1 align-[-1px] w-4" />
            {prescription.customer.address}
          </p>
        </div>
        <div className="flex-none w-fit">
          <p className="mb-1">
            <PhoneIcon className="inline mr-1 align-[-1px] w-4" />
            {prescription.customer.phone}
          </p>
          <p>
            <IdentificationIcon className="inline mr-1 align-[-1px] w-4" />
            {prescription.customer.nid}
          </p>
        </div>
        {prescription.customer.photo && (
          <img
            className="flex-none w-auto h-[52px]"
            alt=""
            src={`/uploads/${prescription.customer.photo}`}
          />
        )}
      </Link>

      <Form
        id="prescription-form"
        method="patch"
        className="grid md:grid-cols-2 lg:grid-cols-4 gap-x-4 gap-y-3"
        encType="multipart/form-data"
      >
        <div className="md:col-span-full">
          <label htmlFor="notes" className="mb-1 label">
            Notes
          </label>
          <textarea
            className="textarea w-full"
            rows={8}
            id="notes"
            name="notes"
            defaultValue={prescription.notes}
          />
        </div>
        <div>
          <label className="mb-1 label" htmlFor="prescription">
            Prescription
          </label>
          <input
            key={prescription.prescription}
            id="prescription"
            name="prescription"
            type="file"
            className="input file-input px-0 w-full mb-2"
            accept="image/*,application/pdf"
          />
        </div>

        <div>
          <label htmlFor="nid" className="mb-1 label">
            Renewal Date
          </label>
          <input
            className="input w-full"
            id="renewalDate"
            name="renewalDate"
            type="date"
            defaultValue={prescription.renewalDate.substring(0, 10)}
          />
        </div>

        {prescription.prescription && (
          <object
            className="col-span-full w-full min-h-[500px] object-contain"
            data={`/uploads/${prescription.prescription}`}
          >
            <a
              className="link"
              target="_blank"
              rel="noreferrer"
              href={`/uploads/${prescription.prescription}`}
            >
              View Prescription{" "}
              <ArrowTopRightOnSquareIcon className="w-6 inline" />
            </a>
          </object>
        )}
      </Form>

      <div className="flex gap-4 py-4 items-center mt-8">
        <button
          className="btn btn-primary btn-sm w-28"
          type="submit"
          form="prescription-form"
          disabled={state != "idle"}
        >
          {state != "idle" ? (
            <ArrowPathIcon className="mx-auto animate-spin w-5" />
          ) : (
            "Save"
          )}
        </button>
        <button className="btn btn-sm" type="reset" form="prescription-form">
          Reset
        </button>

        <Form className="ml-auto" method="delete">
          <button className="btn btn-error btn-xs" type="submit">
            Delete
          </button>
        </Form>
      </div>
    </>
  );
}

export async function action({ request, params }: ActionArgs) {
  await authGuard(request);
  try {
    const id = +params.id!;
    if (request.method == "DELETE") {
      await db.prescription.delete({
        where: { id },
      });
      return redirect("/prescriptions");
    }

    const formData = await parseMultipart(request);

    const prescription = formData.get("prescription") as File;

    if (prescription?.name) {
      const oldData = await db.prescription.findFirst({
        where: { id },
        select: { prescription: true },
      });
      if (oldData?.prescription) {
        await removeFile(oldData.prescription);
      }
    }

    await db.prescription.update({
      where: { id },
      data: {
        notes: (formData.get("notes") as string) || undefined,
        renewalDate: formData.get("expiry")
          ? new Date(formData.get("expiry") as string)
          : undefined,
        prescription: prescription?.name ? prescription.name : undefined,
      },
    });

    return new Response(null, { status: 204 });
  } catch (ex) {}
  return new Response(null, { status: 400 });
}
