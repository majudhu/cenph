import { Form, useActionData, useFetcher, useParams } from "@remix-run/react";
import {
  Button,
  Dropdown,
  Label,
  Modal,
  Textarea,
  TextInput,
} from "flowbite-react";
import { Fragment, useEffect, useState } from "react";
import { HiHome, HiIdentification, HiPhone, HiUser } from "react-icons/hi2";

import { useHydrated } from "./use-hydrated";

import type { Customer } from "@prisma/client";
import type { loader as customersLoader } from "~/routes/__/customers";

export default function AddPrescriptionButtonDialog({
  customer,
}: {
  customer?: Customer;
}) {
  const hydrated = useHydrated();
  const searchCustomers = useFetcher<typeof customersLoader>();
  const params = useParams();
  const [show, setShow] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState(customer);
  const [searchKeyword, setSearchKeyword] = useState("");
  const [renewalDate, setrenewalDate] = useState("");
  const [itemsCount, setItemsCount] = useState(0);

  const dateFromMonths = [1, 2, 3, 4, 5, 6].map((months) =>
    new Date(Date.now() + months * 30 * 24 * 60 * 60 * 1000)
      .toISOString()
      .substring(0, 10)
  );

  function showDialog() {
    setItemsCount(0);
    setSelectedCustomer(customer);
    if (searchCustomers.type === "init") {
      searchCustomers.load("/customers");
    }
    setShow(true);
  }

  useEffect(() => {
    setItemsCount(0);
    setShow(false);
  }, [params.id]);

  return (
    <>
      <Button onClick={showDialog}>Add Prescription</Button>
      {hydrated && (
        <Modal show={show} onClose={() => setShow(false)}>
          <Form method="post" action="/prescriptions">
            <Modal.Header>Add a prescription</Modal.Header>

            <Modal.Body>
              <div className="flex justify-between items-center pb-3">
                <h2 className="mb-1 text-sm font-medium text-gray-900 dark:text-gray-300">
                  Customer
                </h2>
                <Dropdown label="Select customer" className="w-full" size="sm">
                  <Dropdown.Header>
                    <TextInput
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
                </Dropdown>
              </div>
              <div className="flex gap-4 text-sm rounded-xl text-gray-700 bg-gray-100 p-2 font-medium mb-3">
                <div className="flex-1">
                  <p className="mb-1">
                    <HiUser className="inline mr-1 align-[-1px]" />
                    {selectedCustomer?.name}
                  </p>
                  <p>
                    <HiHome className="inline mr-1 align-[-1px]" />
                    {selectedCustomer?.address}
                  </p>
                </div>
                <div className="flex-none w-fit">
                  <p className="mb-1">
                    <HiPhone className="inline mr-1 align-[-1px]" />
                    {selectedCustomer?.phone}
                  </p>
                  <p>
                    <HiIdentification className="inline mr-1 align-[-1px]" />
                    {selectedCustomer?.nid}
                  </p>
                </div>
              </div>
              <Label htmlFor="notes">Notes</Label>
              <Textarea id="notes" name="notes" className="mt-1 mb-3" />

              <Label htmlFor="renewalDate">Renewal Date</Label>
              <TextInput
                id="renewalDate"
                name="renewalDate"
                type="date"
                className="mt-1 mb-3"
                value={renewalDate}
                onChange={(e) => setrenewalDate(e.target.value)}
              />
              <div className="flex gap-2 flex-wrap items-center mb-4">
                Renew after months:
                {dateFromMonths.map((date, i) => (
                  <Button
                    key={date}
                    size="sm"
                    pill
                    color="gray"
                    outline={renewalDate == date ? true : false}
                    onClick={() => setrenewalDate(date)}
                  >
                    {i + 1}
                  </Button>
                ))}
              </div>
              <hr className="pb-3" />
              <div className="max-h-[30vh] overflow-y-scroll">
                {Array.from({ length: itemsCount }, (_, i) => (
                  <Fragment key={i}>
                    <Label htmlFor={"description" + i}>Item {i + 1}</Label>
                    <TextInput id={"description" + i} name="description" />
                    <div className="flex mt-1 pb-3 gap-4 border-b">
                      <div className="flex-[2]">
                        <Label htmlFor={"expiry" + i}>Expiry</Label>
                        <TextInput
                          id={"expiry" + i}
                          name="expiry"
                          type="date"
                        />
                      </div>
                      <div className="flex-1">
                        <Label htmlFor={"quantity" + i}>Quantity</Label>
                        <TextInput
                          id={"quantity" + i}
                          name="quantity"
                          type="number"
                        />
                      </div>
                      <div className="flex-1">
                        <Label htmlFor={"rate" + i}>Rate</Label>
                        <TextInput id={"rate" + i} name="rate" type="number" />
                      </div>
                    </div>
                  </Fragment>
                ))}
              </div>
            </Modal.Body>

            <Modal.Footer>
              <Button onClick={() => setItemsCount(itemsCount + 1)}>
                Add Item
              </Button>
              <Button
                className="flex-none self-end"
                color="failure"
                disabled={itemsCount < 1}
                onClick={() => setItemsCount(itemsCount - 1)}
              >
                Remove Item
              </Button>
              <hr className="flex-1 border-t-0" />
              <Button
                disabled={!selectedCustomer || !renewalDate}
                type="submit"
                name="customerId"
                value={selectedCustomer?.id}
              >
                Save prescription
              </Button>
              <Button color="gray" onClick={() => setShow(false)}>
                Cancel
              </Button>
            </Modal.Footer>
          </Form>
        </Modal>
      )}
    </>
  );
}
