import { Link, Outlet, useSubmit } from "@remix-run/react";
import { Button, DarkThemeToggle, Flowbite, Sidebar } from "flowbite-react";

export default function Layout() {
  const submit = useSubmit();

  function logout() {
    submit(null, { method: "delete", action: "/?index" });
  }

  return (
    <Flowbite>
      <Sidebar aria-label="Default sidebar example" className="w-fit flex-none">
        <Sidebar.Items className="h-full flex flex-col justify-between">
          <Sidebar.ItemGroup>
            <Sidebar.Item as={Link} to="/">
              Dashboard
            </Sidebar.Item>
            <Sidebar.Item as={Link} to="/customers">
              Customers
            </Sidebar.Item>
            <Sidebar.Item as={Link} to="/prescriptions">
              Prescriptions
            </Sidebar.Item>
          </Sidebar.ItemGroup>
          <Sidebar.ItemGroup className="mt-auto">
            <Sidebar.Item as={DarkThemeToggle} className="mx-auto" />
            <Sidebar.Item
              as={Button}
              onClick={logout}
              className="mx-auto !p-0.5"
              color="failure"
              size="xs"
              outline
            >
              Logout
            </Sidebar.Item>
          </Sidebar.ItemGroup>
        </Sidebar.Items>
      </Sidebar>
      <main className="flex-1 overflow-y-auto">
        <Outlet />
      </main>
    </Flowbite>
  );
}
