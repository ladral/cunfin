FROM node:22.17.0@sha256:0c0734eb7051babbb3e95cd74e684f940552b31472152edf0bb23e54ab44a0d7 AS build
ENV NODE_ENV production

WORKDIR /app

COPY package*.json ./

RUN npm ci --only=production --omit=dev

COPY --chown=node:node . .

FROM node:22.17.0-alpine@sha256:5340cbfc2df14331ab021555fdd9f83f072ce811488e705b0e736b11adeec4bb
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