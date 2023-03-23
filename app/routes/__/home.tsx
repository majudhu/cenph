import AddCustomerButtonDialog from "~/components/add-customer-dialog";
import { authGuard } from "~/utils/session.server";

import type { LoaderArgs } from "@remix-run/node";
import AddPrescriptionButtonDialog from "~/components/add-prescription-dialog";
export default function Home() {
  return (
    <>
      <div className="flex gap-4 py-4 items-center pr-8">
        <AddCustomerButtonDialog />
        <AddPrescriptionButtonDialog />
      </div>
    </>
  );
}

export async function loader({ request }: LoaderArgs) {
  await authGuard(request);

  return null;
}
