import { fastifyCors } from "@fastify/cors";
import Fastify from "fastify";
import {
  serializerCompiler,
  validatorCompiler,
  ZodTypeProvider,
} from "fastify-type-provider-zod";
import { routes } from "./routes";

// Create the Fastify app
const app = Fastify({
  logger: true,
}).withTypeProvider<ZodTypeProvider>();

// Set the serializer and validator compilers
app.setSerializerCompiler(serializerCompiler);
app.setValidatorCompiler(validatorCompiler);

// Register the CORS plugin
app.register(fastifyCors, {
  origin: "*",
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
