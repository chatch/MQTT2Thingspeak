FROM    node:argon-wheezy
COPY    . /src
RUN     cd /src; npm install --production
CMD     ["node", "/src/index.js"]
