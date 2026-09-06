use std::collections::HashSet;

use crate::{ProjectionError, value::*};

fn supported(language: &str) -> bool {
    matches!(language, "python" | "java" | "kotlin")
}

pub fn languages(value: &Value) -> Result<HashSet<String>, ProjectionError> {
    let values = list(value);
    if values.is_empty() {
        return Ok(["python", "java", "kotlin"].map(String::from).into());
    }
    let mut result = HashSet::new();
    for value in values {
        let language = text(property(value, "language"));
        if !supported(&language) {
            return Err(format!("Unsupported coding exercise language: {language}").into());
        }
        if !result.insert(language.clone()) {
            return Err(format!("Duplicate coding exercise language: {language}").into());
        }
    }
    Ok(result)
}

pub fn hints(value: &Value) -> Result<(), ProjectionError> {
    let mut ids = HashSet::new();
    for (index, hint) in list(value).iter().enumerate() {
        let id = text(property(hint, "id"));
        let id = assert_id(
            if id.is_empty() {
                format!("hint-{}", index + 1)
            } else {
                id
            },
            "coding hint id",
        )?;
        if !ids.insert(id.clone()) {
            return Err(format!("Duplicate coding hint id: {id}").into());
        }
    }
    Ok(())
}

pub fn solutions(value: &Value, languages: &HashSet<String>) -> Result<(), ProjectionError> {
    let mut seen = HashSet::new();
    for solution in list(value) {
        let language = text(property(solution, "language"));
        if !supported(&language) || !languages.contains(&language) {
            return Err(
                format!("Unsupported coding exercise solution language: {language}").into(),
            );
        }
        if !seen.insert(language.clone()) {
            return Err(format!("Duplicate coding exercise solution language: {language}").into());
        }
    }
    Ok(())
}
