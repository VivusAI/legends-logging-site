DROP VIEW IF EXISTS log_attributes_mv;

CREATE MATERIALIZED VIEW IF NOT EXISTS log_attributes_mv TO log_attributes (
    TeamId LowCardinality(String),
    DatasetId LowCardinality(String),
    Key String,
    Timestamp DateTime,
    TraceId String,
    Value String,
    RetentionDays UInt32
) AS

SELECT 
    arrayJoin(Attributes).1 AS Key,
    Timestamp,
    TraceId,
    DatasetId,
    TeamId,
    arrayJoin(Attributes).2 AS Value,
    RetentionDays
FROM logs
WHERE Value != '';
