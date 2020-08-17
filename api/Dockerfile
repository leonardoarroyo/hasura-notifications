FROM node:13

EXPOSE 4000
WORKDIR /app

ENV HASURA_URL="http://hasura.web.1:8080/v1/graphql"
COPY package.json .
COPY yarn.lock .
RUN yarn
COPY . .

RUN ["yarn", "build"]
CMD ["yarn", "start"]
