FROM node:13

EXPOSE 4000
WORKDIR /app

ENV HASURA_URL="http://hasura.web.1:8080/v1/graphql"
COPY ./api/package.json .
COPY ./yarn.lock .
RUN yarn
COPY ./api .

RUN ["yarn", "build"]
CMD ["yarn", "start"]
