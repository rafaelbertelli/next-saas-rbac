import { errorHandler } from "@/routes/_error/error-handler";
import { fastifyCors } from "@fastify/cors";
import fastifyJwt from "@fastify/jwt";
import { fastifySwagger } from "@fastify/swagger";
import fastifySwaggerUI from "@fastify/swagger-ui";
import Fastify from "fastify";
import {
  jsonSchemaTransform,
  serializerCompiler,
  validatorCompiler,
  ZodTypeProvider,
} from "fastify-type-provider-zod";
import { routes } from "../routes";

// Create the Fastify app
const app = Fastify({
  logger: true,
}).withTypeProvider<ZodTypeProvider>();

// Set the serializer and validator compilers
app.setSerializerCompiler(serializerCompiler);
app.setValidatorCompiler(validatorCompiler);

// Register the error handler
app.setErrorHandler(errorHandler);

// Register the CORS plugin
app.register(fastifyCors, {
  origin: "*",
});

app.register(fastifySwagger, {
  openapi: {
    info: {
      title: "Next.js SaaS",
      description: "Fullstack SaaS app with multi-tenant & RBAC.",
      version: "1.0.0",
    },
    servers: [],
  },
  transform: jsonSchemaTransform,
});

app.register(fastifySwaggerUI, {
  routePrefix: "/docs",
});

const jwtSecret = process.env.JWT_SECRET || "";
app.register(fastifyJwt, {
  secret: jwtSecret,
  sign: { algorithm: "HS256" },
});

// Register the routes
app.register(routes);

// Start the server
app.listen({ port: 3333 }, (err, address) => {
  if (err) {
    app.log.error(err);
    process.exit(1);
  }

  app.log.info(`Server is running on ${address}`);
});
