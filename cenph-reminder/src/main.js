const WEB_URL = process.env.WEB_URL;
if (!WEB_URL) throw "Env WEB_URL is required";

const API_URL = process.env.FLY_APP_NAME
  ? process.env.PORT
    ? `http://${process.env.FLY_APP_NAME}.internal:${process.env.PORT}`
    : `http://${process.env.FLY_APP_NAME}.internal`
  : WEB_URL;

const CHAT_ID = process.env.TG_CHAT_ID;
if (!CHAT_ID) throw "Env TG_CHAT_ID is required";

while (true) {
  const prescriptions = await api_req(API_URL);
  console.log(`${prescriptions.length} expiring`);

  const notified_ids = (
    await Promise.all(
      prescriptions.map((prescription) =>
        tg_bot_send_message(
          CHAT_ID,
          `Prescription expiring for “${prescription.customer.name}” on ${prescription.renewal_date}\n${WEB_URL}/prescriptions/${prescription.id}` +
            (prescription.prescription
              ? `\n${WEB_URL}/uploads/$s{prescription.prescription}`
              : "")
        )
          .then(() => prescription.id)
          .catch(() => console.log(`"Failed to notify ${prescription.id}"`))
      )
    )
  ).filter(Boolean);

  console.log(`${notified_ids.length} notified: ${notified_ids.join(",")}`);

  await fetch(API_URL, { method: "POST", body: notified_ids })
    .then(() => console.log("marked notified"))
    .catch((ex) => console.log(`mark notified error: ${ex}`));

  await new Promise((r) => setTimeout(r, 3600000));
}

async function api_req(url, method, body) {
  const res = await fetch(url, { method, body });
  return await res.json();
}

async function tg_bot_send_message() {}
