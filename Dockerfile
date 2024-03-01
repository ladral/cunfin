FROM node:20.11.1@sha256:acdf232a7bf5d32e2212134d50aee7deb9193908f1172e56fc865c51b0c6bfb0 AS build
ENV NODE_ENV production

WORKDIR /app

COPY package*.json ./

RUN npm ci --only=production --omit=dev

COPY --chown=node:node . .

FROM node:20.11.1-alpine@sha256:f4c96a28c0b2d8981664e03f461c2677152cd9a756012ffa8e2c6727427c2bda
ENV NODE_ENV production

LABEL maintainer="ladral"

WORKDIR /app

RUN mkdir -p keys
RUN chown -R node:node keys

RUN apk --no-cache add dumb-init

USER node

COPY --from=build /app/node_modules node_modules
COPY --from=build /app/proto proto
COPY --from=build /app/src src

EXPOSE 50051

CMD ["dumb-init", "node", "src/app.mjs"]