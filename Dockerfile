FROM node:8-alpine
COPY . /
RUN npm install --production
EXPOSE 4242
CMD node index.js
