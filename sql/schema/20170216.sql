ALTER TABLE deployment ADD COLUMN "subCategoryId" INTEGER REFERENCES "subCategory" (id);
