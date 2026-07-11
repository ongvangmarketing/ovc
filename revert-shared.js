const fs = require('fs');
const path = require('path');
const duplicates = [
  [
    "src/app/(portals)/agent/hotels/[id]/bookings/booking-actions.tsx",
    "src/app/(workspace)/workspace/traveling/hotels/[id]/bookings/booking-actions.tsx"
  ],
  [
    "src/app/(portals)/agent/hotels/[id]/bookings/page.tsx",
    "src/app/(workspace)/workspace/traveling/hotels/[id]/bookings/page.tsx"
  ],
  [
    "src/app/(portals)/agent/hotels/[id]/hotel-info-form.tsx",
    "src/app/(workspace)/workspace/traveling/hotels/[id]/hotel-info-form.tsx"
  ],
  [
    "src/app/(portals)/agent/hotels/[id]/room-types/page.tsx",
    "src/app/(workspace)/workspace/traveling/hotels/[id]/room-types/page.tsx"
  ],
  [
    "src/app/(portals)/agent/hotels/[id]/sales/page.tsx",
    "src/app/(workspace)/workspace/traveling/hotels/[id]/sales/page.tsx"
  ],
  [
    "src/app/(portals)/agent/hotels/[id]/schedule/inventory-calendar-client.tsx",
    "src/app/(workspace)/workspace/traveling/hotels/[id]/schedule/inventory-calendar-client.tsx"
  ],
  [
    "src/app/(portals)/agent/hotels/[id]/schedule/page.tsx",
    "src/app/(workspace)/workspace/traveling/hotels/[id]/schedule/page.tsx"
  ],
  [
    "src/app/(portals)/agent/hotels/[id]/settings/page.tsx",
    "src/app/(workspace)/workspace/traveling/hotels/[id]/settings/page.tsx"
  ],
  [
    "src/app/(portals)/agent/settings/actions.ts",
    "src/app/(workspace)/workspace/traveling/settings/actions.ts"
  ],
  [
    "src/app/(portals)/agent/tickets/actions.ts",
    "src/app/(workspace)/workspace/traveling/tickets/actions.ts"
  ],
  [
    "src/app/(portals)/agent/tickets/page.tsx",
    "src/app/(workspace)/workspace/traveling/tickets/page.tsx"
  ],
  [
    "src/app/(portals)/agent/tours/[id]/itinerary/itinerary-builder.tsx",
    "src/app/(workspace)/workspace/traveling/tours/[id]/itinerary/itinerary-builder.tsx"
  ],
  [
    "src/app/(portals)/agent/tours/[id]/itinerary/page.tsx",
    "src/app/(workspace)/workspace/traveling/tours/[id]/itinerary/page.tsx"
  ],
  [
    "src/app/(portals)/agent/tours/[id]/overview/page.tsx",
    "src/app/(workspace)/workspace/traveling/tours/[id]/overview/page.tsx"
  ],
  [
    "src/app/(portals)/agent/tours/[id]/overview/tour-info-form.tsx",
    "src/app/(workspace)/workspace/traveling/tours/[id]/overview/tour-info-form.tsx"
  ],
  [
    "src/app/(portals)/agent/tours/[id]/schedule/page.tsx",
    "src/app/(workspace)/workspace/traveling/tours/[id]/schedule/page.tsx"
  ],
  [
    "src/app/(portals)/agent/tours/[id]/settings/page.tsx",
    "src/app/(workspace)/workspace/traveling/tours/[id]/settings/page.tsx"
  ],
  [
    "src/app/(portals)/agent/vehicles/actions.ts",
    "src/app/(workspace)/workspace/traveling/vehicles/actions.ts"
  ],
  [
    "src/app/(portals)/agent/vehicles/page.tsx",
    "src/app/(workspace)/workspace/traveling/vehicles/page.tsx"
  ],
  [
    "src/app/(portals)/agent/vehicles/vehicles-client.tsx",
    "src/app/(workspace)/workspace/traveling/vehicles/vehicles-client.tsx"
  ]
];

for (const pair of duplicates) {
  const agentFile = pair[0];
  const workspaceFile = pair[1];
  
  const relativePath = workspaceFile.split('traveling/')[1];
  const sharedPath = path.join('src/modules/traveling/components/shared', relativePath.replace('page.tsx', 'page-view.tsx'));
  
  if (fs.existsSync(sharedPath)) {
    fs.copyFileSync(sharedPath, workspaceFile);
  }
  
  if (fs.existsSync(agentFile)) {
    fs.unlinkSync(agentFile);
  }
}
