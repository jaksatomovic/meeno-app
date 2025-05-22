use super::LOCAL_QUERY_SOURCE_TYPE;
use crate::common::{
    document::{DataSourceReference, Document},
    error::SearchError,
    search::{QueryResponse, QuerySource, SearchQuery},
    traits::SearchSource,
};
use async_trait::async_trait;
use chinese_number::{ChineseCase, ChineseCountMethod, ChineseVariant, NumberToChinese};
use num2words::Num2Words;
use serde_json::Value;
use std::collections::HashMap;

pub(crate) const DATA_SOURCE_ID: &str = "Calculator";

pub struct CalculatorSource {
    base_score: f64,
}

impl CalculatorSource {
    pub fn new(base_score: f64) -> Self {
        CalculatorSource { base_score }
    }
}

fn parse_query(query: String) -> Value {
    let mut query_json = serde_json::Map::new();

    let operators = ["+", "-", "*", "/", "%"];

    let found_operators: Vec<_> = query
        .chars()
        .filter(|c| operators.contains(&c.to_string().as_str()))
        .collect();

    if found_operators.len() == 1 {
        let operation = match found_operators[0] {
            '+' => "sum",
            '-' => "subtract",
            '*' => "multiply",
            '/' => "divide",
            '%' => "remainder",
            _ => "expression",
        };

        query_json.insert("type".to_string(), Value::String(operation.to_string()));
    } else {
        query_json.insert("type".to_string(), Value::String("expression".to_string()));
    }

    query_json.insert("value".to_string(), Value::String(query));

    Value::Object(query_json)
}

fn parse_result(num: f64) -> Value {
    let mut result_json = serde_json::Map::new();

    let to_zh = num
        .to_chinese(
            ChineseVariant::Simple,
            ChineseCase::Upper,
            ChineseCountMethod::TenThousand,
        )
        .unwrap_or(num.to_string());

    let to_en = Num2Words::new(num)
        .to_words()
        .map(|s| {
            let mut chars = s.chars();
            let mut result = String::new();
            let mut capitalize = true;

            while let Some(c) = chars.next() {
                if c == ' ' || c == '-' {
                    result.push(c);
                    capitalize = true;
                } else if capitalize {
                    result.extend(c.to_uppercase());
                    capitalize = false;
                } else {
                    result.push(c);
                }
            }

            result
        })
        .unwrap_or(num.to_string());

    result_json.insert("value".to_string(), Value::String(num.to_string()));
    result_json.insert("toZh".to_string(), Value::String(to_zh));
    result_json.insert("toEn".to_string(), Value::String(to_en));

    Value::Object(result_json)
}

#[async_trait]
impl SearchSource for CalculatorSource {
    fn get_type(&self) -> QuerySource {
        QuerySource {
            r#type: LOCAL_QUERY_SOURCE_TYPE.into(),
            name: hostname::get()
                .unwrap_or(DATA_SOURCE_ID.into())
                .to_string_lossy()
                .into(),
            id: DATA_SOURCE_ID.into(),
        }
    }

    async fn search(&self, query: SearchQuery) -> Result<QueryResponse, SearchError> {
        let Some(query_string) = query.query_strings.get("query") else {
            return Ok(QueryResponse {
                source: self.get_type(),
                hits: Vec::new(),
                total_hits: 0,
            });
        };

        // Trim the leading and tailing whitespace so that our later if condition
        // will only be evaluated against non-whitespace characters.
        let query_string = query_string.trim();

        if query_string.is_empty() || query_string.len() == 1 {
            return Ok(QueryResponse {
                source: self.get_type(),
                hits: Vec::new(),
                total_hits: 0,
            });
        }

        match meval::eval_str(query_string) {
            Ok(num) => {
                let mut payload: HashMap<String, Value> = HashMap::new();

                let payload_query = parse_query(query_string.into());
                let payload_result = parse_result(num);

                payload.insert("query".to_string(), payload_query);
                payload.insert("result".to_string(), payload_result);

                let doc = Document {
                    id: DATA_SOURCE_ID.to_string(),
                    category: Some(DATA_SOURCE_ID.to_string()),
                    payload: Some(payload),
                    source: Some(DataSourceReference {
                        r#type: Some(LOCAL_QUERY_SOURCE_TYPE.into()),
                        name: Some(DATA_SOURCE_ID.into()),
                        id: Some(DATA_SOURCE_ID.into()),
                        icon: None,
                    }),
                    ..Default::default()
                };

                return Ok(QueryResponse {
                    source: self.get_type(),
                    hits: vec![(doc, self.base_score)],
                    total_hits: 1,
                });
            }
            Err(_) => {
                return Ok(QueryResponse {
                    source: self.get_type(),
                    hits: Vec::new(),
                    total_hits: 0,
                });
            }
        };
    }
}
