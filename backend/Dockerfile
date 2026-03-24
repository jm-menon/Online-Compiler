FROM node:22.20.0
WORKDIR /app

# Install JDK
RUN apt-get update && apt-get install -y openjdk-17-jdk && apt-get clean

# Set JAVA_HOME
ENV JAVA_HOME=/usr/lib/jvm/java-17-openjdk-amd64
ENV PATH="$JAVA_HOME/bin:$PATH"

COPY package*.json .
RUN npm install --legacy-peer-deps
COPY . .
EXPOSE 8080
CMD ["npx", "nodemon"]