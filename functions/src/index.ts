import type {Response} from "express";
import {setGlobalOptions} from "firebase-functions/v2/options";
import {onRequest} from "firebase-functions/v2/https";
import * as logger from "firebase-functions/logger";

setGlobalOptions({
  region: "us-central1",
  maxInstances: 10,
});

interface HealthResponse {
  status: "ok" | "degraded";
  timestamp: string;
  version: string;
}

interface EchoResponse {
  receivedAt: string;
  method: string;
  query: Record<string, unknown>;
  body: unknown;
}

interface ConfigurationResponse {
  environment: string;
  message: string;
  version: string;
}

const APP_VERSION = process.env.APP_VERSION ?? "dev";

const allowCors = (res: Response) => {
  res.set("Access-Control-Allow-Origin", "*");
  res.set("Access-Control-Allow-Methods", "GET,POST,OPTIONS");
  res.set("Access-Control-Allow-Headers", "Content-Type, Authorization");
};

export const healthCheck = onRequest((request, response) => {
  allowCors(response);

  const payload: HealthResponse = {
    status: "ok",
    timestamp: new Date().toISOString(),
    version: APP_VERSION,
  };

  logger.debug("Health check ping", payload);
  response.status(200).json(payload);
});

export const echo = onRequest((request, response) => {
  allowCors(response);

  if (request.method === "OPTIONS") {
    response.status(204).send("");
    return;
  }

  if (request.method !== "POST") {
    response.status(405).json({
      error: "Method Not Allowed",
      allowed: ["POST"],
    });
    return;
  }

  const payload: EchoResponse = {
    receivedAt: new Date().toISOString(),
    method: request.method,
    query: request.query as Record<string, unknown>,
    body: request.body,
  };

  logger.info("Echo payload", payload);
  response.status(200).json(payload);
});

export const environmentSummary = onRequest((request, response) => {
  allowCors(response);

  if (request.method !== "GET") {
    response.status(405).json({
      error: "Method Not Allowed",
      allowed: ["GET"],
    });
    return;
  }

  const payload: ConfigurationResponse = {
    environment: process.env.APP_ENV ?? "development",
    message: process.env.PUBLIC_HELLO_MESSAGE ??
      "Welcome to Cortex Data Connect!",
    version: APP_VERSION,
  };

  logger.info("Environment summary requested", payload);
  response.status(200).json(payload);
});
