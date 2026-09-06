use saphyr::ScalarOwned;
pub(crate) use saphyr::YamlOwned as Value;

use crate::ProjectionError;

pub fn trim(value: &str) -> &str {
    value.trim_matches(|character| {
        matches!(character,
            '\u{0009}'..='\u{000d}' | '\u{0020}' | '\u{00a0}' | '\u{1680}' |
            '\u{2000}'..='\u{200a}' | '\u{2028}' | '\u{2029}' | '\u{202f}' |
            '\u{205f}' | '\u{3000}' | '\u{feff}'
        )
    })
}

pub fn property<'a>(value: &'a Value, name: &str) -> &'a Value {
    untag(untag(value).as_mapping_get(name).unwrap_or(&NULL))
}

pub const NULL: Value = Value::Value(ScalarOwned::Null);

pub fn untag(mut value: &Value) -> &Value {
    while let Value::Tagged(_, inner) = value {
        value = inner;
    }
    value
}

pub fn number(value: &Value) -> Option<f64> {
    let value = untag(value);
    value
        .as_integer()
        .map(|value| value as f64)
        .or_else(|| value.as_floating_point())
}

pub fn alias<'a>(value: &'a Value, primary: &str, secondary: &str) -> &'a Value {
    let first = property(value, primary);
    if first.is_null() {
        property(value, secondary)
    } else {
        first
    }
}

pub fn string(value: &Value) -> String {
    match untag(value) {
        Value::Value(ScalarOwned::String(value)) => value.clone(),
        value if number(value).is_some() => {
            let number = number(value).expect("YAML numeric value");
            if number.is_nan() {
                "NaN".into()
            } else if number == f64::INFINITY {
                "Infinity".into()
            } else if number == f64::NEG_INFINITY {
                "-Infinity".into()
            } else {
                ryu_js::Buffer::new().format(number).into()
            }
        }
        _ => String::new(),
    }
}

pub fn text(value: &Value) -> String {
    trim(&string(value)).into()
}

pub fn list(value: &Value) -> &[Value] {
    untag(value).as_sequence().map_or(&[], Vec::as_slice)
}

pub fn strings(value: &Value) -> Vec<String> {
    let mut result = Vec::new();
    for value in list(value) {
        let value = text(value);
        if !value.is_empty() && !result.contains(&value) {
            result.push(value);
        }
    }
    result
}

pub fn slug(value: &str, fallback: &str) -> String {
    let mut slug = String::new();
    let mut separator = false;
    for character in trim(value).to_lowercase().chars() {
        if character.is_ascii_lowercase() || character.is_ascii_digit() {
            if separator && !slug.is_empty() {
                slug.push('-');
            }
            slug.push(character);
            separator = false;
        } else {
            separator = true;
        }
    }
    slug.truncate(72);
    if slug.is_empty() {
        fallback.into()
    } else {
        slug
    }
}

pub fn valid_id(value: &str) -> bool {
    !value.is_empty()
        && value.len() <= 80
        && value.as_bytes()[0].is_ascii_alphanumeric()
        && value
            .bytes()
            .all(|byte| byte.is_ascii_lowercase() || byte.is_ascii_digit() || byte == b'-')
}

pub fn assert_id(value: String, label: &str) -> Result<String, ProjectionError> {
    if valid_id(&value) {
        Ok(value)
    } else {
        Err(format!("Invalid {label}: {value}").into())
    }
}

pub fn record_is_empty(value: &Value) -> bool {
    untag(value)
        .as_mapping()
        .is_none_or(|mapping| mapping.is_empty())
}
