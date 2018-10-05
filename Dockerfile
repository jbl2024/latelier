FROM tozd/runit:ubuntu-xenial

EXPOSE 3000/tcp
ENV https_proxy http://proxy.ac-lyon.fr:8080
ENV https_proxy http://proxy.ac-lyon.fr:8080

ENV ROOT_URL http://example.com
ENV MAIL_URL smtp://user:password@mailhost:port/
ENV METEOR_SETTINGS {}
ENV PORT 3000
ENV MONGO_URL mongodb://mongodb/meteor
ENV MONGO_OPLOG_URL mongodb://mongodb/local
ENV HOME /
ENV LOG_TO_STDOUT 0

VOLUME /var/log/meteor

COPY ./etc /etc

RUN export http_proxy=http://proxy.ac-lyon.fr:8080 && export https_proxy=http://proxy.ac-lyon.fr:8080 && apt-get update -q -q && \
 apt-get --yes --force-yes install curl python build-essential git && \
 export METEOR_ALLOW_SUPERUSER=true && \
 curl https://install.meteor.com/ | sed s/--progress-bar/-sL/g | sh && \
 apt-get --yes --force-yes purge curl && \
 apt-get --yes --force-yes autoremove && \
 adduser --system --group meteor --home / && \
 export "NODE=$(find /.meteor/ -path '*bin/node' | grep '/.meteor/packages/meteor-tool/' | sort | head -n 1)" && \
 ln -sf ${NODE} /usr/local/bin/node && \
 ln -sf "$(dirname "$NODE")/npm" /usr/local/bin/npm && \
 echo "export NODE_PATH=\"$(dirname $(dirname "$NODE"))/lib/node_modules\"" >> /etc/service/meteor/run.env && \
 locale-gen --no-purge en_US.UTF-8 && \
 update-locale LANG=en_US.UTF-8 && \
 echo locales locales/locales_to_be_generated multiselect en_US.UTF-8 UTF-8 | debconf-set-selections && \
 echo locales locales/default_environment_locale select en_US.UTF-8 | debconf-set-selections && \
 dpkg-reconfigure locales

ONBUILD COPY . /source
ONBUILD RUN export METEOR_ALLOW_SUPERUSER=true && \
 rm -rf /source/.meteor/local /source/node_modules && \
 if [ -x /source/docker-source.sh ]; then /source/docker-source.sh; fi && \
 cp -a /source /build && \
 rm -rf /source && \
 cd /build && \
 meteor list && \
 if [ -f package.json ]; then meteor npm install --production --unsafe-perm; fi && \
 meteor build --headless --directory / && \
 cd / && \
 rm -rf /build && \
 if [ -e /bundle/programs/server/package.json ]; then cd /bundle/programs/server; npm install --unsafe-perm; fi
