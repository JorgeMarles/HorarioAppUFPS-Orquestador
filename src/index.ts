import 'reflect-metadata'
import app from "./app.js";
import { env } from "./env.js";
import { apiLogger } from "./util/logger.js";

const port = env.PORT;

const server = app.listen(port, async () => {
  apiLogger.info({ port, env: env.NODE_ENV }, `Server listening on http://localhost:${port}`);
  apiLogger.info('API Documentation: http://localhost:' + port + '/docs');
});

server.on("error", (err) => {
  if ("code" in err && err.code === "EADDRINUSE") {
    apiLogger.error({ port, error: err.code }, `Port ${env.PORT} is already in use`);
  }
  else {
    apiLogger.error({ error: err }, "Failed to start server");
  }
  process.exit(1);
});

// Graceful shutdown
process.on('SIGINT', () => {
  apiLogger.info('📴 Received SIGINT, shutting down gracefully...');
  server.close(() => {
    apiLogger.info('✅ Server closed');
    process.exit(0);
  });
});

process.on('SIGTERM', () => {
  apiLogger.info('📴 Received SIGTERM, shutting down gracefully...');
  server.close(() => {
    apiLogger.info('✅ Server closed');
    process.exit(0);
  });
});
