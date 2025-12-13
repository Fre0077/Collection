import type { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { addUser } from './function';
import { newUser } from './interface';
import { internalServerError, Generic } from './exception';

export async function CollectionEndpoints(fastify: FastifyInstance) {
	// Healthcheck
	fastify.get('/health', async () => ({ status: 'ok' }));

	// Create user
	fastify.post<{ Body: newUser }>('/adduser', async (request: FastifyRequest<{ Body: newUser }>, reply: FastifyReply) => {
		const userData = request.body as newUser;
		const { name, surname, password } = userData;
		if (!name || !surname || !password) {
			reply.code(400).send({ error: 'Dati utente inviati insufficenti' });
			return;
		}

		try {
			await addUser(userData);
			reply.code(201).send({ message: 'utente aggiunto con successo' });
		} catch (e: unknown) {
			if (e instanceof Generic) {
				reply.code(e.statusCode).send({ error: e.message });
				return;
			}
			const msg = e instanceof Error ? e.message : 'Errore inatteso';
			reply.code(500).send({ error: msg });
		}
	});
}
