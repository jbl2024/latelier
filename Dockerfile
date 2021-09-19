# The tag here should match the Meteor version of your app, per .meteor/release
FROM geoffreybooth/meteor-base:2.3.6 as build
# Copy app package.json and package-lock.json into container
COPY ./package*.json $APP_SOURCE_FOLDER/

RUN bash "$SCRIPTS_FOLDER/build-app-npm-dependencies.sh"

# Copy app source into container
COPY ./ $APP_SOURCE_FOLDER/

RUN METEOR_DISABLE_OPTIMISTIC_CACHING=1 bash "$SCRIPTS_FOLDER/build-meteor-bundle.sh"


# Use the specific version of Node expected by your Meteor release, per https://docs.meteor.com/changelog.html; this is expected for Meteor 1.9
FROM node:14.17.6-alpine
ENV PANDOC_VERSION 2.10.1
ENV APP_BUNDLE_FOLDER /opt/bundle
ENV SCRIPTS_FOLDER /docker

# Install OS build dependencies, which we remove later after we’ve compiled native Node extensions
RUN apk --no-cache --virtual .node-gyp-compilation-dependencies add \
	g++ \
	make \
	python \
	curl \
	# And runtime dependencies, which we keep
	&& apk --no-cache add \
	bash \
	ca-certificates \
	file \
	graphicsmagick

RUN curl -L https://github.com/jgm/pandoc/releases/download/${PANDOC_VERSION}/pandoc-${PANDOC_VERSION}-linux-amd64.tar.gz | tar xz --strip-components 1 -C /usr/local/

# Copy in entrypoint
COPY --from=build $SCRIPTS_FOLDER $SCRIPTS_FOLDER/

# Copy in app bundle
COPY --from=build $APP_BUNDLE_FOLDER/bundle $APP_BUNDLE_FOLDER/bundle/

RUN bash $SCRIPTS_FOLDER/build-meteor-npm-dependencies.sh --build-from-source \
	&& apk del .node-gyp-compilation-dependencies

# Start app
ENTRYPOINT ["/docker/entrypoint.sh"]

CMD ["node", "main.js"]