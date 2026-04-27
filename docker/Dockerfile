FROM node:20-alpine

WORKDIR /app

RUN apk add --no-cache libc6-compat openssl

COPY package.json package-lock.json ./

RUN npm ci

COPY . .

RUN npx prisma generate

ENV SKIP_ENV_VALIDATION=1
RUN npm run build

EXPOSE 3000

CMD ["npm", "run", "start"]