# Este Dockerfile é para o hasura
# O Dokku exige que há um Dockerfile na pasta base do projeto
# para identificar que o deploy é de Dockerfile.

FROM hasura/graphql-engine:v1.3.1.cli-migrations-v2

ENV PORT 8080
EXPOSE 8080

# Enable the console
ENV HASURA_GRAPHQL_MIGRATIONS_DIR=/migrations
ENV HASURA_GRAPHQL_METADATA_DIR=/metadata
ENV HASURA_GRAPHQL_CORS_DOMAIN="https://atados.com.br, https://*.atados.com.br, https://*.atados.vercel.app, https://ovp-client-atados-*.vercel.app, http://localhost:3000/, http://localhost:3001/"
ENV HASURA_GRAPHQL_DEV_MODE=false
ENV HASURA_GRAPHQL_UNAUTHORIZED_ROLE="anonymous"

# Disable console
#ENV HASURA_GRAPHQL_ENABLED_APIS=graphql
#ENV HASURA_GRAPHQL_ENABLE_CONSOLE=false

# Enable console(uncomment if needed)
ENV HASURA_GRAPHQL_ENABLE_CONSOLE=true

RUN mkdir /migrations
RUN mkdir /metadata
COPY ./hasura/migrations /migrations
COPY ./hasura/metadata /metadata

CMD graphql-engine --port $PORT serve
