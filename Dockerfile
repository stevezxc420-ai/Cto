FROM node:20-alpine AS deps

WORKDIR /usr/src/app

COPY package.json package-lock.json* ./
RUN npm install


FROM node:20-alpine AS dev

WORKDIR /usr/src/app

COPY --from=deps /usr/src/app/node_modules ./node_modules
COPY package.json tsconfig.json ./
COPY src ./src

EXPOSE 3000

CMD ["npm", "run", "dev"]


FROM node:20-alpine AS build

WORKDIR /usr/src/app

COPY --from=deps /usr/src/app/node_modules ./node_modules
COPY package.json tsconfig.json ./
COPY src ./src

RUN npm run build


FROM node:20-alpine AS prod

WORKDIR /usr/src/app
ENV NODE_ENV=production

COPY package.json ./
COPY --from=deps /usr/src/app/node_modules ./node_modules
COPY --from=build /usr/src/app/dist ./dist

EXPOSE 3000

CMD ["node", "dist/index.js"]
