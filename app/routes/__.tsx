import { Bars3Icon } from "@heroicons/react/24/solid";
import type { NavLinkProps } from "@remix-run/react";
import { Form, NavLink, Outlet, useNavigation } from "@remix-run/react";
import { useEffect, useState } from "react";

export default function Layout() {
  const { state } = useNavigation();

  const [showDrawer, setShowDrawer] = useState(false);

  useEffect(() => {
    if (state == "loading") {
      setShowDrawer(false);
    }
  }, [state]);

  return (
    <>
      <div className="drawer drawer-mobile">
        <input
          id="navbar-drawer"
          type="checkbox"
          className="drawer-toggle"
          checked={showDrawer}
          onChange={(e) => setShowDrawer(e.target.checked)}
        />
        <main className="drawer-content flex flex-col bg-base-200 px-4 sm:px-8 pt-2.5 pb-16 lg:pt-4 relative">
          <label
            htmlFor="navbar-drawer"
            className="btn btn-ghost drawer-button lg:hidden self-start p-2 absolute top-0 left-0"
          >
            <Bars3Icon width={30} />
          </label>
          <Outlet />
        </main>
        <nav className="drawer-side">
          <label htmlFor="navbar-drawer" className="drawer-overlay" />
          <ul className="menu px-4 py-8 w-fit bg-base-100 text-base-content gap-8">
            <li>
              <NavLink to="/home" className={navLinkClass}>
                Dashboard
              </NavLink>
            </li>
            <li>
              <NavLink to="/customers" className={navLinkClass}>
                Customers
              </NavLink>
            </li>
            <li>
              <NavLink to="/prescriptions" className={navLinkClass}>
                Prescriptions
              </NavLink>
            </li>
            <li>
              <NavLink to="/settings" className={navLinkClass}>
                Settings
              </NavLink>
            </li>

            <li className="mt-auto disabled">
              <Form action="/?index">
                <button
                  formMethod="delete"
                  type="submit"
                  className="mx-auto btn btn-outline btn-error btn-xs"
                >
                  Logout
                </button>
              </Form>
            </li>
          </ul>
        </nav>
      </div>
    </>
  );
}

const navLinkClass: NavLinkProps["className"] = ({ isActive }) =>
  `btn ${isActive ? "btn-active" : ""}`;
