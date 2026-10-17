# ==========================================
# Dockerfile for Node.js / Express Backend
# Practical 11: Containerization
# ==========================================

# Use official Node.js 22 LTS alpine image for minimal footprint
FROM node:22-alpine

# Set working directory inside container
WORKDIR /app

# Copy dependency definition files first (leverages Docker cache layer)
COPY package*.json ./

# Install production dependencies inside the container
RUN npm install --omit=dev

# Copy the rest of backend application source code
COPY . .

# Expose backend port
EXPOSE 5001

# Start the Node.js server
CMD ["node", "server.js"]
