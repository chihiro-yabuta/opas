FROM node

WORKDIR /opas
COPY . .
RUN npm i
RUN npm run build

ENV NODE_ENV production
EXPOSE 8080
ENV PORT 8080
ENV HOSTNAME "0.0.0.0"
CMD ["node", ".next/standalone/server.js"]