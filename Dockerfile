FROM node:18.17.1 AS build

WORKDIR /app

COPY package*.json ./

ENV NODE_ENV production

RUN npm install --production

COPY --chown=node:node . .

FROM node:18.17.1-alpine

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