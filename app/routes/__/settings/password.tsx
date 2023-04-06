import { ArrowPathIcon } from "@heroicons/react/20/solid";
import type { ActionArgs, LoaderArgs } from "@remix-run/node";
import { redirect } from "@remix-run/node";
import { Form, Link, useActionData, useNavigation } from "@remix-run/react";
import { useState } from "react";
import { db } from "~/utils/db.server";
import { authGuard } from "~/utils/session.server";

import { hash, verify } from "~/utils/argon2.server";

export async function loader({ request }: LoaderArgs) {
  await authGuard(request);
  return null;
}

export default function Settings() {
  const { state } = useNavigation();
  const actionData = useActionData() as string;
  const [error, setError] = useState("");

  function validate(e: React.FormEvent<HTMLFormElement>) {
    const elements = (e.target as HTMLFormElement).elements;
    // @ts-expect-error
    if (elements["new-password"].value !== elements["confirm-password"].value) {
      e.preventDefault();
      setError("Passwords do not match");
    } else {
      setError("");
    }
  }

  return (
    <Form method="post" className="bg-base-200 max-w-md" onSubmit={validate}>
      <h1>Change password</h1>

      <label className="label" htmlFor="password">
        Password
      </label>
      <input
        required
        id="password"
        name="password"
        type="password"
        autoComplete="current-password"
        className="input input-bordered w-full mb-2"
      />

      <label className="label" htmlFor="new-password">
        New Password
      </label>
      <input
        required
        id="new-password"
        name="new-password"
        type="password"
        autoComplete="new-password"
        className="input input-bordered w-full mb-2"
      />

      <label className="label" htmlFor="confirm-password">
        Confirm Password
      </label>
      <input
        required
        id="confirm-password"
        type="password"
        autoComplete="new-password"
        className="input input-bordered w-full mb-2"
      />

      {(actionData || error) && (
        <p className="text-error text-sm my-2">{actionData || error}</p>
      )}

      <div className="flex gap-8 mt-4">
        <button
          type="submit"
          className="btn btn-primary w-32"
          disabled={state != "idle"}
        >
          {state != "idle" ? (
            <ArrowPathIcon className="mx-auto animate-spin w-6" />
          ) : (
            "Save"
          )}
        </button>
        <Link to="./.." className="btn w-32">
          Cancel
        </Link>
      </div>
    </Form>
  );
}

export async function action({ request }: ActionArgs) {
  const session = await authGuard(request);
  try {
    const formData = await request.formData();
    const oldPassword = formData.get("password") as string;
    const newPassword = formData.get("new-password") as string;
    const username = session.get("username") as string;

    const user = await db.user.findFirstOrThrow({ where: { username } });

    if (await verify(user.password, oldPassword)) {
      const password = await hash(newPassword);
      db.user.update({ where: { username }, data: { password } });
      return redirect("/settings");
    } else {
      return new Response("Invalid password", { status: 400 });
    }
  } catch (ex) {}
  return new Response(null, { status: 400 });
}
