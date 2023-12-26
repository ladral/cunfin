FROM node:20.10.0@sha256:e36ac0440a12839563ad011aabdd3152d6101a9d285126f86b2de5cd7f667712 AS build
ENV NODE_ENV production

WORKDIR /app

COPY package*.json ./

RUN npm ci --only=production --omit=dev

COPY --chown=node:node . .

FROM node:20.10.0-alpine@sha256:e96618520c7db4c3e082648678ab72a49b73367b9a1e7884cf75ac30a198e454
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