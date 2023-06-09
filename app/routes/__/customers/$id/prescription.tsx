import {
  ArrowPathIcon,
  HomeIcon,
  IdentificationIcon,
  PhoneIcon,
  UserIcon,
} from "@heroicons/react/20/solid";
import type { ActionArgs, LoaderArgs } from "@remix-run/node";
import { json, redirect } from "@remix-run/node";
import { Form, Link, useLoaderData, useNavigation } from "@remix-run/react";
import { useState } from "react";
import { db } from "~/utils/db.server";
import { authGuard } from "~/utils/session.server";
import { parseMultipart } from "~/utils/upload.server";

export async function loader({ request, params }: LoaderArgs) {
  await authGuard(request);

  try {
    const customer = await db.customer.findFirstOrThrow({
      where: { id: +params.id! },
      include: { prescriptions: true },
    });
    return json({ customer });
  } catch (ex) {}
  throw redirect("/customers");
}

export default function NewPrescription() {
  const { state } = useNavigation();
  const { customer } = useLoaderData<typeof loader>();

  const [renewalDate, setrenewalDate] = useState("");

  const dateFromMonths = [1, 2, 3, 4, 5, 6].map((months) =>
    new Date(Date.now() + months * 30 * 24 * 60 * 60 * 1000)
      .toISOString()
      .substring(0, 10)
  );

  return (
    <>
      <h1>Add Prescription</h1>
      <Form method="post" encType="multipart/form-data">
        <div className="flex justify-between items-center pb-3">
          <h2 className="mb-1 text-sm font-medium text-gray-900 dark:text-gray-300">
            Customer
          </h2>
        </div>

        <Link
          to="./.."
          className="flex flex-wrap gap-4 text-sm md:text-base card flex-row bg-base-100 p-2 font-medium mb-3 hover:bg-base-300"
        >
          <div className="flex-1">
            <p className="mb-1">
              <UserIcon className="inline mr-1 align-[-1px] w-4" />
              {customer.name}
            </p>
            <p>
              <HomeIcon className="inline mr-1 align-[-1px] w-4" />
              {customer.address}
            </p>
          </div>
          <div className="flex-none w-fit">
            <p className="mb-1">
              <PhoneIcon className="inline mr-1 align-[-1px] w-4" />
              {customer.phone}
            </p>
            <p>
              <IdentificationIcon className="inline mr-1 align-[-1px] w-4" />
              {customer.nid}
            </p>
          </div>
          {customer.photo && (
            <img
              className="flex-none w-auto h-[52px]"
              alt=""
              src={`/uploads/${customer.photo}`}
            />
          )}
        </Link>

        <label className="label" htmlFor="notes">
          Notes
        </label>
        <textarea
          id="notes"
          name="notes"
          rows={8}
          className="mt-1 mb-3 textarea textarea-bordered w-full"
        />

        <label className="label" htmlFor="prescription">
          Prescription
        </label>
        <input
          id="prescription"
          name="prescription"
          type="file"
          className="input file-input input-bordered px-0 w-full mb-2"
          accept="image/*,application/pdf"
        />

        <label className="label" htmlFor="renewalDate">
          Renewal Date
        </label>
        <input
          id="renewalDate"
          name="renewalDate"
          type="date"
          className="mt-1 mb-3 input input-bordered"
          value={renewalDate}
          onChange={(e) => setrenewalDate(e.target.value)}
        />
        <div className="flex gap-2 flex-wrap items-center mb-4">
          Renew after months:
          {dateFromMonths.map((date, i) => (
            <button
              type="button"
              key={date}
              className={`btn btn-sm btn-accent btn-outline ${
                renewalDate == date ? "btn-outline" : ""
              }`}
              onClick={() => setrenewalDate(date)}
            >
              {i + 1}
            </button>
          ))}
        </div>

        <div className="flex gap-4 py-4 items-center mt-8">
          <button
            type="submit"
            className="btn btn-primary w-64"
            disabled={!renewalDate || state != "idle"}
          >
            {state != "idle" ? (
              <ArrowPathIcon className="mx-auto animate-spin w-5" />
            ) : (
              "Save prescription"
            )}
          </button>
          <button className="btn">Cancel</button>
        </div>
      </Form>
    </>
  );
}

export async function action({ request, params }: ActionArgs) {
  await authGuard(request);
  try {
    const formData = await parseMultipart(request);

    const prescription = formData.get("prescription") as File;

    const { id } = await db.prescription.create({
      data: {
        customerId: +params.id!,
        notes: formData.get("notes") as string,
        renewalDate: new Date(formData.get("renewalDate") as string),
        prescription: prescription?.name ? prescription.name : undefined,
      },
    });
    return redirect(`/prescriptions/${id}`);
  } catch (ex) {}
  return new Response(null, { status: 400 });
}
