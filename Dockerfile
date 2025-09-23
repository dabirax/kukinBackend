# Use Node.js LTS image
FROM node:18

# Set working directory inside the container
WORKDIR /usr/src/app

# Copy package.json and install dependencies
COPY package*.json ./
RUN npm install --legacy-peer-deps

# Copy project files
COPY . .

# Build the project
RUN npm run build

# Expose app port
EXPOSE 5000

# Start server
CMD ["node", "dist/server.js"]
