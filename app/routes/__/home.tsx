import type { LoaderArgs } from "@remix-run/node";
import { Link } from "@remix-run/react";
import { authGuard } from "~/utils/session.server";

export async function loader({ request }: LoaderArgs) {
  await authGuard(request);
  return null;
}

export default function Home() {
  return (
    <>
      <div className="flex gap-8 py-4 items-center p-8 flex-wrap">
        <Link to="/customers" className="btn">
          Customers
        </Link>

        <Link to="/customers/new" className="btn">
          Add Customer
        </Link>

        <Link to="/prescriptions" className="btn">
          Prescriptions
        </Link>
      </div>
    </>
  );
}
