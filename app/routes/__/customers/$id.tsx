import { json, redirect } from "@remix-run/node";
import { Form, useLoaderData, useNavigate } from "@remix-run/react";
import { Button, Label, Table, Textarea, TextInput } from "flowbite-react";
import AddPrescriptionButtonDialog from "~/components/add-prescription-dialog";
import { db } from "~/utils/db.server";
import { authGuard } from "~/utils/session.server";

import type { Customer } from "@prisma/client";
import type { ActionArgs, LoaderArgs } from "@remix-run/node";
import { useHydrated } from "~/components/use-hydrated";

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
  const hydrated = useHydrated();

  return (
    <>
      <h1 className="text-xl font-bold my-4">Customer Information</h1>
      <Form
        id="customer-form"
        method="patch"
        className="grid md:grid-cols-2 lg:grid-cols-4 gap-x-4 gap-y-3 pr-8"
      >
        <div className="md:col-span-2">
          <Label htmlFor="name" className="mb-1">
            Name
          </Label>
          <TextInput
            id="name"
            name="name"
            type="text"
            defaultValue={customer.name}
          />
        </div>

        <div>
          <Label htmlFor="nid" className="mb-1">
            ID Card No.
          </Label>
          <TextInput
            id="nid"
            name="nid"
            type="text"
            defaultValue={customer.nid}
          />
        </div>

        <div>
          <Label htmlFor="phone" className="mb-1">
            Phone
          </Label>
          <TextInput
            id="phone"
            name="phone"
            type="text"
            defaultValue={customer.phone}
          />
        </div>

        <div className="md:col-span-2">
          <Label htmlFor="address" className="mb-1">
            Address
          </Label>
          <TextInput
            id="address"
            name="address"
            type="text"
            defaultValue={customer.address}
          />
        </div>

        <div className="md:col-span-2">
          <Label htmlFor="photo" className="mb-1">
            Photo
          </Label>
          <TextInput
            id="photo"
            name="photo"
            type="text"
            defaultValue={customer.photo}
          />
        </div>

        <div className="md:col-span-2">
          <Label htmlFor="notes" className="mb-1">
            Notes
          </Label>
          <Textarea id="notes" name="notes" />
        </div>
      </Form>

      <div className="flex gap-4 py-4 items-center pr-8">
        <Button outline type="submit" form="customer-form">
          Save
        </Button>
        <Button color="gray" type="reset" form="customer-form">
          Reset
        </Button>
        <Form className="ml-auto" method="delete">
          <Button outline color="failure" size="xs" type="submit">
            Delete
          </Button>
        </Form>
      </div>

      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold my-4">Prescriptions</h1>
        <AddPrescriptionButtonDialog customer={customer} />
      </div>

      <div className="pt-8 pr-8">
        <Table hoverable>
          <Table.Head>
            <Table.HeadCell>Id</Table.HeadCell>
            <Table.HeadCell>Renewal</Table.HeadCell>
            <Table.HeadCell>Notes</Table.HeadCell>
          </Table.Head>
          <Table.Body className="divide-y">
            {customer.prescriptions.map((prescription) => (
              <Table.Row
                key={prescription.id}
                role="button"
                onClick={() => navigate(`/prescriptions/${prescription.id}`)}
              >
                <Table.Cell>{prescription.id}</Table.Cell>
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
    </>
  );
}

export async function action({ request, params }: ActionArgs) {
  await authGuard(request);
  try {
    if (request.method == "DELETE") {
      const res = await db.customer.delete({
        where: { id: +params.id! },
      });
      console.log(res);
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
