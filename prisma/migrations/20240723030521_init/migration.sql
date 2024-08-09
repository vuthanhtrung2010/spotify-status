-- CreateTable
CREATE TABLE "User" (
    "id" serial NOT NULL,
    "email" text NOT NULL,
    "token" text,
    "refreshToken" text,
    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User" ("email");

-- CreateIndex
CREATE UNIQUE INDEX "User_token_key" ON "User" ("token");

-- CreateIndex
CREATE UNIQUE INDEX "User_refreshToken_key" ON "User" ("refreshToken");

