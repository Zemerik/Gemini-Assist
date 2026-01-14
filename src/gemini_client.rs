use anyhow::{Context, Result};
use serde::{Deserialize, Serialize};
use std::collections::HashMap;

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ChatMessage {
    pub role: String,
    pub parts: Vec<Part>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Part {
    pub text: String,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
struct GenerateContentRequest {
    contents: Vec<Content>,
    generation_config: Option<GenerationConfig>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
struct Content {
    role: String,
    parts: Vec<Part>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
struct GenerationConfig {
    temperature: f64,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
struct GenerateContentResponse {
    candidates: Vec<Candidate>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
struct Candidate {
    content: Content,
}

pub struct GeminiClient {
    api_key: String,
    model_name: String,
    temperature: f64,
    base_url: String,
    chat_history: Vec<ChatMessage>,
}

impl GeminiClient {
    pub fn new(api_key: String, model_name: String, temperature: f64) -> Self {
        let base_url = format!(
            "https://generativelanguage.googleapis.com/v1beta/models/{}:generateContent",
            model_name
        );

        GeminiClient {
            api_key,
            model_name,
            temperature,
            base_url,
            chat_history: Vec::new(),
        }
    }

    pub async fn chat(&mut self, prompt: &str) -> Result<String> {
        // Add user message to history
        self.chat_history.push(ChatMessage {
            role: "user".to_string(),
            parts: vec![Part {
                text: prompt.to_string(),
            }],
        });

        // Build request with chat history
        let contents: Vec<Content> = self
            .chat_history
            .iter()
            .map(|msg| Content {
                role: msg.role.clone(),
                parts: msg.parts.clone(),
            })
            .collect();

        let request = GenerateContentRequest {
            contents,
            generation_config: Some(GenerationConfig {
                temperature: self.temperature,
            }),
        };

        // Make API call
        let client = reqwest::Client::new();
        let url = format!("{}?key={}", self.base_url, self.api_key);

        let response = client
            .post(&url)
            .json(&request)
            .send()
            .await
            .context("Failed to send request to Gemini API")?;

        // Handle errors
        if response.status().is_client_error() {
            let error_text = response.text().await.unwrap_or_default();
            if error_text.contains("API_KEY") || response.status() == 401 {
                anyhow::bail!("Invalid API key. Please check your GEMINI_API_KEY.");
            } else if error_text.contains("quota") || error_text.contains("rate limit") {
                anyhow::bail!("API quota exceeded or rate limit reached. Please try again later.");
            } else if error_text.contains("safety") {
                anyhow::bail!("Content was blocked by safety filters.");
            } else {
                anyhow::bail!("Gemini API error: {}", error_text);
            }
        }

        if !response.status().is_success() {
            let error_text = response.text().await.unwrap_or_default();
            anyhow::bail!("HTTP error {}: {}", response.status(), error_text);
        }

        let api_response: GenerateContentResponse = response
            .json()
            .await
            .context("Failed to parse Gemini API response")?;

        if api_response.candidates.is_empty() {
            anyhow::bail!("No response candidates from Gemini API");
        }

        let response_text = api_response.candidates[0]
            .content
            .parts
            .first()
            .map(|p| p.text.clone())
            .unwrap_or_default();

        // Add assistant response to history
        self.chat_history.push(ChatMessage {
            role: "model".to_string(),
            parts: vec![Part {
                text: response_text.clone(),
            }],
        });

        Ok(response_text)
    }

    pub fn clear_history(&mut self) {
        self.chat_history.clear();
    }

    pub fn get_history_count(&self) -> usize {
        self.chat_history.len()
    }
}
