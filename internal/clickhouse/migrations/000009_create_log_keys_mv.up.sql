CREATE MATERIALIZED VIEW IF NOT EXISTS log_keys_mv TO log_keys (
    TeamId LowCardinality(String),
    DatasetId LowCardinality(String),
    Key LowCardinality(String),
    Day DateTime,
    Count UInt64,
    Type String,
    RetentionDays UInt32
) AS
SELECT TeamId,
    DatasetId,
    Key,
    Day,
    sum(Count) AS Count,
    if(
        isNull(toFloat64OrNull(Value)),
        'String',
        'Numeric'
    ) AS Type,
    max(RetentionDays) as RetentionDays
FROM log_key_values
GROUP BY TeamId,
    DatasetId,
    Key,
    Day,
    isNull(toFloat64OrNull(Value));
