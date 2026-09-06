use std::sync::LazyLock;

use regex::Regex;
use saphyr::{LoadableYamlNode, MarkedYamlOwned};
use serde_json::{Value as Json, json};

use crate::{ProjectionError, coding, value::*};

static FRONTMATTER: LazyLock<Regex> =
    LazyLock::new(|| Regex::new(r"(?s)\A---\r?\n(.*?)\r?\n---\r?\n?").unwrap());

fn frontmatter(content: &str) -> Result<Value, ProjectionError> {
    let Some(found) = FRONTMATTER.captures(content) else {
        return Ok(NULL);
    };
    let mut documents = Value::load_from_str(&found[1]).map_err(|error| ProjectionError {
        message: error.to_string(),
    })?;
    if documents.len() > 1 {
        let marked =
            MarkedYamlOwned::load_from_str(&found[1]).map_err(|error| ProjectionError {
                message: error.to_string(),
            })?;
        let marker = marked[1].span.start;
        return Err(format!(
            "Source contains multiple YAML documents at line {}, column {}",
            marker.line(),
            marker.col() + 1
        )
        .into());
    }
    Ok(documents.pop().unwrap_or(NULL))
}

fn path_id(path: &str) -> &str {
    let filename = path.rsplit('/').next().unwrap_or_default();
    let lowercase = filename.to_ascii_lowercase();
    for extension in [".markdown", ".md"] {
        if lowercase.ends_with(extension) {
            return &filename[..filename.len() - extension.len()];
        }
    }
    filename
}

fn cards(frontmatter: &Value) -> Result<usize, ProjectionError> {
    let cards = list(property(frontmatter, "cards"));
    for (index, card) in cards.iter().enumerate() {
        let explicit = text(property(card, "id"));
        let id = if explicit.is_empty() {
            let prompt = text(property(card, "prompt"));
            let answer = text(property(card, "answer"));
            let seed = if !prompt.is_empty() {
                prompt
            } else if !answer.is_empty() {
                answer
            } else {
                (index + 1).to_string()
            };
            format!("card-{}", slug(&seed, "card"))
        } else {
            explicit
        };
        let id = assert_id(id, "docs card id")?;
        if property(card, "type").as_str() == Some("coding") {
            coding::validate(property(card, "exercise"), &id)?;
        }
    }
    Ok(cards.len())
}

fn book(frontmatter: &Value) -> Result<(), ProjectionError> {
    for chapter in list(property(property(frontmatter, "book"), "chapters")) {
        let mut value = alias(chapter, "noteId", "note_id");
        if value.is_null() {
            value = property(chapter, "id");
        }
        let id = text(value);
        if !id.is_empty() {
            assert_id(id, "docs id")?;
        }
    }
    Ok(())
}

fn blocks(frontmatter: &Value) -> Result<(), ProjectionError> {
    for block in list(alias(frontmatter, "blocks", "sections")) {
        let id = text(property(block, "id"));
        if !id.is_empty() {
            assert_id(id, "docs block id")?;
        }
    }
    Ok(())
}

pub fn project(path: &str, content: &str) -> Result<Json, ProjectionError> {
    let frontmatter = frontmatter(content)?;
    let path_id = path_id(path);
    let title = text(property(&frontmatter, "title"));
    let title = if title.is_empty() {
        slug(path_id, "Untitled note").replace('-', " ")
    } else {
        title
    };
    let id = text(property(&frontmatter, "id"));
    let id = assert_id(
        if id.is_empty() {
            slug(if path_id.is_empty() { &title } else { path_id }, "note")
        } else {
            id
        },
        "docs id",
    )?;
    let card_count = cards(&frontmatter)?;
    book(&frontmatter)?;
    blocks(&frontmatter)?;
    let doc_type = alias(&frontmatter, "docType", "doc_type")
        .as_str()
        .unwrap_or_default();
    let doc_type = match doc_type {
        "revision" | "coding-drill" | "system-design" | "story-bank" | "index" | "freeform" => {
            doc_type
        }
        _ => "revision",
    };
    let book_id = text(alias(&frontmatter, "bookId", "book_id"));
    let book_id = if valid_id(&book_id) {
        book_id
    } else {
        String::new()
    };
    Ok(json!({"rows":[{"id":id, "kind":"note", "data":{
        "id":id, "title":title, "docType":doc_type, "path":path,
        "tags":strings(property(&frontmatter,"tags")), "cardCount":card_count,
        "bookId":book_id
    }}], "edges":[]}))
}
