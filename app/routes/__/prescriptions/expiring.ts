import type { ActionArgs, LoaderArgs } from "@remix-run/node";
import { json } from "@remix-run/node";
import { db } from "~/utils/db.server";
import { authGuard } from "~/utils/session.server";

export async function loader({ request }: LoaderArgs) {
  await authGuard(request);

  const prescriptions = await db.prescription.findMany({
    where: {
      AND: [
        { renewalDate: { lt: new Date(Date.now() + WEEK_MS) } },
        { notified: { gt: 7 } },
      ],
    },
    include: { customer: true },
  });

  return json(prescriptions);
}

export async function action({ request }: ActionArgs) {
  await authGuard(request);

  const prescriptions = (await request.json()) as number[];

  await db.prescription.updateMany({
    where: { id: { in: prescriptions } },
    data: { notified: 7 },
  });

  return new Response(null, { status: 204 });
}

const WEEK_MS = 7 * 24 * 60 * 60 * 1000;
