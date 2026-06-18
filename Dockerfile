# Stage 1: Build the React application
FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

# Stage 2: Serve the compiled static files
FROM node:20-alpine
WORKDIR /app
COPY --from=builder /app/dist ./dist
RUN npm install -g sirv-cli
EXPOSE 3001
CMD ["sirv", "dist", "--port", "3001", "--host", "0.0.0.0", "--single"]
