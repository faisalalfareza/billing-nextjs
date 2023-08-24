# syntax=docker/dockerfile:1

# Comments are provided throughout this file to help you get started.
# If you need more help, visit the Dockerfile reference guide at
# https://docs.docker.com/engine/reference/builder/

ARG NODE_VERSION=18.14.0

################################################################################
# Use node image for base image for all stages.
FROM node:${NODE_VERSION} as base

# Set working directory for all build stages.
WORKDIR /app


################################################################################
# Create a stage for installing production dependecies.
FROM base as deps

# Copy package.json so that package manager commands can be used.
COPY package*.json ./

# Download dependencies as a separate step to take advantage of Docker's caching.
# Leverage a cache mount to /root/.npm to speed up subsequent builds.
# Leverage bind mounts to package.json and package-lock.json to avoid having to copy them
# into this layer.
RUN --mount=type=bind,source=package.json,target=package.json \
    --mount=type=bind,source=package-lock.json,target=package-lock.json \
    --mount=type=cache,target=/root/.npm \
    npm ci --force

# Copy the rest of the source files into the image.
COPY . .


################################################################################
# Create a stage for building the application.
FROM deps as build

# Run the build script.
RUN npm run build


################################################################################
# Create a new stage to run the application with minimal runtime dependencies
# where the necessary files are copied from the build stage.
FROM base as final

# Use production node environment by default.
ENV NODE_ENV production
ENV HARD_URL http://18.140.60.145:1010

# Run the application as a non-root user.
# USER node

# Copy configuration files
COPY --from=deps /app/package*.json \
     /app/.env \
     /app/appinfo.json \
     /app/next.config.js \
     /app/web.config \
     ./

# Copy application source code
COPY --from=deps /app/index.js \
     /app/middleware.ts \
     ./

# Copy dependencies and public assets
COPY --from=deps /app/public ./public
COPY --from=deps /app/node_modules ./node_modules

# Copy build output
COPY --from=build /app/.next ./.next


# Expose the port that the application listens on.
EXPOSE 3000

# Run the application.
CMD npm start