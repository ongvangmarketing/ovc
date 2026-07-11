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
  
  if (!fs.existsSync(agentFile) || !fs.existsSync(workspaceFile)) continue;
  
  // Extract path part after "traveling/" to use for the shared component path
  const relativePath = workspaceFile.split('traveling/')[1]; // e.g. "hotels/[id]/bookings/page.tsx"
  
  // Clean up component name
  let componentName = relativePath.split('/').pop().replace('.tsx', '').replace('.ts', '');
  // e.g. "page", "hotel-info-form", "actions"
  
  // Convert to PascalCase for component name
  let PascalName = componentName.split('-').map(p => p.charAt(0).toUpperCase() + p.slice(1)).join('');
  if (PascalName === 'Page') {
    // If it's a page, use the parent directory name to give it a better name
    const parts = relativePath.split('/');
    const parentName = parts[parts.length - 2];
    PascalName = 'Shared' + parentName.charAt(0).toUpperCase() + parentName.slice(1) + 'Page';
  } else if (PascalName === 'Actions') {
    PascalName = 'SharedActions'; // dummy, not used for rendering
  }
  
  // Generate shared component path
  const sharedPath = path.join('src/modules/traveling/components/shared', relativePath.replace('page.tsx', 'page-view.tsx'));
  
  // Create directories if needed
  fs.mkdirSync(path.dirname(sharedPath), { recursive: true });
  
  // Copy original content to shared component
  let content = fs.readFileSync(workspaceFile, 'utf8');
  
  // For page.tsx files, we should probably change the default export name, but it doesn't strictly matter
  // if it's exported as default
  fs.writeFileSync(sharedPath, content);
  
  // Generate wrappers
  const importPath = `@/modules/traveling/components/shared/${relativePath.replace('.tsx', '').replace('.ts', '').replace('page', 'page-view')}`;
  
  if (relativePath.endsWith('.tsx') && !relativePath.endsWith('actions.tsx')) {
    // It's a React component
    // Check if it's a server or client component by presence of "use client"
    const isClient = content.includes('"use client"');
    
    // We can just re-export it as default!
    const wrapperContent = `export { default } from "${importPath}";\n`;
    fs.writeFileSync(agentFile, wrapperContent);
    fs.writeFileSync(workspaceFile, wrapperContent);
  } else {
    // It's an actions file or something that might have multiple exports
    // Just export *
    const wrapperContent = `export * from "${importPath}";\n`;
    fs.writeFileSync(agentFile, wrapperContent);
    fs.writeFileSync(workspaceFile, wrapperContent);
  }
}
console.log('Duplicates extracted successfully!');
