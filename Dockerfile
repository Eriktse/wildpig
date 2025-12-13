FROM alpine:latest
WORKDIR /app
RUN apk add --no-cache libstdc++ libgcc
COPY ./dist/kire ./kire
CMD ["sh", "-c", "cd /app && ./kire"]