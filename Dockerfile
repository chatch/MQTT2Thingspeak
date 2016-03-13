FROM    node:argon-wheezy
COPY    . /src
WORKDIR /src
RUN     npm install --production
CMD     ["node", "index.js"]
