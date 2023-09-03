FROM node:18.17.1@sha256:11e9c297fc51f6f65f7d0c7c8a8581e5721f2f16de43ceff1a199fd3ef609f95 AS build

WORKDIR /app

COPY package*.json ./

ENV NODE_ENV production

RUN npm install --production

COPY --chown=node:node . .

FROM node:18.17.1-alpine@sha256:3482a20c97e401b56ac50ba8920cc7b5b2022bfc6aa7d4e4c231755770cf892f

MAINTAINER ladral

RUN mkdir -p app/keys
RUN chown -R node:node app/keys

USER node

WORKDIR /app

ENV NODE_ENV production

COPY --from=build /app/node_modules node_modules
COPY --from=build /app/proto proto
COPY --from=build /app/src src


EXPOSE 50051

CMD ["node", "src/app.mjs"]