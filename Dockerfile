# Stage 1: Builder
FROM node:22-alpine as base

FROM base AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /opt/vaalimasiina
COPY .eslint* package.json package-lock.json ./
RUN npm set cache .npm
RUN npm ci

FROM base AS builder
RUN apk add --no-cache brotli
WORKDIR /opt/vaalimasiina
COPY --from=deps /opt/vaalimasiina/node_modules ./node_modules
COPY . /opt/vaalimasiina/
RUN npm run build
RUN find .next -type f \
    -regex ".*\.\(js\|json\|html\|map\|css\|svg\|ico\|txt\)" -exec gzip -k "{}" \; -exec brotli "{}" \;

FROM base AS runner
ENV NODE_ENV=production
ENV HOSTNAME=0.0.0.0
WORKDIR /opt/vaalimasiina
COPY --from=builder /opt/vaalimasiina/public ./public
COPY --from=builder /opt/vaalimasiina/.next/standalone ./
COPY --from=builder /opt/vaalimasiina/.next/static ./.next/static

ENTRYPOINT ["node", "server.js"]
