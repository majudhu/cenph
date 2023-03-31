import { json, redirect } from "@remix-run/node";
import {
  Form,
  Link,
  useLoaderData,
  useNavigate,
  useNavigation,
} from "@remix-run/react";

import { db } from "~/utils/db.server";
import { authGuard } from "~/utils/session.server";

import { ArrowPathIcon } from "@heroicons/react/20/solid";
import type { Customer } from "@prisma/client";
import type { ActionArgs, LoaderArgs } from "@remix-run/node";

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

export default function CustomerDetails() {
  const { customer } = useLoaderData<typeof loader>();
  const navigate = useNavigate();
  const { state } = useNavigation();

  return (
    <>
      <h1 className="flex flex-wrap gap-y-4">
        Customer
        <Link
          to={`/prescriptions/new?customer=${customer.id}`}
          className="ml-auto btn btn-primary"
        >
          Add Prescription
        </Link>
      </h1>

      <Form
        id="customer-form"
        method="patch"
        className="grid md:grid-cols-4 gap-x-8 gap-y-3"
      >
        <div className="md:col-span-2">
          <label htmlFor="name" className="mb-1 label">
            Name
          </label>
          <input
            className="input w-full"
            id="name"
            name="name"
            type="text"
            defaultValue={customer.name}
          />
        </div>

        <div>
          <label htmlFor="nid" className="mb-1 label">
            ID Card No.
          </label>
          <input
            className="input w-full"
            id="nid"
            name="nid"
            type="text"
            defaultValue={customer.nid}
          />
        </div>

        <div>
          <label htmlFor="phone" className="mb-1 label">
            Phone
          </label>
          <input
            className="input w-full"
            id="phone"
            name="phone"
            type="text"
            defaultValue={customer.phone}
          />
        </div>

        <div className="md:col-span-2">
          <label htmlFor="address" className="mb-1 label">
            Address
          </label>
          <input
            className="input w-full"
            id="address"
            name="address"
            type="text"
            defaultValue={customer.address}
          />
        </div>

        <div className="md:col-span-2">
          <label htmlFor="photo" className="mb-1 label">
            Photo
          </label>
          <input
            className="input w-full"
            id="photo"
            name="photo"
            type="text"
            defaultValue={customer.photo}
          />
        </div>

        <div className="col-span-full">
          <label htmlFor="notes" className="mb-1 label">
            Notes
          </label>
          <textarea
            rows={8}
            className="textarea w-full"
            id="notes"
            name="notes"
          />
        </div>
      </Form>

      <div className="flex gap-4 py-4 items-center mt-8">
        <button
          className="btn btn-sm btn-primary w-28"
          type="submit"
          form="customer-form"
          disabled={state != "idle"}
        >
          {state != "idle" ? (
            <ArrowPathIcon className="mx-auto animate-spin w-5" />
          ) : (
            "Save"
          )}
        </button>
        <button className="btn btn-sm" type="reset" form="customer-form">
          Reset
        </button>
        {customer.prescriptions.length === 0 && (
          <Form className="ml-auto" method="delete">
            <button
              className="btn btn-error btn-xs"
              type="submit"
              formMethod="delete"
            >
              Delete
            </button>
          </Form>
        )}
      </div>

      <h2 className="mt-8">Prescriptions</h2>

      <table className="table table-auto table-compact sm:table-normal">
        <thead>
          <tr>
            <th>Id</th>
            <th>Renewal</th>
            <th>Notes</th>
          </tr>
        </thead>
        <tbody>
          {customer.prescriptions.map((prescription) => (
            <tr
              key={prescription.id}
              role="button"
              className="hover"
              onClick={() => navigate(`/prescriptions/${prescription.id}`)}
            >
              <td>{prescription.id}</td>
              <td>
                {new Date(prescription.renewalDate).toLocaleDateString("en-uk")}
              </td>
              <td className="md:text-xs xl:text-sm whitespace-break-spaces">
                {prescription.notes.substring(0, 50)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </>
  );
}

export async function action({ request, params }: ActionArgs) {
  await authGuard(request);
  try {
    if (request.method == "DELETE") {
      await db.customer.delete({
        where: { id: +params.id! },
      });
      return redirect("/customers");
    }

    const formData = await request.formData();

    await db.customer.update({
      where: { id: +params.id! },
      data: Object.fromEntries(formData) as unknown as Customer,
    });

    return new Response(null, { status: 204 });
  } catch (ex) {}
  return new Response(null, { status: 400 });
}
