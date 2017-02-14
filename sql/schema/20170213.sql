CREATE TABLE deployment (
    id             SERIAL PRIMARY KEY,
    name           VARCHAR(50),
    description    TEXT,
    created        TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

ALTER TABLE sensor ADD COLUMN "deploymentId" INTEGER REFERENCES deployment (id);
ALTER TABLE sensor ADD COLUMN "isActive" BOOLEAN;

CREATE TABLE app (
    id             SERIAL PRIMARY KEY,
    "networkId"    INTEGER REFERENCES network (id),
    name           VARCHAR(50)
);
