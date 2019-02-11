FROM denvazh/gatling

ENV NODE_VERSION=10.15.1
ENV PATH=/opt/node-v$NODE_VERSION-linux-x64/bin:$PATH

ADD https://nodejs.org/dist/v$NODE_VERSION/node-v$NODE_VERSION.tar.gz /tmp/

RUN apk add build-base python python-dev py-pip linux-headers nodejs-npm\
    && npm install --save request \
    && npm install --save request-promise \
    && tar xf /tmp/node-v$NODE_VERSION.tar.gz -C /tmp/ \
    && cd /tmp/node-v$NODE_VERSION \
    && ./configure \
    && make -j4 \
    && rm /tmp/node-v$NODE_VERSION.tar.gz \
    && rm -rf /var/cache/apk/*