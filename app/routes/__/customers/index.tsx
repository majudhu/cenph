import { IdentificationIcon, PhoneIcon } from "@heroicons/react/20/solid";
import type { Prisma } from "@prisma/client";
import type { LoaderArgs } from "@remix-run/node";
import { json } from "@remix-run/node";
import {
  Form,
  Link,
  useLoaderData,
  useNavigate,
  useSearchParams,
} from "@remix-run/react";
import { debounce } from "lodash";
import { useMemo } from "react";
import { db } from "~/utils/db.server";
import { authGuard } from "~/utils/session.server";

const PER_PAGE = 15;

export async function loader({ request }: LoaderArgs) {
  await authGuard(request);

  const { searchParams } = new URL(request.url);
  const page = +(searchParams.get("page") as string) || 1;
  const search = searchParams.get("search");

  const where: Prisma.CustomerWhereInput | undefined = search
    ? {
        OR: [
          { name: { contains: search } },
          { nid: { contains: search } },
          { phone: { contains: search } },
        ],
      }
    : undefined;

  const [customers, count] = await Promise.all([
    db.customer.findMany({
      where,
      skip: (page - 1) * PER_PAGE,
      take: PER_PAGE,
    }),
    db.customer.count({ where }),
  ]);
  return json({ customers, count, page });
}

export default function Customers() {
  const navigate = useNavigate();
  const [searchparams, setSearchParams] = useSearchParams();
  const { customers, count, page } = useLoaderData<typeof loader>();

  const debounceSubmit = useMemo(
    () =>
      debounce(
        (e: React.ChangeEvent<HTMLInputElement>) =>
          setSearchParams({ search: e.target.value }),
        500
      ),
    [setSearchParams]
  );

  const searched = searchparams.get("search");

  return (
    <>
      <h1 className="flex flex-wrap justify-between">
        Customers
        <Link to="new" className="btn btn-primary">
          Add Customer
        </Link>
      </h1>

      <Form className="flex items-center gap-4 flex-wrap justify-between mb-8">
        <input
          key={searched}
          autoFocus
          name="search"
          placeholder="Search..."
          type="search"
          className="input input-bordered w-full sm:w-1/2 max-w-md"
          defaultValue={searched || ""}
          onChange={debounceSubmit}
        />
        <span className="text-sm font-medium">Total: {count} customers</span>
      </Form>

      <table className="table table-auto table-compact md:table-normal">
        <thead>
          <tr>
            <th>Id</th>
            <th>Name</th>
            <th className="hidden sm:table-cell">NID</th>
            <th className="hidden sm:table-cell">Phone</th>
            <th className="hidden md:table-cell">Address</th>
          </tr>
        </thead>
        <tbody>
          {customers.map((customer) => (
            <tr
              key={customer.id}
              className="hover"
              role="button"
              onClick={() => navigate(customer.id.toString())}
            >
              <td>{customer.id}</td>
              <td className="whitespace-break-spaces">
                {customer.name}
                <span className="sm:hidden flex items-center">
                  <IdentificationIcon className="mr-1 w-4 h-4" />
                  {customer.nid}
                  <PhoneIcon className="ml-4 mr-1 w-4 h-4" />
                  {customer.phone}
                </span>
                <span className="text-xs md:hidden">{customer.address}</span>
              </td>
              <td className="hidden sm:table-cell">{customer.nid}</td>
              <td className="hidden sm:table-cell">{customer.phone}</td>
              <td className="hidden md:table-cell md:text-xs xl:text-sm whitespace-break-spaces">
                {customer.address}
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
              to={`?page=${i + 1}&search=${searched || ""}`}
            >
              {i + 1}
            </Link>
          ))}
        </div>
      )}
    </>
  );
}
