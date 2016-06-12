FROM mhart/alpine-node:6.2

ENV NODE_ENV production

# Create app directory
RUN mkdir -p /usr/src/app
WORKDIR /usr/src/app

# Install app dependencies
COPY package.json /usr/src/app/
RUN npm install

# Bundle app source
COPY ./src /usr/src/app/src
COPY ./config /usr/src/app/config
COPY ./start.js /usr/src/app/start.js
COPY ./.babelrc /usr/src/app/.babelrc

EXPOSE 8080

CMD ["npm", "start"]
