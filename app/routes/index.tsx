import { redirect } from "@remix-run/node";
import { Form, useActionData, useNavigation } from "@remix-run/react";
import { Button, Label, Spinner, TextInput } from "flowbite-react";
import { verify } from "~/utils/argon2.server";
import { db } from "~/utils/db.server";
import { authGuard, createUserSession, logout } from "~/utils/session.server";

import type { ActionArgs, LoaderArgs } from "@remix-run/node";

export async function loader({ request }: LoaderArgs) {
  try {
    await authGuard(request);
    return redirect("/home");
  } catch (ex) {}
  return null;
}

export default function Index() {
  const { state } = useNavigation();
  const actionData = useActionData<typeof action>();

  return (
    <Form method="post" className="m-auto text-center p-4">
      <Label htmlFor="username" value="Username" className="my-2" />
      <TextInput id="username" name="username" required className="mt-2 mb-6" />
      <Label htmlFor="password" value="Password" className="my-2" />
      <TextInput
        id="password"
        name="password"
        type="password"
        required
        color={actionData ? "failure" : "gray"}
        helperText={
          (state == "idle" ? (actionData as string) : undefined) ?? "\xa0"
        }
        className="mt-2 mb-6"
      />
      <Button className="mt-6 mx-auto w-20" type="submit">
        {state != "idle" ? (
          <Spinner className="mx-auto" size="sm" light={true} />
        ) : (
          "Login"
        )}
      </Button>
    </Form>
  );
}

export async function action({ request }: ActionArgs) {
  if (request.method == "DELETE") {
    return logout(request);
  }

  try {
    const formData = await request.formData();

    const username = formData.get("username") as string;
    const password = formData.get("password") as string;

    const user = await db.user.findFirstOrThrow({ where: { username } });

    if (await verify(user.password, password)) {
      return createUserSession({
        request,
        username,
        remember: true,
        redirectTo: "/home",
      });
    }
  } catch (ex) {}
  return "Invalid credentials!";
}
