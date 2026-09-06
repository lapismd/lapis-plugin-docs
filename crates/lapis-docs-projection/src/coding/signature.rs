use std::collections::HashSet;

use crate::{ProjectionError, value::*};

pub struct Signature {
    pub parameters: Vec<String>,
    pub result: String,
}

fn identifier(value: &Value, fallback: &str, label: &str) -> Result<String, ProjectionError> {
    let name = text(value);
    let name = if name.is_empty() {
        fallback.into()
    } else {
        name
    };
    let bytes = name.as_bytes();
    if !(bytes[0].is_ascii_alphabetic() || bytes[0] == b'_')
        || !bytes
            .iter()
            .all(|byte| byte.is_ascii_alphanumeric() || *byte == b'_')
    {
        return Err(format!("Invalid coding exercise {label}.").into());
    }
    Ok(name)
}

fn value_type(value: &Value) -> String {
    let Some(value) = value.as_str() else {
        return "int".into();
    };
    match value {
        "int" | "long" | "boolean" | "string" | "int[]" | "long[]" | "boolean[]" | "string[]"
        | "int[][]" | "long[][]" | "boolean[][]" | "string[][]" => value.into(),
        _ => "int".into(),
    }
}

pub fn read(value: &Value) -> Result<Signature, ProjectionError> {
    identifier(
        alias(value, "className", "class_name"),
        "Solution",
        "class name",
    )?;
    identifier(
        alias(value, "methodName", "method_name"),
        "solve",
        "method name",
    )?;
    let mut names = HashSet::new();
    let mut parameters = Vec::new();
    for (index, parameter) in list(property(value, "parameters")).iter().enumerate() {
        let name = identifier(
            property(parameter, "name"),
            &format!("arg{}", index + 1),
            "parameter name",
        )?;
        if !names.insert(name.clone()) {
            return Err(format!("Duplicate coding exercise parameter: {name}").into());
        }
        parameters.push(value_type(property(parameter, "type")));
    }
    Ok(Signature {
        parameters,
        result: value_type(alias(value, "returnType", "return_type")),
    })
}

pub fn literal(value: &Value, kind: &str) -> Result<(), ProjectionError> {
    let value = untag(value);
    let valid = if let Some(scalar) = kind.strip_suffix("[][]") {
        value.as_sequence().is_some_and(|rows| {
            rows.iter().all(|row| {
                untag(row)
                    .as_sequence()
                    .is_some_and(|items| items.iter().all(|item| scalar_valid(item, scalar)))
            })
        })
    } else if let Some(scalar) = kind.strip_suffix("[]") {
        value
            .as_sequence()
            .is_some_and(|items| items.iter().all(|item| scalar_valid(item, scalar)))
    } else {
        scalar_valid(value, kind)
    };
    if valid {
        Ok(())
    } else {
        Err(format!("Invalid {kind} coding test value.").into())
    }
}

fn scalar_valid(value: &Value, kind: &str) -> bool {
    match kind {
        "int" | "long" => number(value).is_some_and(|number| {
            number.is_finite() && number.fract() == 0.0 && number.abs() <= 9_007_199_254_740_991.0
        }),
        "boolean" => untag(value).is_boolean(),
        "string" => untag(value).is_string(),
        _ => false,
    }
}
