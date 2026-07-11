CREATE TABLE IF NOT EXISTS "RoomInventory" (
  "id" TEXT NOT NULL,
  "date" DATE NOT NULL,
  "allotment" INTEGER NOT NULL DEFAULT 0,
  "availableRooms" INTEGER NOT NULL DEFAULT 0,
  "price" DOUBLE PRECISION NOT NULL DEFAULT 0,
  "isClosed" BOOLEAN NOT NULL DEFAULT false,
  "note" TEXT,
  "roomTypeId" TEXT NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,

  CONSTRAINT "RoomInventory_pkey" PRIMARY KEY ("id")
);

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'RoomInventory_roomTypeId_fkey'
  ) THEN
    ALTER TABLE "RoomInventory"
      ADD CONSTRAINT "RoomInventory_roomTypeId_fkey"
      FOREIGN KEY ("roomTypeId") REFERENCES "RoomType"("id") ON DELETE CASCADE ON UPDATE CASCADE;
  END IF;
END $$;

CREATE UNIQUE INDEX IF NOT EXISTS "RoomInventory_roomTypeId_date_key" ON "RoomInventory"("roomTypeId", "date");
CREATE INDEX IF NOT EXISTS "RoomInventory_date_idx" ON "RoomInventory"("date");
CREATE INDEX IF NOT EXISTS "RoomInventory_roomTypeId_idx" ON "RoomInventory"("roomTypeId");
