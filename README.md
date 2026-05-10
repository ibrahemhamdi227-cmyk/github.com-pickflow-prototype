
# PickFlow Full Prototype

A browser-based prototype for an on-demand robotic picking tool.

## Features
- Operator login screen
- Ibrahim operator profile
- Dashboard with robot, pod, request and pick KPIs
- Item search / barcode-style scan flow
- Call pod to workstation
- Simulated robot dispatch and pod arrival
- Pick confirmation with quantity control
- Release pod to next task or return to storage
- Live warehouse map with robot positions
- Fleet manager screen
- Inventory lookup
- Workstation status
- Request queue
- Reports page
- Settings page
- Activity feed

## How to Run
Open `index.html` in any modern browser.

No backend is required for this prototype.

## Production Next Steps
To make this real, connect this front-end to:
- Node.js or Python backend API
- PostgreSQL database
- WebSocket live updates
- Robot fleet manager API
- WMS / ERP inventory system
- Barcode scanner hardware
- Authentication and user roles
