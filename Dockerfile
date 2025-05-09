# Build stage
FROM node:18-alpine AS builder

# Install pnpm
RUN corepack enable && corepack prepare pnpm@8.9.0 --activate

# Set working directory
WORKDIR /app

# Copy package files
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY mcp-server/package.json ./mcp-server/
COPY sdk/package.json ./sdk/
COPY examples/package.json ./examples/

# Install dependencies
RUN pnpm install 

# Copy source files
COPY . .

# Build the project
RUN pnpm --filter mcp-server build

# Production stage
FROM node:18-alpine AS runner

WORKDIR /app

# Copy built artifacts and necessary files
COPY --from=builder /app/mcp-server/dist ./dist
COPY --from=builder /app/mcp-server/package.json ./
COPY --from=builder /app/pnpm-lock.yaml ./

# Install production dependencies only
RUN corepack enable && \
    corepack prepare pnpm@8.9.0 --activate && \
    pnpm install --prod

# Expose the port the app runs on
EXPOSE 3000

# Start the server
CMD ["node", "dist/index.js"] 