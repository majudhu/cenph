import type { LoaderArgs } from "@remix-run/node";
import { Link } from "@remix-run/react";
import { authGuard } from "~/utils/session.server";

export async function loader({ request }: LoaderArgs) {
  await authGuard(request);
  return null;
}

export default function Settings() {
  return (
    <>
      <div className="flex gap-8 py-4 items-center p-8 flex-wrap">
        <Link to="disk" className="btn">
          Disk Usage
        </Link>

        <Link to="password" className="btn">
          Change password
        </Link>
      </div>
    </>
  );
}
