import type { LoaderArgs } from "@remix-run/node";
import { Link } from "@remix-run/react";
import { authGuard } from "~/utils/session.server";

export default function Home() {
  return (
    <>
      <div className="flex gap-8 py-4 items-center p-8 flex-wrap">
        <Link to="/customers/new" className="btn">
          Add Customer
        </Link>

        <Link to="/prescriptions/new" className="btn">
          Add Prescription
        </Link>
      </div>
    </>
  );
}

export async function loader({ request }: LoaderArgs) {
  await authGuard(request);
  return null;
}
