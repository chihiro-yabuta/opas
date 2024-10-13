FROM node

WORKDIR /opas
COPY . .
RUN npm i
RUN npm run build

ENV NODE_ENV production

EXPOSE 3000

ENV PORT 3000
ENV HOSTNAME "0.0.0.0"

CMD ["node", ".next/standalone/server.js"]