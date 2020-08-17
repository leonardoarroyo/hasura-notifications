FROM node:13

EXPOSE 4000
WORKDIR /app

COPY ./api/package.json .
COPY ./api/yarn.lock .
RUN yarn
COPY ./api .

RUN ["yarn", "build"]
CMD ["yarn", "start"]
