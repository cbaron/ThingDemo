CREATE TABLE deployment (
    id             SERIAL PRIMARY KEY,
    name           VARCHAR(50),
    description    TEXT,
    created        TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

ALTER TABLE sensor ADD COLUMN "deploymentId" INTEGER REFERENCES deployment (id);
ALTER TABLE sensor ADD COLUMN "isActive" BOOLEAN;
ALTER TABLE sensor ADD COLUMN created TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP;

CREATE TABLE app (
    id                 SERIAL PRIMARY KEY,
    name               VARCHAR(50),
    description        TEXT,
    "deploymentId"     INTEGER REFERENCES deployment (id),
    created            TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX created_idx ON event (created);

ALTER TABLE deployment ADD COLUMN "networkId" INTEGER REFERENCES network (id);
ALTER TABLE sensor DROP COLUMN "networkId";
