CREATE TABLE "automation_workflows" (
    "id" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "status" TEXT NOT NULL DEFAULT 'DRAFT',
    "currentDraftVersionId" TEXT,
    "publishedVersionId" TEXT,
    "createdById" TEXT NOT NULL,
    "updatedById" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),
    CONSTRAINT "automation_workflows_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "automation_workflow_versions" (
    "id" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "workflowId" TEXT NOT NULL,
    "version" INTEGER NOT NULL,
    "state" TEXT NOT NULL DEFAULT 'DRAFT',
    "graphSchemaVersion" INTEGER NOT NULL DEFAULT 1,
    "graph" JSONB NOT NULL,
    "inputSchema" JSONB,
    "checksum" TEXT NOT NULL,
    "validationErrors" JSONB,
    "publishedById" TEXT,
    "publishedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "automation_workflow_versions_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "automation_workflow_triggers" (
    "id" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "workflowId" TEXT NOT NULL,
    "workflowVersionId" TEXT NOT NULL,
    "triggerType" TEXT NOT NULL,
    "triggerKey" TEXT NOT NULL,
    "configuration" JSONB NOT NULL,
    "enabled" BOOLEAN NOT NULL DEFAULT true,
    "nextRunAt" TIMESTAMP(3),
    "webhookSecretHash" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "automation_workflow_triggers_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "automation_workflow_executions" (
    "id" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "workflowId" TEXT NOT NULL,
    "workflowVersionId" TEXT NOT NULL,
    "triggerId" TEXT,
    "eventId" TEXT,
    "idempotencyKey" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'QUEUED',
    "currentNodeId" TEXT,
    "context" JSONB NOT NULL,
    "error" JSONB,
    "attempt" INTEGER NOT NULL DEFAULT 0,
    "startedAt" TIMESTAMP(3),
    "finishedAt" TIMESTAMP(3),
    "timeoutAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "automation_workflow_executions_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "automation_workflow_execution_logs" (
    "id" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "executionId" TEXT NOT NULL,
    "nodeId" TEXT,
    "nodeType" TEXT NOT NULL,
    "level" TEXT NOT NULL DEFAULT 'INFO',
    "status" TEXT NOT NULL,
    "attempt" INTEGER NOT NULL DEFAULT 0,
    "input" JSONB,
    "output" JSONB,
    "errorCode" TEXT,
    "errorMessage" TEXT,
    "durationMs" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "automation_workflow_execution_logs_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "platform_event_outbox" (
    "id" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "eventName" TEXT NOT NULL,
    "eventVersion" INTEGER NOT NULL DEFAULT 1,
    "sourceModule" TEXT NOT NULL,
    "aggregateType" TEXT,
    "aggregateId" TEXT,
    "payload" JSONB NOT NULL,
    "metadata" JSONB NOT NULL,
    "occurredAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "attempts" INTEGER NOT NULL DEFAULT 0,
    "availableAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "publishedAt" TIMESTAMP(3),
    "lastError" TEXT,
    CONSTRAINT "platform_event_outbox_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "platform_event_inbox" (
    "id" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "consumer" TEXT NOT NULL,
    "eventId" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'RECEIVED',
    "receivedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "processedAt" TIMESTAMP(3),
    "lastError" TEXT,
    CONSTRAINT "platform_event_inbox_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "automation_workflows_organizationId_status_idx" ON "automation_workflows"("organizationId", "status");
CREATE INDEX "automation_workflows_organizationId_updatedAt_idx" ON "automation_workflows"("organizationId", "updatedAt");
CREATE UNIQUE INDEX "automation_workflow_versions_organizationId_workflowId_version_key" ON "automation_workflow_versions"("organizationId", "workflowId", "version");
CREATE INDEX "automation_workflow_versions_organizationId_workflowId_state_idx" ON "automation_workflow_versions"("organizationId", "workflowId", "state");
CREATE INDEX "automation_workflow_triggers_organizationId_triggerType_triggerKey_enabled_idx" ON "automation_workflow_triggers"("organizationId", "triggerType", "triggerKey", "enabled");
CREATE INDEX "automation_workflow_triggers_triggerType_nextRunAt_enabled_idx" ON "automation_workflow_triggers"("triggerType", "nextRunAt", "enabled");
CREATE UNIQUE INDEX "automation_workflow_executions_organizationId_idempotencyKey_key" ON "automation_workflow_executions"("organizationId", "idempotencyKey");
CREATE INDEX "automation_workflow_executions_organizationId_workflowId_createdAt_idx" ON "automation_workflow_executions"("organizationId", "workflowId", "createdAt");
CREATE INDEX "automation_workflow_executions_organizationId_status_createdAt_idx" ON "automation_workflow_executions"("organizationId", "status", "createdAt");
CREATE INDEX "automation_workflow_execution_logs_organizationId_executionId_createdAt_idx" ON "automation_workflow_execution_logs"("organizationId", "executionId", "createdAt");
CREATE INDEX "platform_event_outbox_status_availableAt_idx" ON "platform_event_outbox"("status", "availableAt");
CREATE INDEX "platform_event_outbox_organizationId_eventName_occurredAt_idx" ON "platform_event_outbox"("organizationId", "eventName", "occurredAt");
CREATE UNIQUE INDEX "platform_event_inbox_consumer_eventId_key" ON "platform_event_inbox"("consumer", "eventId");
CREATE INDEX "platform_event_inbox_organizationId_status_receivedAt_idx" ON "platform_event_inbox"("organizationId", "status", "receivedAt");

ALTER TABLE "automation_workflows" ADD CONSTRAINT "automation_workflows_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "organizations"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "automation_workflow_versions" ADD CONSTRAINT "automation_workflow_versions_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "organizations"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "automation_workflow_versions" ADD CONSTRAINT "automation_workflow_versions_workflowId_fkey" FOREIGN KEY ("workflowId") REFERENCES "automation_workflows"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "automation_workflow_triggers" ADD CONSTRAINT "automation_workflow_triggers_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "organizations"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "automation_workflow_triggers" ADD CONSTRAINT "automation_workflow_triggers_workflowId_fkey" FOREIGN KEY ("workflowId") REFERENCES "automation_workflows"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "automation_workflow_triggers" ADD CONSTRAINT "automation_workflow_triggers_workflowVersionId_fkey" FOREIGN KEY ("workflowVersionId") REFERENCES "automation_workflow_versions"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "automation_workflow_executions" ADD CONSTRAINT "automation_workflow_executions_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "organizations"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "automation_workflow_executions" ADD CONSTRAINT "automation_workflow_executions_workflowId_fkey" FOREIGN KEY ("workflowId") REFERENCES "automation_workflows"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "automation_workflow_executions" ADD CONSTRAINT "automation_workflow_executions_workflowVersionId_fkey" FOREIGN KEY ("workflowVersionId") REFERENCES "automation_workflow_versions"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "automation_workflow_executions" ADD CONSTRAINT "automation_workflow_executions_triggerId_fkey" FOREIGN KEY ("triggerId") REFERENCES "automation_workflow_triggers"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "automation_workflow_execution_logs" ADD CONSTRAINT "automation_workflow_execution_logs_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "organizations"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "automation_workflow_execution_logs" ADD CONSTRAINT "automation_workflow_execution_logs_executionId_fkey" FOREIGN KEY ("executionId") REFERENCES "automation_workflow_executions"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "platform_event_outbox" ADD CONSTRAINT "platform_event_outbox_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "organizations"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "platform_event_inbox" ADD CONSTRAINT "platform_event_inbox_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "organizations"("id") ON DELETE CASCADE ON UPDATE CASCADE;
