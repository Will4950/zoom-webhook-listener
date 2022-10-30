FROM node:lts-alpine
ENV NODE_ENV production
WORKDIR /usr/src/zoom-webhook-listener
COPY --chown=node:node . /usr/src/zoom-webhook-listener
RUN npm ci --only=production --omit=dev
USER node
CMD [ "node", "./src/index.js" ]
