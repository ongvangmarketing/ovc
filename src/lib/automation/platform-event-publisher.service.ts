import { randomUUID } from "node:crypto";
import type { Prisma } from "@prisma/client";
import { EventRepository } from "./repositories/event.repository";
import { EventCatalogRegistry } from "./event-catalog.registry";
import type { JsonObject, PlatformEvent } from "@/lib/automation/types/workflow.types";

export class PlatformEventPublisher {
  static async publish(input: {
    organizationId: string;
    name: string;
    sourceModule: string;
    payload: JsonObject;
    actorId?: string;
    aggregate?: { type: string; id: string };
    tx?: Prisma.TransactionClient;
  }) {
    EventCatalogRegistry.assertRegistered(input.name);
    const id = randomUUID();
    const event: PlatformEvent = {
      id,
      name: input.name,
      version: 1,
      organizationId: input.organizationId,
      sourceModule: input.sourceModule,
      occurredAt: new Date().toISOString(),
      payload: input.payload,
      aggregate: input.aggregate,
      metadata: { correlationId: id, actorId: input.actorId },
    };
    await EventRepository.append(event, input.tx);
    return event;
  }
}
