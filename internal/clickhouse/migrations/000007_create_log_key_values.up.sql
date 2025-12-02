CREATE TABLE IF NOT EXISTS log_key_values (
    TeamId LowCardinality(String),
    DatasetId LowCardinality(String),
    Key LowCardinality(String),
    Day DateTime,
    Value String,
    Count UInt64,
    RetentionDays UInt32
) ENGINE = SummingMergeTree(Count)
ORDER BY (TeamId, DatasetId, Key, Day, Value)
TTL Day + toIntervalDay(RetentionDays)
