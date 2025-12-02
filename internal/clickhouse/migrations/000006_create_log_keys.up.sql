CREATE TABLE IF NOT EXISTS log_keys (
    TeamId LowCardinality(String),
    DatasetId LowCardinality(String),
    Key LowCardinality(String),
    Day DateTime,
    Count UInt64,
    Type LowCardinality(String),
    RetentionDays UInt32
) ENGINE = SummingMergeTree(Count)
ORDER BY (TeamId, DatasetId, Key, Day) 
TTL Day + toIntervalDay(RetentionDays);
