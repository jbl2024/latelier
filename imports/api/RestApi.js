import express from "express";
import helmet from "helmet";
import routes from "./routes";
import swaggerUi from "swagger-ui-express";
import swaggerDocument from "./swagger.json";

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
        server.use(this.config.basePath, routes);
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
}

