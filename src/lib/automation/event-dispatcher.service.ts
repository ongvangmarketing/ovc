import { getSystemDb, getTenantDb } from "@/lib/db";
import type { PlatformEvent } from "@/lib/automation/types/workflow.types";
import { EventCatalogRegistry } from "./event-catalog.registry";
import { WorkflowEngineService } from "./workflow-engine.service";

export class EventDispatcherService {
  static async dispatchPending(limit = 50) {
    const systemDb = getSystemDb();
    const events = await systemDb.platformEventOutbox.findMany({
      where: { status: "PENDING", availableAt: { lte: new Date() } },
      orderBy: { occurredAt: "asc" },
      take: Math.min(limit, 100),
    });

    const results: string[] = [];
    for (const record of events) {
      const db = getTenantDb(record.organizationId);
      try {
        EventCatalogRegistry.assertRegistered(record.eventName, record.eventVersion);
        const claimed = await systemDb.platformEventOutbox.updateMany({
          where: { id: record.id, status: "PENDING" },
          data: { status: "PROCESSING", attempts: { increment: 1 } },
        });
        if (!claimed.count) continue;

        const existing = await db.platformEventInbox.findUnique({
          where: { consumer_eventId: { consumer: "workflow-engine", eventId: record.id } },
        });
        if (existing?.status === "PROCESSED") continue;

        await db.platformEventInbox.upsert({
          where: { consumer_eventId: { consumer: "workflow-engine", eventId: record.id } },
          create: { organizationId: record.organizationId, consumer: "workflow-engine", eventId: record.id },
          update: { status: "RECEIVED", lastError: null },
        });

        const triggers = await db.workflowTrigger.findMany({
          where: { organizationId: record.organizationId, triggerType: "EVENT", triggerKey: record.eventName, enabled: true },
        });
        const event: PlatformEvent = {
          id: record.id,
          name: record.eventName,
          version: record.eventVersion,
          organizationId: record.organizationId,
          sourceModule: record.sourceModule,
          occurredAt: record.occurredAt.toISOString(),
          payload: record.payload as PlatformEvent["payload"],
          aggregate: record.aggregateId && record.aggregateType ? { id: record.aggregateId, type: record.aggregateType } : undefined,
          metadata: record.metadata as PlatformEvent["metadata"],
        };

        for (const trigger of triggers) {
          const execution = await WorkflowEngineService.start({
            organizationId: record.organizationId,
            workflowId: trigger.workflowId,
            workflowVersionId: trigger.workflowVersionId,
            triggerId: trigger.id,
            event,
          });
          await WorkflowEngineService.run(record.organizationId, execution.id);
        }

        await db.platformEventInbox.update({
          where: { consumer_eventId: { consumer: "workflow-engine", eventId: record.id } },
          data: { status: "PROCESSED", processedAt: new Date() },
        });
        await systemDb.platformEventOutbox.update({ where: { id: record.id }, data: { status: "PUBLISHED", publishedAt: new Date() } });
        results.push(record.id);
      } catch (error) {
        const message = error instanceof Error ? error.message : "Dispatch failed";
        const attempts = record.attempts + 1;
        await systemDb.platformEventOutbox.update({
          where: { id: record.id },
          data: {
            status: attempts >= 5 ? "DEAD_LETTER" : "PENDING",
            lastError: message.slice(0, 1_000),
            availableAt: new Date(Date.now() + Math.min(900, 30 * 2 ** attempts) * 1_000),
          },
        });
      }
    }
    return results;
  }
}
