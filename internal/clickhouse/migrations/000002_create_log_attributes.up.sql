CREATE TABLE IF NOT EXISTS log_attributes
(
    TeamId          LowCardinality(String),
    DatasetId       LowCardinality(String),
    Key             LowCardinality(String),
    Timestamp       DateTime,
    TraceId         String,
    Value           String,
    RetentionDays   UInt32
) 
ENGINE = ReplacingMergeTree
ORDER BY (TeamId, DatasetId, Key, Timestamp, TraceId, Value)
TTL Timestamp + toIntervalDay(RetentionDays);
