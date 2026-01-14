pub mod gemini_client;

use gemini_client::GeminiClient;
use napi::bindgen_prelude::*;
use napi_derive::napi;
use std::sync::Arc;
use tokio::sync::Mutex;

#[napi]
pub struct RustGeminiClient {
    client: Arc<Mutex<GeminiClient>>,
}

#[napi]
impl RustGeminiClient {
    #[napi(constructor)]
    pub fn new(api_key: String, model_name: Option<String>, temperature: Option<f64>) -> Self {
        let model = model_name.unwrap_or_else(|| "gemini-2.5-flash".to_string());
        let temp = temperature.unwrap_or(0.7);
        let client = GeminiClient::new(api_key, model, temp);
        
        RustGeminiClient {
            client: Arc::new(Mutex::new(client)),
        }
    }

    #[napi]
    pub async fn chat(&self, prompt: String) -> Result<String> {
        let mut client = self.client.lock().await;
        client
            .chat(&prompt)
            .map_err(|e| Error::new(Status::GenericFailure, format!("{}", e)))
    }

    #[napi]
    pub async fn clear_history(&self) -> Result<()> {
        let mut client = self.client.lock().await;
        client.clear_history();
        Ok(())
    }

    #[napi]
    pub async fn get_history_count(&self) -> Result<u32> {
        let client = self.client.lock().await;
        Ok(client.get_history_count() as u32)
    }
}

#[napi]
pub fn validate_api_key_rust(api_key: String) -> bool {
    api_key.len() > 10 && api_key.chars().all(|c| c.is_alphanumeric() || c == '_' || c == '-')
}

#[napi]
pub fn rust_version() -> String {
    format!("Rust-powered Gemini Client v1.1.1-Beta")
}
