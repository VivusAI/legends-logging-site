CREATE TABLE IF NOT EXISTS dataset (
    id VARCHAR(255) NOT NULL,
    name VARCHAR(255) NOT NULL,
    description VARCHAR(255) NOT NULL,
    retention_days INT NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    organization_id VARCHAR(255) NOT NULL,
    PRIMARY KEY (id),
    FOREIGN KEY (organization_id) REFERENCES organization(id)
);

CREATE INDEX IF NOT EXISTS dataset_organization_id_idx ON dataset (organization_id);
CREATE INDEX IF NOT EXISTS dataset_name_idx ON dataset (name);
