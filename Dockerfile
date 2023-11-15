FROM node:20.9.0@sha256:8e015de364a2eb2ed7c52a558e9f716dcb615560ffd132234087c10ccc1f2c63 AS build
ENV NODE_ENV production

WORKDIR /app

COPY package*.json ./

RUN npm ci --only=production --omit=dev

COPY --chown=node:node . .

FROM node:20.9.0-alpine@sha256:807e66e2bee193961c9642bb1157d77a61747bf76737ca786da45b10749dcb42
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