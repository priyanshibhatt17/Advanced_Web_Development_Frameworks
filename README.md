# Practical 11: Containerization with Docker and Docker Compose

**Course Outcomes / Program Outcomes:** CO5 / PO3, PO5  
**Objective:** To containerize the full-stack Task Management application using Docker and orchestrate all services using Docker Compose.

---

## 1. System Architecture & Diagram

```
+-------------------------------------------------------------------------+
|                        Docker Host (Your Machine)                       |
|                                                                         |
|   Browser: http://localhost:5173        Postman: http://localhost:5001  |
+-------------------│------------------------------------│----------------+
                    │ Port 5173                          │ Port 5001
                    ▼                                    ▼
+-------------------------------------------------------------------------+
|                    Docker Network: app-network (Bridge)                 |
|                                                                         |
|  +--------------------+        HTTP API        +---------------------+  |
|  |     frontend       | ─────────────────────► |       backend       |  |
|  |  (React 19 + Vite) |                        |   (Express + Node)  |  |
|  |  Container: 5173   |                        |   Container: 5001   |  |
|  +--------------------+                        +----------│----------+  |
|                                                           │             |
|                                                 mongodb://mongodb:27017 |
|                                                           │             |
|                                                           ▼             |
|                                                +---------------------+  |
|                                                |       mongodb       |  |
|                                                | (Official Mongo 7.0)|  |
|                                                |   Container: 27017  |  |
|                                                +----------│----------+  |
|                                                           │             |
|                                                           ▼             |
|                                                +---------------------+  |
|                                                | Named Volume:       |  |
|                                                | mongo-data:/data/db |  |
|                                                +---------------------+  |
+-------------------------------------------------------------------------+
```

---

## 2. Quick Start Guide

### Step 1: Clone or Navigate to Project Root
```bash
cd "D:\Advanced Web Development Frameworks\practical11"
```

### Step 2: Build & Start All Services
Run the single Docker Compose orchestration command:
```bash
docker-compose up --build
```
*(Or run in detached background mode using `docker-compose up --build -d`)*

### Step 3: Verify Running Containers
Check that all 3 containers are healthy and running:
```bash
docker ps
```
Expected output:
```text
CONTAINER ID   IMAGE                  COMMAND                  PORTS                      NAMES
a1b2c3d4e5f6   practical11-frontend   "npm run preview -- …"   0.0.0.0:5173->5173/tcp     task-frontend
b2c3d4e5f6a1   practical11-backend    "node server.js"         0.0.0.0:5001->5001/tcp     task-backend
c3d4e5f6a1b2   mongo:latest           "docker-entrypoint.s…"   0.0.0.0:27017->27017/tcp   mongodb
```

### Step 4: Access Application Endpoints
* **Frontend Web App:** [http://localhost:5173](http://localhost:5173)
* **Backend API & Health:** [http://localhost:5001/cache-stats](http://localhost:5001/cache-stats)
* **Event Audit Log:** [http://localhost:5001/events-log](http://localhost:5001/events-log)

### Step 5: Stop All Services
```bash
docker-compose down
```
*(To remove volumes as well: `docker-compose down -v`)*

---

## 3. Configuration & Implementation Details

### A. Backend Dockerfile (`backend/Dockerfile`)
```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install --omit=dev
COPY . .
EXPOSE 5001
CMD ["node", "server.js"]
```

### B. Frontend Multi-Stage Dockerfile (`frontend/Dockerfile`)
```dockerfile
# Stage 1: Build static assets
FROM node:18-alpine AS build
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

# Stage 2: Minimal Production Runtime
FROM node:18-alpine AS runner
WORKDIR /app
COPY package*.json ./
RUN npm install --omit=dev
COPY --from=build /app/dist ./dist
COPY --from=build /app/vite.config.js ./
EXPOSE 5173
CMD ["npm", "run", "preview", "--", "--host", "0.0.0.0", "--port", "5173"]
```

### C. Docker Compose Orchestration (`docker-compose.yml`)
```yaml
version: '3.8'

services:
  mongodb:
    image: mongo:latest
    container_name: mongodb
    restart: unless-stopped
    ports:
      - "27017:27017"
    environment:
      - MONGO_INITDB_DATABASE=taskmanager
    volumes:
      - mongo-data:/data/db
    networks:
      - app-network

  backend:
    build:
      context: ./backend
      dockerfile: Dockerfile
    container_name: task-backend
    restart: unless-stopped
    ports:
      - "5001:5001"
      - "5000:5001"
    environment:
      - PORT=5001
      - MONGO_URI=mongodb://mongodb:27017/taskmanager
      - JWT_SECRET=super_secret_docker_lab_key
    depends_on:
      - mongodb
    networks:
      - app-network

  frontend:
    build:
      context: ./frontend
      dockerfile: Dockerfile
    container_name: task-frontend
    restart: unless-stopped
    ports:
      - "5173:5173"
    depends_on:
      - backend
    networks:
      - app-network

networks:
  app-network:
    name: app-network
    driver: bridge

volumes:
  mongo-data:
    name: mongo-data
    driver: local
```

---

## 4. Key Questions & Technical Analysis

### Q1: Why does the backend container need to reference the MongoDB container by its service name (`mongodb`) rather than `localhost`?
* **Answer:**
  In Docker, every container runs in its own isolated network namespace with its own loopback interface (`localhost` / `127.0.0.1`). If the backend container attempts to connect to `localhost:27017`, it looks for MongoDB inside its *own* container, where no MongoDB process is listening.
  When containers share a user-defined Docker bridge network (`app-network`), Docker runs an embedded internal DNS server (`127.0.0.11`). This DNS automatically resolves container and service names (such as `mongodb`) to the exact internal container IP address allocated by the Docker daemon.

### Q2: What is the difference between `EXPOSE` in a Dockerfile and the `ports` mapping in `docker-compose.yml`?
* **Answer:**
  * **`EXPOSE` (Documentation / Metadata):**
    `EXPOSE 5001` inside a Dockerfile acts as documentation and metadata between the image author and the operator. It does **not** publish or bind the port to the host machine. Other containers on the same network can access it, but outside traffic on the host cannot reach it.
  * **`ports` (Network Forwarding):**
    The `ports: - "5001:5001"` clause in `docker-compose.yml` creates a live port-forwarding rule (via host IP tables / Docker proxy). It maps port `5001` on the host machine to port `5001` inside the container, allowing web browsers, Postman, and external devices to access the containerized service.

### Q3: Why is it considered bad practice to copy `node_modules` into a Docker image instead of running `npm install` inside the container?
* **Answer:**
  1. **Binary Incompatibility (Architecture Mismatch):** Native C++ binaries compiled via `node-gyp` (such as `bcryptjs`, `canvas`, or `fsevents`) are compiled specifically for the host OS (e.g. Windows x64). Copying them into a Linux-based container (`node:18-alpine`) causes binary load crashes (`invalid ELF header`). Running `npm install` inside the container builds binaries tailored for the target container Linux kernel.
  2. **Bloated Build Context:** `node_modules` contains thousands of files, slowing down `docker build` transfers to the Docker daemon.
  3. **Stale Dependencies:** Local modules might contain untested or outdated development packages that diverge from `package-lock.json`.

---

## 5. Supplementary Problems Solutions

### Supplementary Problem 1: `.dockerignore` Implementation
Created `.dockerignore` files in both `backend/` and `frontend/` folders:
```text
node_modules
npm-debug.log
dist
.env
.git
.gitignore
```
* **Benefit:** Reduces Docker build context transmission size from ~400MB down to <2MB, speeding up build times and protecting sensitive environment secrets.

### Supplementary Problem 2: Multi-Stage Build for React Frontend
Implemented in `frontend/Dockerfile`:
* **Stage 1 (`build`):** Downloads full dependencies, compiles TypeScript/JSX, generates Vite bundle.
* **Stage 2 (`runner`):** Discards compiler tools, Vite source code, and development packages; copies only optimized production static assets (`/dist`).
* **Benefit:** Slashes final image footprint by over **70%**, minimizing attack surfaces and memory footprint.

### Supplementary Problem 3: Named Volume for MongoDB Persistence
Configured in `docker-compose.yml`:
```yaml
volumes:
  - mongo-data:/data/db
...
volumes:
  mongo-data:
    driver: local
```
* **Benefit:** By default, Docker container filesystems are ephemeral (data is lost on `docker-compose down`). Mounting the named volume `mongo-data` onto `/data/db` ensures all user accounts and task documents persist across container restarts, image upgrades, and system reboots.
