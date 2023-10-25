FROM node:18.18.1@sha256:cd7fa8f136023f7500490e410ba70dd3982ccca21805264f2a260a3a97be7376 AS build
ENV NODE_ENV production

WORKDIR /app

COPY package*.json ./

RUN npm ci --only=production

COPY --chown=node:node . .

FROM node:18.18.1-alpine@sha256:c41b5bfd0ef6f2db8f50323ce5ffb39f4ad444b5e5796c819ba4b1b799fbfdc2
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