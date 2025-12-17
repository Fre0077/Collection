import Fastify from "fastify";
import cors from "@fastify/cors";
import fastifyMultipart from "@fastify/multipart";
import fastifyStatic from "@fastify/static";
import path from "path";

import { CollectionEndpoints } from "./src/endpoint";

export const fastify = Fastify({
    logger: true
});

// CORS
fastify.register(cors, {
    origin: (origin, cb) => {
        const allowedOrigins = [
            "http://localhost:3000",
            "http://localhost:5173",
            "http://localhost:5174"
        ];

        if (!origin || allowedOrigins.includes(origin)) {
            cb(null, true);
        } else {
            cb(new Error("Not allowed by CORS"), false);
        }
    },
    credentials: true,
    methods: ["GET", "POST", "PATCH", "PUT", "DELETE"],
});

// Parser text/plain
fastify.addContentTypeParser(
    "text/plain",
    { parseAs: "string" },
    function (req, body, done) {
        done(null, body);
    }
);

// Upload file multipart
fastify.register(fastifyMultipart, {
    limits: {
        fileSize: 10 * 1024 * 1024, // 10 MB max
    },
});

// Static files (serve images/uploads)
fastify.register(fastifyStatic, {
    root: path.join(process.cwd(), '/uploads'),
    prefix: '/uploads/',
});

// Collection endpoints with /api prefix
fastify.register(CollectionEndpoints, { prefix: "/api" });

// Start server
async function start() {
    try {
        const address = await fastify.listen({ port: 3000, host: "0.0.0.0" });
        console.log(`Collection server online → ${address}`);
    } catch (err) {
        fastify.log.error(err);
        process.exit(1);
    }
}

start();