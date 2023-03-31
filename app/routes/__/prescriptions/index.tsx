import { json } from "@remix-run/node";
import {
  Form,
  Link,
  useLoaderData,
  useNavigate,
  useSearchParams,
} from "@remix-run/react";
import { db } from "~/utils/db.server";
import { authGuard } from "~/utils/session.server";

import {
  BarsArrowDownIcon,
  BarsArrowUpIcon,
  IdentificationIcon,
  PhoneIcon,
} from "@heroicons/react/20/solid";
import type { LoaderArgs } from "@remix-run/node";
import { sortBy } from "lodash";

const PER_PAGE = 15;

const SORT_BY: Record<string, string> = {
  id: "id",
  customer: "customerId",
  renewal: "renewalDate",
};

export async function loader({ request }: LoaderArgs) {
  await authGuard(request);

  const { searchParams } = new URL(request.url);
  const page = +(searchParams.get("page") as string) || 1;
  const sortBy = SORT_BY[searchParams.get("sortBy") as string] || "id";
  const sort = searchParams.get("sort") === "asc" ? "asc" : "desc";

  const [prescriptions, count] = await Promise.all([
    db.prescription.findMany({
      include: { customer: true },
      skip: (page - 1) * PER_PAGE,
      orderBy: { [sortBy]: sort },
      take: PER_PAGE,
    }),
    db.prescription.count(),
  ]);
  return json({ prescriptions, count });
}

export default function Prescriptions() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { prescriptions, count } = useLoaderData<typeof loader>();

  const sortDesc = searchParams.get("sort") === "desc";
  const page = +(searchParams.get("page") as string) || 1;

  return (
    <>
      <h1>Prescriptions</h1>

      <Form className="flex items-center gap-4 mb-8 flex-wrap">
        <label className="label" htmlFor="sortBy">
          Sort:
        </label>
        <select
          id="sortBy"
          name="sortBy"
          placeholder="sort..."
          className="input input-bordered w-32"
          defaultValue={searchParams.get("sortBy") || "id"}
          onChange={(e) =>
            setSearchParams({
              sortBy: e.target.value,
              sort: sortDesc ? "desc" : "asc",
            })
          }
        >
          <option value="id">Id</option>
          <option value="customer">Customer</option>
          <option value="renewal">Renewal</option>
        </select>
        <button
          type="submit"
          className="w-12 p-2 btn"
          name="sort"
          value={sortDesc ? "asc" : "desc"}
        >
          {sortDesc ? <BarsArrowDownIcon /> : <BarsArrowUpIcon />}
        </button>
        <span className="ml-auto text-sm font-medium">
          Total: {count} prescriptions
        </span>
      </Form>

      <table className="table table-auto table-compact sm:table-normal">
        <thead>
          <tr>
            <th>Id</th>
            <th>Customer Name</th>
            <th className="hidden sm:table-cell">NID</th>
            <th className="hidden sm:table-cell">Phone</th>
            <th>Renewal</th>
            <th className="hidden md:table-cell">Notes</th>
          </tr>
        </thead>
        <tbody>
          {prescriptions.map((prescription) => (
            <tr
              key={prescription.id}
              role="button"
              className="hover"
              onClick={() => navigate(prescription.id.toString())}
            >
              <td>{prescription.id}</td>
              <td className="whitespace-break-spaces">
                {prescription.customer.name}
                <span className="sm:hidden flex items-center text-sm">
                  <IdentificationIcon className="mr-1 w-4 h-4" />
                  {prescription.customer.nid}
                  <PhoneIcon className="ml-4 mr-1 w-4 h-4" />
                  {prescription.customer.phone}
                </span>
              </td>
              <td className="hidden sm:table-cell">
                {prescription.customer.nid}
              </td>
              <td className="hidden sm:table-cell">
                {prescription.customer.phone}
              </td>
              <td>
                {new Date(prescription.renewalDate).toLocaleDateString("en-uk")}
              </td>
              <td className="hidden md:table-cell md:text-xs xl:text-sm whitespace-break-spaces">
                {prescription.notes.substring(0, 50)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {count > PER_PAGE && (
        <div
          className="btn-group mt-8"
          onClick={() => document.querySelector("table")?.scrollIntoView()}
        >
          {Array.from({ length: Math.ceil(count / PER_PAGE) }, (_, i) => (
            <Link
              key={i}
              className={`btn ${i + 1 == page ? "btn-active" : ""}`}
              to={`?page=${i + 1}&sortBy=${
                searchParams.get("sortBy") ?? ""
              }&sort=${sortDesc ? "desc" : "asc"}`}
            >
              {i + 1}
            </Link>
          ))}
        </div>
      )}
    </>
  );
}
