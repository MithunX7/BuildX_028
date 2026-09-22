# Nagpur Civic Infrastructure Monitoring Platform — Backend API

Node.js, Express, TypeScript, and MongoDB backend powering the civic infrastructure monitoring and detection platform.

## Architecture
- **Framework:** Express.js + TypeScript
- **Database:** MongoDB with Mongoose ODM
- **Authentication:** JWT with Role-Based Access Control (RBAC)
- **Computer Vision Service:** Sub-second frame classification and bounding-box detection pipeline

## Setup & Running
```bash
npm install
npm run seed   # Seed initial wards, departments, and demo users
npm run dev    # Starts on http://localhost:5000
```
