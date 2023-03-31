import {
  ArrowPathIcon,
  HomeIcon,
  IdentificationIcon,
  PhoneIcon,
  UserIcon,
} from "@heroicons/react/20/solid";
import type { ActionArgs, LoaderArgs } from "@remix-run/node";
import { json, redirect } from "@remix-run/node";
import {
  Form,
  useFetcher,
  useLoaderData,
  useNavigation,
} from "@remix-run/react";
import { useState } from "react";
import type { loader as customersLoader } from "~/routes/__/customers";
import { db } from "~/utils/db.server";
import { authGuard } from "~/utils/session.server";

export async function loader({ request, params }: LoaderArgs) {
  await authGuard(request);
  const customer = await db.customer.findFirst();
  return json({ customer });
}

export default function NewPrescription() {
  const { state } = useNavigation();
  const { customer } = useLoaderData<typeof loader>();
  const searchCustomers = useFetcher<typeof customersLoader>();

  const [selectedCustomer, setSelectedCustomer] = useState(customer);

  const [renewalDate, setrenewalDate] = useState("");

  const dateFromMonths = [1, 2, 3, 4, 5, 6].map((months) =>
    new Date(Date.now() + months * 30 * 24 * 60 * 60 * 1000)
      .toISOString()
      .substring(0, 10)
  );

  return (
    <>
      <h1>Add Prescription</h1>
      <Form method="post">
        <div className="flex justify-between items-center pb-3">
          <h2 className="mb-1 text-sm font-medium text-gray-900 dark:text-gray-300">
            Customer
          </h2>
          {/* <Dropdown label="Select customer" className="w-full" size="sm">
              <Dropdown.Header>
                <input className="input"
                  placeholder="Search customer"
                  className="mt-1 mb-3"
                  value={searchKeyword}
                  onChange={(e) => setSearchKeyword(e.target.value)}
                />
              </Dropdown.Header>
              {searchCustomers.data?.customers.map((customer) => (
                <Dropdown.Item
                  key={customer.id}
                  onClick={() => setSelectedCustomer(customer)}
                >
                  {customer.name}
                </Dropdown.Item>
              ))}
            </Dropdown> */}
        </div>
        {selectedCustomer && (
          <div className="flex gap-4 text-sm md:text-base card flex-row bg-base-100 p-2 font-medium mb-3 hover:bg-base-300">
            <div className="flex-1">
              <p className="mb-1">
                <UserIcon className="inline mr-1 align-[-1px] w-4" />
                {selectedCustomer.name}
              </p>
              <p>
                <HomeIcon className="inline mr-1 align-[-1px] w-4" />
                {selectedCustomer.address}
              </p>
            </div>
            <div className="flex-none w-fit">
              <p className="mb-1">
                <PhoneIcon className="inline mr-1 align-[-1px] w-4" />
                {selectedCustomer.phone}
              </p>
              <p>
                <IdentificationIcon className="inline mr-1 align-[-1px] w-4" />
                {selectedCustomer.nid}
              </p>
            </div>
          </div>
        )}

        <label className="label" htmlFor="notes">
          Notes
        </label>
        <textarea id="notes" name="notes" className="mt-1 mb-3 textarea" />

        <label className="label" htmlFor="renewalDate">
          Renewal Date
        </label>
        <input
          id="renewalDate"
          name="renewalDate"
          type="date"
          className="mt-1 mb-3 input"
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
            name="customerId"
            className="btn btn-primary"
            value={selectedCustomer?.id}
            disabled={!selectedCustomer || !renewalDate || state != "idle"}
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

export async function action({ request }: ActionArgs) {
  await authGuard(request);
  try {
    const formData = await request.formData();
    const { id } = await db.prescription.create({
      data: {
        customerId: +formData.get("customerId")!,
        notes: formData.get("notes") as string,
        renewalDate: new Date(formData.get("renewalDate") as string),
      },
    });
    return redirect(`/prescriptions/${id}`);
  } catch (ex) {}
  return new Response(null, { status: 400 });
}
