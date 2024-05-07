# Use an official Node.js runtime as a parent image
FROM node:20-alpine3.17

# Set the working directory to /app
WORKDIR /server

# Copy package.json and package-lock.json to the working directory
COPY package*.json ./

# Install app dependencies
RUN npm install --production

# Copy the rest of the application code to the working directory
COPY . .

# Expose port 3000 for the app to listen on
EXPOSE 3000

# Start the app
CMD [ "npm", "start" ]
