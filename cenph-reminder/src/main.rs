use chrono::{DateTime, Utc};
use futures::future::join_all;
use hyper::{body, body::Buf, Body, Client, Request, Response};
use hyper_tls::HttpsConnector;
use serde::{de::DeserializeOwned, Deserialize};
use std::env;
use teloxide::prelude::*;
use tokio::time::{sleep, Duration};

type AsyncResult<T> = Result<T, Box<dyn std::error::Error + Send + Sync>>;

#[tokio::main(flavor = "current_thread")]
async fn main() -> AsyncResult<()> {
    #[cfg(debug_assertions)] // load .env only in debug profile
    dotenvy::dotenv().ok();

    let ref web_url = env::var("WEB_URL").expect("Env WEB_URL is required");

    let ref api_url = format!(
        "{}/prescriptions/expiring",
        // use fly internal network if on fly
        match env::var("FLY_APP_NAME") {
            Ok(app) => Some(match env::var("PORT") {
                Ok(port) => format!("http://{}.internal:{}", app, port),
                _ => format!("http://{}.internal", app),
            }),
            _ => None,
        }
        .as_ref()
        .unwrap_or(web_url)
    );

    let chat_id = ChatId(
        (env::var("TG_CHAT_ID").expect("Env TG_CHAT_ID is required"))
            .parse()
            .expect("Env TG_CHAT_ID should be a number"),
    );

    loop {
        let prescriptions: Vec<Prescription> = api_req(api_url, "GET", Body::empty()).await?;
        println!("{} expiring", prescriptions.len());

        let notified_ids: Vec<u64> =
            join_all(prescriptions.into_iter().map(|prescription| async move {
                let message = if prescription.prescription.is_empty() {
                    format!(
                        "Prescription expiring for “{}” on {}\n{}/prescriptions/{}",
                        prescription.customer.name,
                        prescription.renewal_date.format("%Y-%m-%d"),
                        web_url,
                        prescription.id,
                    )
                } else {
                    format!(
                        "Prescription expiring for “{}” on {}\n{}/prescriptions/{}\n{}/uploads/{}",
                        prescription.customer.name,
                        prescription.renewal_date.format("%Y-%m-%d"),
                        web_url,
                        prescription.id,
                        web_url,
                        prescription.prescription
                    )
                };
                if Bot::from_env().send_message(chat_id, message).await.is_ok() {
                    Option::Some(prescription.id)
                } else {
                    println!("Failed to notify {}", prescription.id);
                    Option::None
                }
            }))
            .await
            .into_iter()
            .flatten()
            .collect();

        println!("{} notified: {:?}", notified_ids.len(), notified_ids);

        let mark_notified_status = api_req_blank(
            api_url,
            "POST",
            Body::from(serde_json::to_string(&notified_ids)?),
        )
        .await?
        .status();
        if mark_notified_status.is_success() {
            println!("marked notified");
        } else {
            println!("mark notified error: {}", mark_notified_status)
        }

        sleep(Duration::from_secs(3600)).await;
    }
}

async fn api_req_blank(url: &str, method: &str, body: Body) -> AsyncResult<Response<Body>> {
    let client = Client::builder().build(HttpsConnector::new());
    let request = Request::builder()
        .uri(url)
        .method(method)
        .header("authorization", &env::var("API_KEY")?)
        .body(body)?;
    Ok(client.request(request).await?)
}

async fn api_req<T>(url: &str, method: &str, body: Body) -> AsyncResult<T>
where
    T: DeserializeOwned,
{
    let response = api_req_blank(url, method, body).await?;
    let body = body::aggregate(response).await?;
    Ok(serde_json::from_reader(body.reader())?)
}

#[allow(dead_code)]
#[derive(Deserialize)]
pub struct Prescription {
    #[serde(rename = "customerId")]
    customer_id: u64,
    id: u64,
    notes: String,
    #[serde(rename = "renewalDate")]
    renewal_date: DateTime<Utc>,
    prescription: String,
    customer: Customer,
}

#[allow(dead_code)]
#[derive(Deserialize)]
pub struct Customer {
    id: u64,
    name: String,
    nid: String,
    phone: String,
    address: String,
    photo: String,
    notes: String,
}
