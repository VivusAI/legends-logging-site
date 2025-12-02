CREATE TABLE IF NOT EXISTS logs
(
    Timestamp DateTime,
    DatasetId LowCardinality(String),
    TraceId String,
    TeamId LowCardinality(String),
    Body String,
    Attributes Map(LowCardinality(String), String),
    RetentionDays UInt32 DEFAULT 90,
 
    INDEX idx_trace_id TraceId TYPE bloom_filter GRANULARITY 1,
    INDEX idx_log_attr_key mapKeys(Attributes) TYPE bloom_filter GRANULARITY 1,
    INDEX idx_log_attr_value mapValues(Attributes) TYPE bloom_filter GRANULARITY 1,
    INDEX idx_body Body TYPE tokenbf_v1(32768, 3, 0) GRANULARITY 1
)
ENGINE = MergeTree
PARTITION BY toDate(Timestamp)
ORDER BY (TeamId, DatasetId, Timestamp)
TTL Timestamp + toIntervalDay(RetentionDays)
