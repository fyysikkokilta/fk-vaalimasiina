# Stage 1: Builder
FROM node:22-alpine as builder

# Install brotli
RUN apk add --no-cache brotli

# Set working directory
WORKDIR /opt/vaalimasiina

# Copy necessary files for npm install
COPY .eslint* package.json package-lock.json /opt/vaalimasiina/

# Copy tsconfig files
COPY tsconfig.json tsconfig.node.json /opt/vaalimasiina/

# Copy vite configuration
COPY vite.config.ts /opt/vaalimasiina/

# Copy frontend source code
COPY src/frontend /opt/vaalimasiina/src/frontend

# Copy index.html
COPY index.html /opt/vaalimasiina/

# Set npm cache
RUN npm set cache .npm

# Install dependencies
RUN npm ci

# Set environment variable
ENV NODE_ENV=production

# Build the frontend
RUN npm run build

# Compress files with gzip and brotli
RUN find dist -type f \
    -regex ".*\.\(js\|json\|html\|map\|css\|svg\|ico\|txt\)" -exec gzip -k "{}" \; -exec brotli "{}" \;

# Stage 2: Final Image
FROM node:22-alpine

# Set environment variables
ENV NODE_ENV=production
ENV HOST=0.0.0.0

# Set working directory
WORKDIR /opt/vaalimasiina

# Copy necessary files for npm install
COPY package.json package-lock.json /opt/vaalimasiina/

# Copy backend source code
COPY src/backend /opt/vaalimasiina/src/backend

# Set npm cache
RUN npm set cache .npm

# Install dependencies
RUN npm ci

# Copy the built frontend from the builder stage
COPY --from=builder /opt/vaalimasiina/dist /opt/vaalimasiina/dist

# Command to run the application
CMD ["npm", "run", "start"]
