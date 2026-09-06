use serde_json::{Value, json};

/// Retain the TypeScript registration, including literal root normalization.
pub fn registration(docs_root: &Value) -> Value {
    let root = docs_root.as_str().map_or("docs", |root| {
        let root = super::value::trim(root).trim_matches('/');
        if root.is_empty() { "docs" } else { root }
    });
    json!({
        "id": "note", "version": 1, "visibility": "public",
        "fields": {
            "id": {"type":"string", "indexed":true},
            "title": {"type":"string", "indexed":true},
            "docType": {"type":"string", "indexed":true},
            "path": {"type":"path", "indexed":true},
            "tags": {"type":"string", "indexed":true, "cardinality":"many"},
            "cardCount": {"type":"number", "indexed":false},
            "bookId": {"type":"string", "indexed":true}
        },
        "source": {"extensions":["doc.md"], "pathPrefix":root}
    })
}
