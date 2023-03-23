import { json, redirect } from "@remix-run/node";
import { useLoaderData, useNavigate } from "@remix-run/react";
import { Table } from "flowbite-react";
import AddCustomerButtonDialog from "~/components/add-customer-dialog";
import { db } from "~/utils/db.server";
import { authGuard } from "~/utils/session.server";

import type { Customer } from "@prisma/client";
import type { ActionArgs } from "@remix-run/node";

export async function loader({ request }: ActionArgs) {
  await authGuard(request);
  const customers = await db.customer.findMany({});
  return json({ customers });
}

export default function Customers() {
  const navigate = useNavigate();
  const { customers } = useLoaderData<typeof loader>();

  return (
    <div>
      <div className="flex gap-4 py-4 items-center pr-8">
        <AddCustomerButtonDialog />
      </div>

      <Table hoverable>
        <Table.Head>
          <Table.HeadCell>Id</Table.HeadCell>
          <Table.HeadCell>Name</Table.HeadCell>
          <Table.HeadCell>NID</Table.HeadCell>
          <Table.HeadCell>Phone</Table.HeadCell>
          <Table.HeadCell>Address</Table.HeadCell>
        </Table.Head>
        <Table.Body className="divide-y">
          {customers.map((customer) => (
            <Table.Row
              key={customer.id}
              role="button"
              onClick={() => navigate(customer.id.toString())}
            >
              <Table.Cell>{customer.id}</Table.Cell>
              <Table.Cell>{customer.name}</Table.Cell>
              <Table.Cell>{customer.nid}</Table.Cell>
              <Table.Cell>{customer.phone}</Table.Cell>
              <Table.Cell>{customer.address}</Table.Cell>
            </Table.Row>
          ))}
        </Table.Body>
      </Table>
    </div>
  );
}

export async function action({ request }: ActionArgs) {
  await authGuard(request);
  try {
    const formData = await request.formData();

    const { id } = await db.customer.create({
      data: Object.fromEntries(formData) as unknown as Customer,
    });
    return redirect(`/customers/${id}`);
  } catch (ex) {}
  return new Response(null, { status: 400 });
}
