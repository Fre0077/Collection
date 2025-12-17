import type { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';

import { logInfo } from './logger';
import { register, login, addCollection } from './function';
import { Register, Login, AddCollection } from './interface';
import { BadRequest, Unauthorized, Forbidden, NotFound, Conflict } from './exception';

export async function CollectionEndpoints(fastify: FastifyInstance) {
	// Healthcheck
	fastify.get('/health', async () => ({ status: 'ok' }));

	// register
	fastify.post<{ Body: Register }>('/register', async (request: FastifyRequest<{ Body: Register }>, reply: FastifyReply) => {
		const userData = request.body as Register;
		try {
			if (!userData.name || !userData.surname || !userData.password)
				throw new BadRequest('Dati utente inviati insufficenti');
			await register(userData);
			logInfo('[201] utente aggiunto con successo');
			reply.code(201).send({ message: 'utente aggiunto con successo' });
		} catch (e: unknown) {
			if (e instanceof Error) {
				reply.code((e as any).statusCode).send({ error: e.message });
				return;
			} else {
				reply.code(500).send({ error: "Internal server error" });
			}
		}
	});

	//login
	fastify.post<{ Body: Login }>('/login', async (request: FastifyRequest<{ Body: Login }>, reply: FastifyReply) => {
		const userData = request.body as Login;
		try {
			if (!userData.email || !userData.password)
				throw new BadRequest('Dati utente inviati insufficenti');
			const user = await login(userData);
			logInfo('[200] login utente completato');
			reply.code(200).send({ message: 'Login completato', user });
		} catch (e: unknown) {
			if (e instanceof Error) {
				reply.code((e as any).statusCode).send({ error: e.message });
				return;
			} else {
				reply.code(500).send({ error: "Internal server error" });
			}
		}
	});

	//Aggiunge una collezione con degli attributi di base
	fastify.post<{ Body: AddCollection }>('/addCollection', async (request: FastifyRequest<{ Body: AddCollection }>, reply: FastifyReply) => {
		const userData = request.body as AddCollection;
		try {
			if (!userData.name || !userData.userId)
				throw new BadRequest('Dati utente inviati insufficenti');
			await addCollection(userData);
			logInfo('[201] utente aggiunto con successo');
			reply.code(201).send({ message: 'utente aggiunto con successo' });
		} catch (e: unknown) {
			if (e instanceof Error) {
				reply.code((e as any).statusCode).send({ error: e.message });
				return;
			} else {
				reply.code(500).send({ error: "Internal server error" });
			}
		}
	});
}
