import express from "express";
import helmet from "helmet";
import routes from "./routes";
import swaggerUi from "swagger-ui-express";
import swaggerDocument from "./swagger.json";
import mung from "express-mung";


export const API_STATUSES = {
    SUCCESS: "success",
    FAIL: "fail",
    ERROR: "error"
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
        }
    }
    createServer() {
        const server = express();
        // server.use(helmet());
        server.use(this.responseEnvelope());
        server.use(this.config.basePath, routes);
        this.setErrorHandler(server);
        if (this.config?.swagger?.enabled === true) {
            this.setupSwagger(server);
        }
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
        server.use(function(error, req, res, next) {
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
            }
        }
        return mung.json(response, {
            mungError: false
        });
    }
    getStatusCode(req, res) {
        let statusCode = res.statusCode || 200;
        if (statusCode >= 500) {
            return API_STATUSES.ERROR;
        } else if (statusCode >= 400 && statusCode < 500) {
            return API_STATUSES.FAIL;
        } else if (statusCode <= 200) {
            return API_STATUSES.SUCCESS;
        }
        return API_STATUSES.SUCCESS;
    }
}

export const RestApiError = class RestApiError extends Error {
    constructor(message, statusCode = 422) {
        super(message);
        this.name = "RestApiError";
        this.statusCode = statusCode;
    }
}