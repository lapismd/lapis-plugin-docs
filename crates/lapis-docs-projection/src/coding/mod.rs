mod metadata;
mod signature;

use std::collections::HashSet;

use crate::{ProjectionError, value::*};

/// Preserve only parse-time rejection; no coding runtime or scheduler is started.
pub fn validate(exercise: &Value, card_id: &str) -> Result<(), ProjectionError> {
    let fallback = assert_id(format!("exercise-{}", slug(card_id, "card")), "docs id")?;
    if record_is_empty(exercise) {
        return Ok(());
    }
    let id = text(property(exercise, "id"));
    assert_id(
        if id.is_empty() { fallback } else { id },
        "coding exercise id",
    )?;
    let signature = signature::read(property(exercise, "signature"))?;
    let mut example_ids = Vec::new();
    for (index, example) in list(property(exercise, "examples")).iter().enumerate() {
        let id = text(property(example, "id"));
        let id = assert_id(
            if id.is_empty() {
                format!("case-{}", index + 1)
            } else {
                id
            },
            "coding test case id",
        )?;
        let arguments = list(alias(example, "arguments", "args"));
        if arguments.len() != signature.parameters.len() {
            return Err(format!("Coding test case {id} has the wrong number of arguments.").into());
        }
        for (argument, parameter) in arguments.iter().zip(&signature.parameters) {
            signature::literal(argument, parameter)?;
        }
        signature::literal(property(example, "expected"), &signature.result)?;
        example_ids.push(id);
    }
    let mut seen = HashSet::new();
    for id in example_ids {
        if !seen.insert(id.clone()) {
            return Err(format!("Duplicate coding test case id: {id}").into());
        }
    }
    let languages = metadata::languages(property(exercise, "languages"))?;
    metadata::hints(property(exercise, "hints"))?;
    metadata::solutions(property(exercise, "solutions"), &languages)
}
