import { ArrowPathIcon } from "@heroicons/react/20/solid";
import type { ActionArgs, LoaderArgs } from "@remix-run/node";
import { redirect } from "@remix-run/node";
import { Form, useActionData, useNavigation } from "@remix-run/react";
import { verify } from "~/utils/argon2.server";
import { db } from "~/utils/db.server";
import { authGuard, createUserSession, logout } from "~/utils/session.server";

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
    <Form
      method="post"
      className="m-auto text-center px-8 pt-5 pb-8 bg-base-300 card"
    >
      <label className="label" htmlFor="username">
        Username
      </label>
      <input
        id="username"
        name="username"
        required
        className="input input-bordered mb-2"
      />
      <label className="label" htmlFor="password">
        Password
      </label>
      <input
        id="password"
        name="password"
        type="password"
        required
        color={actionData ? "failure" : "gray"}
        className="input input-bordered"
      />
      <p className="pt-2 pb-4 from-error">
        {(state == "idle" ? (actionData as string) : undefined) ?? "\xa0"}
      </p>
      <button
        className="mx-auto btn btn-primary btn-wide"
        type="submit"
        disabled={state != "idle"}
      >
        {state != "idle" ? (
          <ArrowPathIcon className="mx-auto animate-spin w-6" />
        ) : (
          "Login"
        )}
      </button>
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
