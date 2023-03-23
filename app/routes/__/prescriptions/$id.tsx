import { json, redirect } from "@remix-run/node";
import { Form, useActionData, useLoaderData } from "@remix-run/react";
import { Button, Label, Textarea, TextInput } from "flowbite-react";
import {
  HiHome,
  HiIdentification,
  HiPhone,
  HiPlus,
  HiTrash,
  HiUser,
} from "react-icons/hi2";
import { db } from "~/utils/db.server";
import { authGuard } from "~/utils/session.server";

import type { ActionArgs, LoaderArgs } from "@remix-run/node";
import { Fragment, useEffect, useState } from "react";
import AddPrescriptionButtonDialog from "~/components/add-prescription-dialog";

export async function loader({ request, params }: LoaderArgs) {
  await authGuard(request);

  try {
    const prescription = await db.prescription.findFirstOrThrow({
      where: { id: +params.id! },
      include: { customer: true, items: true },
    });
    return json({ prescription });
  } catch (ex) {}
  throw redirect("/prescriptions");
}

export default function PrescriptionDetails() {
  const { prescription } = useLoaderData<typeof loader>();

  const [deleteIds, setDeleteIds] = useState<number[]>([]);
  const [newItemsCount, setNewItemsCount] = useState(0);

  useEffect(() => {
    setDeleteIds([]);
    setNewItemsCount(0);
  }, [prescription]);

  return (
    <>
      <h2 className="text-xl font-bold mt-4 mb-2 flex justify-between items-center pr-8">
        Customer
        <AddPrescriptionButtonDialog customer={prescription.customer} />
      </h2>
      <div className="flex gap-4 text-sm rounded-xl text-gray-700 bg-gray-100 p-2 font-medium mb-3 mr-8">
        <div className="flex-1">
          <p className="mb-1">
            <HiUser className="inline mr-1 align-[-1px]" />
            {prescription.customer.name}
          </p>
          <p>
            <HiHome className="inline mr-1 align-[-1px]" />
            {prescription.customer.address}
          </p>
        </div>
        <div className="flex-none w-fit">
          <p className="mb-1">
            <HiPhone className="inline mr-1 align-[-1px]" />
            {prescription.customer.phone}
          </p>
          <p>
            <HiIdentification className="inline mr-1 align-[-1px]" />
            {prescription.customer.nid}
          </p>
        </div>
      </div>

      <h1 className="text-xl font-bold mt-4 mb-2">Prescription Information</h1>
      <Form
        id="prescription-form"
        method="patch"
        className="grid md:grid-cols-2 lg:grid-cols-4 gap-x-4 gap-y-3 pr-8"
      >
        <div className="md:col-span-2">
          <Label htmlFor="notes" className="mb-1">
            Notes
          </Label>
          <Textarea id="notes" name="notes" defaultValue={prescription.notes} />
        </div>

        <div>
          <Label htmlFor="nid" className="mb-1">
            Renewal Date.
          </Label>
          <TextInput
            id="renewalDate"
            name="renewalDate"
            type="date"
            defaultValue={prescription.renewalDate.substring(0, 10)}
          />
        </div>

        <h1 className="text-xl font-bold my-4 col-span-full">Items</h1>

        {prescription.items.map((item, i) => {
          const itemMarkedDelete = deleteIds.includes(item.id);
          return (
            <Fragment key={item.id}>
              {itemMarkedDelete || (
                <input type="hidden" name="itemId" value={item.id} />
              )}
              <div
                className={`md:col-span-2 ${
                  itemMarkedDelete ? "opacity-50" : ""
                }`}
              >
                <Label htmlFor={"description" + i}>Item {i + 1}</Label>
                <TextInput
                  id={"description" + i}
                  name={itemMarkedDelete ? undefined : "description"}
                  defaultValue={item.description}
                  disabled={itemMarkedDelete}
                />
              </div>
              <div
                className={`flex gap-4 border-b pb-3 lg:border-b-0 md:col-span-2 items-end ${
                  itemMarkedDelete ? "opacity-50" : ""
                }`}
              >
                <div className="flex-[2]">
                  <Label htmlFor={"expiry" + i}>Expiry</Label>
                  <TextInput
                    id={"expiry" + i}
                    name={itemMarkedDelete ? undefined : "expiry"}
                    type="date"
                    defaultValue={item.expiry.substring(0, 10)}
                    disabled={itemMarkedDelete}
                  />
                </div>
                <div className="flex-1">
                  <Label htmlFor={"quantity" + i}>Quantity</Label>
                  <TextInput
                    id={"quantity" + i}
                    name={itemMarkedDelete ? undefined : "quantity"}
                    type="number"
                    defaultValue={item.quantity}
                    disabled={itemMarkedDelete}
                  />
                </div>
                <div className="flex-1">
                  <Label htmlFor={"rate" + i}>Rate</Label>
                  <TextInput
                    id={"rate" + i}
                    name={itemMarkedDelete ? undefined : "rate"}
                    type="number"
                    defaultValue={item.rate}
                    disabled={itemMarkedDelete}
                  />
                </div>
                {itemMarkedDelete ? (
                  <Button
                    color="success"
                    size="sm"
                    onClick={() =>
                      setDeleteIds(deleteIds.filter((id) => id != item.id))
                    }
                  >
                    <HiPlus />
                  </Button>
                ) : (
                  <Button
                    color="failure"
                    size="sm"
                    onClick={() => setDeleteIds([...deleteIds, item.id])}
                  >
                    <HiTrash />
                  </Button>
                )}
              </div>
            </Fragment>
          );
        })}

        <input type="hidden" name="deleteIds" value={deleteIds.join(",")} />

        {Array.from({ length: newItemsCount }, (_, i) => {
          const id = prescription.items.length + i + 1;
          return (
            <Fragment key={i}>
              <div className="md:col-span-2">
                <Label htmlFor={"description" + id}>Item {id}</Label>
                <TextInput id={"description" + id} name="description" />
              </div>
              <div className="flex gap-4 border-b pb-3 lg:border-b-0 md:col-span-2 items-end">
                <div className="flex-[2]">
                  <Label htmlFor={"expiry" + id}>Expiry</Label>
                  <TextInput id={"expiry" + id} name="expiry" type="date" />
                </div>
                <div className="flex-1">
                  <Label htmlFor={"quantity" + id}>Quantity</Label>
                  <TextInput
                    id={"quantity" + id}
                    name="quantity"
                    type="number"
                  />
                </div>
                <div className="flex-1">
                  <Label htmlFor={"rate" + id}>Rate</Label>
                  <TextInput id={"rate" + id} name="rate" type="number" />
                </div>
                <Button
                  className="flex-none self-end"
                  size="sm"
                  color="failure"
                  disabled={i < newItemsCount - 1}
                  onClick={() => setNewItemsCount(newItemsCount - 1)}
                >
                  <HiTrash />
                </Button>
              </div>
            </Fragment>
          );
        })}
      </Form>

      <div className="flex gap-4 py-4 items-center pr-8">
        <Button outline type="submit" form="prescription-form">
          Save
        </Button>
        <Button color="gray" type="reset" form="prescription-form">
          Reset
        </Button>

        <Button onClick={() => setNewItemsCount(newItemsCount + 1)}>
          Add Item
        </Button>

        <Form className="ml-auto" method="delete">
          <Button outline color="failure" size="xs" type="submit">
            Delete Prescription
          </Button>
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

    const formData = await request.formData();

    await db.prescription.update({
      where: { id },
      data: {
        notes: (formData.get("notes") as string) || undefined,
        renewalDate: formData.get("expiry")
          ? new Date(formData.get("expiry") as string)
          : undefined,
      },
    });

    const itemIds = formData.getAll("itemId") as string[];
    const descriptions = formData.getAll("description") as string[];
    const expiries = formData.getAll("expiry") as string[];
    const quantities = formData.getAll("quantity") as string[];
    const rates = formData.getAll("rate") as string[];

    await db.item.deleteMany({
      where: {
        id: {
          in: (formData.get("deleteIds") as string).split(",").map((id) => +id),
        },
      },
    });

    for (let i = 0; i < descriptions.length; i++) {
      if (itemIds[i]) {
        await db.item.update({
          where: { id: +itemIds[i] },
          data: {
            description: descriptions[i],
            expiry: new Date(expiries[i]),
            quantity: +quantities[i],
            rate: +rates[i],
          },
        });
      } else {
        await db.item.create({
          data: {
            prescriptionId: id,
            description: descriptions[i],
            expiry: new Date(expiries[i]),
            quantity: +quantities[i],
            rate: +rates[i],
          },
        });
      }
    }

    return new Response(null, { status: 204 });
  } catch (ex) {
    console.error(ex);
  }
  return new Response(null, { status: 400 });
}
