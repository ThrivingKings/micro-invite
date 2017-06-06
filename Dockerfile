FROM node:6.10.3
EXPOSE 80
RUN mkdir -p /usr/src/app
WORKDIR /usr/src/app
ADD . /usr/src/app
RUN npm install
CMD ["npm", "start"]
