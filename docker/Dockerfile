FROM node:22-alpine

RUN \
  apk update && \
  apk add --no-cache dumb-init tzdata

ENV TZ="Europe/Zurich" \
    NODE_ENV="production"

USER node
WORKDIR /usr/src/app

COPY --chown=node:node package*.json ./

RUN \
  npm ci --omit=dev && \
  npm cache clean --force

# Force HTTPS, specific redirect url and allowedrequesthosts
RUN \
  sed -i \
    "s/var protocol = req.protocol || \"http\";/var protocol = 'https';/" \
    node_modules/passport-tequila/lib/passport-tequila/protocol.js && \
  sed -i \
    "s/x-forwarded-host/x-tequila-redirect-path/" \
    node_modules/passport-tequila/lib/passport-tequila/protocol.js && \
  sed -i \
    "s/auth_check: auth_check/auth_check: auth_check, allowedrequesthosts: '10.180.21.0\/24'/" \
    node_modules/passport-tequila/lib/passport-tequila/protocol.js

COPY --chown=node:node src ./

EXPOSE 5555 5556

CMD [ "dumb-init", "node", "/usr/src/app/server.js" ]
