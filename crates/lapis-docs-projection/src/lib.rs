mod coding;
mod note;
mod registration;
mod value;

use std::fmt;

pub use registration::registration;

/// A source-owned projection failure, consumed as an Error message by the host.
#[derive(Debug, Clone, PartialEq, Eq)]
pub struct ProjectionError {
    pub message: String,
}

impl fmt::Display for ProjectionError {
    fn fmt(&self, formatter: &mut fmt::Formatter<'_>) -> fmt::Result {
        formatter.write_str(&self.message)
    }
}

impl std::error::Error for ProjectionError {}

impl From<String> for ProjectionError {
    fn from(message: String) -> Self {
        Self { message }
    }
}

/// Project already-admitted source bytes. The host owns matching and publication.
pub fn project_note(path: &str, content: &str) -> Result<serde_json::Value, ProjectionError> {
    note::project(path, content)
}
