use lapis_docs_projection::{project_note, registration};
use serde_json::{Value, json};

#[test]
fn retained_typescript_projection_oracle() {
    let mut failures = Vec::new();
    let mut diagnostics = Vec::new();
    let mut native_cases = 0;
    let mut host_matching_cases = 0;
    for line in include_str!("../../../fixtures/native-projection/oracle.jsonl").lines() {
        let case: Value = serde_json::from_str(line).unwrap();
        let id = case["id"].as_str().unwrap();
        let result = &case["result"];
        match case["operation"].as_str().unwrap() {
            "registration" => {
                native_cases += 1;
                let actual = registration(&case["root"]);
                if actual != result["ok"] {
                    failures.push(format!("{id}: expected {}, actual {actual}", result["ok"]));
                }
            }
            "match" => host_matching_cases += 1,
            "project" => {
                native_cases += 1;
                let actual = project_note(
                    case["path"].as_str().unwrap(),
                    case["content"].as_str().unwrap(),
                );
                match actual {
                    Ok(actual) if actual == result["ok"] => {}
                    Ok(actual) => {
                        failures.push(format!("{id}: expected {result}, accepted {actual}"))
                    }
                    Err(error) if result["error"]["name"] == "YAMLParseError" => {
                        if !error.message.contains("line") || !error.message.contains("column") {
                            failures.push(format!(
                                "{id}: YAML diagnostic has no source location: {error}"
                            ));
                        }
                        let lower = error.message.to_lowercase();
                        let category_matches = match result["error"]["code"].as_str().unwrap() {
                            "BAD_INDENT" => {
                                lower.contains("flow sequence") && lower.contains("expected")
                            }
                            "DUPLICATE_KEY" => lower.contains("duplicated key"),
                            "MULTIPLE_DOCS" => lower.contains("multiple yaml documents"),
                            category => panic!("Unmapped retained YAML category: {category}"),
                        };
                        if !category_matches {
                            failures
                                .push(format!("{id}: YAML rejection category differs: {error}"));
                        }
                        diagnostics.push(json!({"id":id, "original":result["error"],
                            "native":{"message":error.message},
                            "adaptation":"YAML rejection/source location retained; parser-native prose"}));
                    }
                    Err(error) if result["error"]["message"] == error.message => {
                        assert_eq!(error.to_string(), error.message);
                    }
                    Err(error) => {
                        failures.push(format!("{id}: expected {result}, rejected {error}"))
                    }
                }
            }
            operation => panic!("Unknown frozen operation: {operation}"),
        }
    }
    if let Ok(path) = std::env::var("DOCS_PROJECTION_DIAGNOSTICS") {
        std::fs::write(
            path,
            serde_json::to_string_pretty(&diagnostics).unwrap() + "\n",
        )
        .unwrap();
    }
    println!(
        "{native_cases} native oracle cases; {host_matching_cases} host-only matching cases retained separately"
    );
    assert!(
        failures.is_empty(),
        "{} parity failures:\n{}",
        failures.len(),
        failures.join("\n")
    );
}
