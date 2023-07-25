FROM node:20-alpine

RUN \
  apk update && \
  apk add --no-cache dumb-init tzdata

ENV TZ="Europe/Zurich" \
    NODE_ENV="production"

WORKDIR /app

COPY package*.json ./
COPY src /app

RUN \
  npm ci --omit=dev && \
  npm cache clean --force

EXPOSE 5555
USER node

CMD [ "dumb-init", "node", "/app/server.js" ]
