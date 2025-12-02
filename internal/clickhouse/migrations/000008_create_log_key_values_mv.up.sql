CREATE MATERIALIZED VIEW IF NOT EXISTS log_key_values_mv TO log_key_values (
    TeamId LowCardinality(String),
    DatasetId LowCardinality(String),
    Key LowCardinality(String),
    Day DateTime,
    Value String,
    Count UInt64,
    RetentionDays UInt32
) AS
SELECT 
    TeamId,
    DatasetId,
    Key,
    toStartOfDay(Timestamp) AS Day,
    Value,
    count() AS Count,
    RetentionDays
FROM log_attributes
GROUP BY TeamId,
    DatasetId,
    Key,
    Day,
    Value,
    RetentionDays;
