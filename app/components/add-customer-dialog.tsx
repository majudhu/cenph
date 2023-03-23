import { Form } from "@remix-run/react";
import { Button, Label, Modal, Textarea, TextInput } from "flowbite-react";
import { useState } from "react";

import { useHydrated } from "./use-hydrated";

export default function AddCustomerButtonDialog() {
  const hydrated = useHydrated();
  const [show, setShow] = useState(false);

  return (
    <>
      <Button onClick={() => setShow(true)}>Add Customer</Button>
      {hydrated && (
        <Modal show={show} onClose={() => setShow(false)}>
          <Form method="post" action="/customers">
            <Modal.Header>Add a customer</Modal.Header>

            <Modal.Body>
              <Label htmlFor="name">Name</Label>
              <TextInput
                id="name"
                name="name"
                type="text"
                className="mt-1 mb-3"
              />

              <Label htmlFor="nid">ID Card No.</Label>
              <TextInput
                id="nid"
                name="nid"
                type="text"
                className="mt-1 mb-3"
              />

              <Label htmlFor="phone">Phone</Label>
              <TextInput
                id="phone"
                name="phone"
                type="text"
                className="mt-1 mb-3"
              />

              <Label htmlFor="address">Address</Label>
              <TextInput
                id="address"
                name="address"
                type="text"
                className="mt-1 mb-3"
              />

              <Label htmlFor="photo">Photo</Label>
              <TextInput
                id="photo"
                name="photo"
                type="text"
                className="mt-1 mb-3"
              />

              <Label htmlFor="notes">Notes</Label>
              <Textarea id="notes" name="notes" />
            </Modal.Body>

            <Modal.Footer>
              <Button type="submit">Save</Button>
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
