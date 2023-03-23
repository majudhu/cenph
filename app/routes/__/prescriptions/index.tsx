import { json, redirect } from "@remix-run/node";
import { useLoaderData, useNavigate } from "@remix-run/react";
import { Table } from "flowbite-react";
import { db } from "~/utils/db.server";
import { authGuard } from "~/utils/session.server";

import type { ActionArgs, LoaderArgs } from "@remix-run/node";
import { useHydrated } from "~/components/use-hydrated";

export async function loader({ request }: LoaderArgs) {
  await authGuard(request);
  const prescriptions = await db.prescription.findMany({
    include: { customer: true },
  });
  return json({ prescriptions });
}

export default function Prescriptions() {
  const navigate = useNavigate();
  const hydrated = useHydrated();
  const { prescriptions } = useLoaderData<typeof loader>();

  return (
    <div className="pt-8 pr-8">
      <Table hoverable>
        <Table.Head>
          <Table.HeadCell>Id</Table.HeadCell>
          <Table.HeadCell>Name</Table.HeadCell>
          <Table.HeadCell>NID</Table.HeadCell>
          <Table.HeadCell>Renewal</Table.HeadCell>
          <Table.HeadCell>Notes</Table.HeadCell>
        </Table.Head>
        <Table.Body className="divide-y">
          {prescriptions.map((prescription) => (
            <Table.Row
              key={prescription.id}
              role="button"
              onClick={() => navigate(prescription.id.toString())}
            >
              <Table.Cell>{prescription.id}</Table.Cell>
              <Table.Cell>{prescription.customer.name}</Table.Cell>
              <Table.Cell>{prescription.customer.id}</Table.Cell>
              <Table.Cell>
                {hydrated &&
                  new Date(prescription.renewalDate).toLocaleDateString()}
              </Table.Cell>
              <Table.Cell>{prescription.notes}</Table.Cell>
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
    const descriptions = formData.getAll("description") as string[];
    const expiries = formData.getAll("expiry") as string[];
    const quantities = formData.getAll("quantity") as string[];
    const rates = formData.getAll("rate") as string[];

    const { id } = await db.prescription.create({
      data: {
        customerId: +formData.get("customerId")!,
        notes: formData.get("notes") as string,
        renewalDate: new Date(formData.get("renewalDate") as string),
      },
    });

    await Promise.all(
      descriptions.map((description, i) =>
        db.item.create({
          data: {
            prescriptionId: id,
            description,
            expiry: expiries[i] ? new Date(expiries[i]) : new Date(),
            quantity: +quantities[i],
            rate: +rates[i],
          },
        })
      )
    );
    return redirect(`/prescriptions/${id}`);
  } catch (ex) {}
  return new Response(null, { status: 400 });
}
