FROM node:18.13.0-alpine
RUN apk update && apk upgrade && \
    apk add --no-cache bash git openssh
WORKDIR /app
COPY package*.json ./
COPY tsconfig.* ./
COPY nest-cli.json ./
COPY ./ ./
RUN yarn install
RUN yarn build
CMD yarn run start:prod
