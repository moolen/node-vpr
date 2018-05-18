FROM node:10.1.0

ENV DEBIAN_FRONTEND=noninteractive

RUN apt-get update && apt-get -yq install \
      tcpdump iperf

WORKDIR /app
COPY . .

RUN npm install


CMD ["sh", "/app/entrypoint.sh"]
