# ==========================================
# Dockerfile for React Frontend (Vite)
# Practical 11: Multi-Stage Containerization
# ==========================================

# ------------------------------------------
# Stage 1: Build Stage
# ------------------------------------------
FROM node:18-alpine AS build

WORKDIR /app

# Copy package definitions
COPY package*.json ./

# Install full dependencies (including devDependencies for build)
RUN npm install

# Copy source files
COPY . .

# Compile optimized static bundle
RUN npm run build

# ------------------------------------------
# Stage 2: Production Runtime Stage
# (Supplementary Problem 2: Multi-Stage Build)
# ------------------------------------------
FROM node:18-alpine AS runner

WORKDIR /app

# Copy package definitions and install only preview runtime dependencies
COPY package*.json ./
RUN npm install --omit=dev

# Copy compiled production bundle from build stage
COPY --from=build /app/dist ./dist
COPY --from=build /app/vite.config.js ./

# Expose frontend port
EXPOSE 5173

# Serve production build across internal docker bridge network
CMD ["npm", "run", "preview", "--", "--host", "0.0.0.0", "--port", "5173"]
