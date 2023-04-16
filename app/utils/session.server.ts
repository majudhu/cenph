import { createCookieSessionStorage, redirect } from "@remix-run/node";

export const sessionStorage = createCookieSessionStorage({
  cookie: {
    name: "__session",
    httpOnly: true,
    path: "/",
    sameSite: "lax",
    secrets: [process.env.SESSION_SECRET!],
    secure: process.env.NODE_ENV === "production",
  },
});

export async function getSession(request: Request) {
  const cookie = request.headers.get("Cookie");
  return sessionStorage.getSession(cookie);
}

export async function createUserSession({
  request,
  username,
  remember,
  redirectTo,
}: {
  request: Request;
  username: string;
  remember: boolean;
  redirectTo: string;
}) {
  const session = await getSession(request);
  session.set("username", username);
  return redirect(redirectTo, {
    headers: {
      "Set-Cookie": await sessionStorage.commitSession(session, {
        maxAge: remember
          ? 60 * 60 * 24 * 7 // 7 days
          : undefined,
      }),
    },
  });
}

export async function logout(request: Request) {
  const session = await getSession(request);
  return redirect("/", {
    headers: {
      "Set-Cookie": await sessionStorage.destroySession(session),
    },
  });
}

export async function authGuard(request: Request) {
  const session = await getSession(request);
  if (
    request.headers.get("Authorization") !== process.env.API_KEY &&
    session.get("username") !== "cenph"
  ) {
    throw redirect("/");
  }

  return session;
}
