import express from "express";
import helmet from "helmet";
import swaggerUi from "swagger-ui-express";
import mung from "express-mung";
import bodyParser from "body-parser";
import swaggerDocument from "./swagger.json";
import routes from "./routes";

export const API_STATUSES = {
  SUCCESS: "success",
  FAIL: "fail",
  ERROR: "error"
};


export const runAsUser = function runAsUser(userId, func) {
  const { DDPCommon } = Package["ddp-common"];
  const invocation = new DDPCommon.MethodInvocation({
    isSimulation: false,
    userId: userId,
    setUserId: () => { },
    unblock: () => { },
    connection: {},
    randomSeed: Random.id()
  });
  return DDP._CurrentInvocation.withValue(invocation, () => func());
};

export const RestApi = class RestApi {
  constructor(config) {
    this.config = config || this.defaultConfig();
  }

  defaultConfig() {
    return {
      enabled: true,
      basePath: "/api",
      swagger: {
        enabled: false
      }
    };
  }

  connectServer(webApp) {
    const server = express();

    server.use((req, res, next) => runAsUser("Z4f76EuDbLhN6whyy", next));
    server.use(this.responseEnvelope());
    server.use(this.config.basePath, routes);
    if (this.config?.swagger?.enabled === true) {
      this.setupSwagger(server);
    }
    this.setErrorHandler(server);
    webApp.connectHandlers
      .use(this.config.basePath, helmet())
      .use(this.config.basePath, bodyParser.urlencoded({ extended: true }))
      .use(this.config.basePath, bodyParser.json())
      .use(server);
    return server;
  }

  setupSwagger(server) {
    if (Array.isArray(this.config?.swagger?.servers)) {
      swaggerDocument.servers = this.config.swagger.servers;
    }
    server.use(this.config?.swagger?.uiPath, swaggerUi.serve, swaggerUi.setup(swaggerDocument));
  }

  setErrorHandler(server) {
    const _this = this;
    server.use(function (error, req, res, next) {
      if (error instanceof RestApiError) {
        res.status(error.statusCode).json({
          status: _this.getStatusCode(req, res),
          message: error.message
        }).end();
      }
    });
  }

  responseEnvelope() {
    const _this = this;
    const response = function response(body, req, res) {
      return {
        status: _this.getStatusCode(req, res),
        data: body
      };
    };
    return mung.json(response, {
      mungError: false
    });
  }

  getStatusCode(req, res) {
    const statusCode = res.statusCode || 200;
    if (statusCode >= 500) {
      return API_STATUSES.ERROR;
    } if (statusCode >= 400 && statusCode < 500) {
      return API_STATUSES.FAIL;
    } if (statusCode <= 200) {
      return API_STATUSES.SUCCESS;
    }
    return API_STATUSES.SUCCESS;
  }
};

export const RestApiError = class RestApiError extends Error {
  constructor(message, statusCode = 422) {
    super(message);
    this.name = "RestApiError";
    this.statusCode = statusCode;
  }
};
