FROM node:16
COPY api/ /usr/cryptoshare/api/
COPY web/ /usr/cryptoshare/web/
WORKDIR /usr/cryptoshare/api/
RUN npm install
EXPOSE 3190
CMD ["npm", "start"]
