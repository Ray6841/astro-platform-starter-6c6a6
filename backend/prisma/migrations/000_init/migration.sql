-- Enable extensions for UUID if available
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Enum for roles
DO $$ BEGIN
  CREATE TYPE "Role" AS ENUM ('ADMIN','MANAGER','STAFF');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- Users
CREATE TABLE IF NOT EXISTS "User" (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email TEXT NOT NULL UNIQUE,
  "passwordHash" TEXT NOT NULL,
  role "Role" NOT NULL DEFAULT 'STAFF',
  "createdAt" TIMESTAMP NOT NULL DEFAULT NOW(),
  "updatedAt" TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Suppliers
CREATE TABLE IF NOT EXISTS "Supplier" (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  contact TEXT,
  email TEXT,
  phone TEXT,
  "createdAt" TIMESTAMP NOT NULL DEFAULT NOW(),
  "updatedAt" TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Parts
CREATE TABLE IF NOT EXISTS "Part" (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  "partNumber" TEXT NOT NULL,
  "awtPartNumber" TEXT,
  description TEXT,
  size TEXT,
  material TEXT,
  category TEXT,
  "binNumber" TEXT,
  location TEXT,
  unit TEXT,
  "quantityInStock" INTEGER NOT NULL DEFAULT 0,
  "toOrderExcess" TEXT,
  "unitCost" DECIMAL NOT NULL DEFAULT 0,
  "inventoryValue" DECIMAL NOT NULL DEFAULT 0,
  "reorderLevel" INTEGER NOT NULL DEFAULT 0,
  "leadTimeDays" INTEGER NOT NULL DEFAULT 0,
  barcode TEXT NOT NULL UNIQUE,
  "supplierId" UUID,
  "createdAt" TIMESTAMP NOT NULL DEFAULT NOW(),
  "updatedAt" TIMESTAMP NOT NULL DEFAULT NOW(),
  CONSTRAINT fk_supplier FOREIGN KEY ("supplierId") REFERENCES "Supplier"(id)
);

CREATE INDEX IF NOT EXISTS part_partNumber_idx ON "Part"("partNumber");
CREATE INDEX IF NOT EXISTS part_barcode_idx ON "Part"(barcode);

-- Orders
CREATE TABLE IF NOT EXISTS "Order" (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  customer TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'PENDING',
  "createdAt" TIMESTAMP NOT NULL DEFAULT NOW(),
  "updatedAt" TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Order items
CREATE TABLE IF NOT EXISTS "OrderItem" (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  "orderId" UUID NOT NULL,
  "partId" UUID NOT NULL,
  quantity INTEGER NOT NULL,
  "unitPrice" DECIMAL NOT NULL DEFAULT 0,
  CONSTRAINT fk_order FOREIGN KEY ("orderId") REFERENCES "Order"(id) ON DELETE CASCADE,
  CONSTRAINT fk_part FOREIGN KEY ("partId") REFERENCES "Part"(id)
);

-- Audit logs
CREATE TABLE IF NOT EXISTS "AuditLog" (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  "userId" UUID,
  action TEXT NOT NULL,
  entity TEXT NOT NULL,
  "entityId" TEXT,
  details JSONB,
  "createdAt" TIMESTAMP NOT NULL DEFAULT NOW(),
  CONSTRAINT fk_user FOREIGN KEY ("userId") REFERENCES "User"(id)
);