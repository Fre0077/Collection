import type { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';

import { logInfo } from './logger';
import { register, login, addCollection, getCollection, removeCollection, addAttribute, getAttribute, addItem, getItem } from './function';
import { Register, Login, AddCollection, GetCollection, AddAttribute, AddItem } from './interface';
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
			logInfo('[201] collezione aggiunta con successo');
			reply.code(201).send({ message: 'collezione aggiunta con successo' });
		} catch (e: unknown) {
			if (e instanceof Error) {
				reply.code((e as any).statusCode).send({ error: e.message });
				return;
			} else {
				reply.code(500).send({ error: "Internal server error" });
			}
		}
	});

	//restituisce le collezioni di un utente
	fastify.get<{ Querystring: { userId: string } }>('/getCollection', async (request: FastifyRequest<{ Querystring: { userId: string } }>, reply: FastifyReply) => {
		try {
			const userId = request.query.userId;
			if (!userId)
				throw new BadRequest('userId non fornito');
			const collections = await getCollection(parseInt(userId));
			logInfo('[200] collezioni recuperate con successo');
			reply.code(200).send({ message: 'collezioni recuperate con successo', collections });
		} catch (e: unknown) {
			if (e instanceof Error) {
				reply.code((e as any).statusCode).send({ error: e.message });
				return;
			} else {
				reply.code(500).send({ error: "Internal server error" });
			}
		}
	});

	//cancella la collezione indicata
	fastify.get<{ Querystring: { collectionName: string } }>('/removeCollection', async (request: FastifyRequest<{ Querystring: { collectionName: string } }>, reply: FastifyReply) => {
		try {
			const collectionName = request.query.collectionName;
			if (!collectionName)
				throw new BadRequest('collectionName non fornito');
			const collections = await removeCollection(collectionName);
			logInfo('[200] collezione rimossa con successo');
			reply.code(200).send({ message: 'collezione rimossa con successo' });
		} catch (e: unknown) {
			if (e instanceof Error) {
				reply.code((e as any).statusCode).send({ error: e.message });
				return;
			} else {
				reply.code(500).send({ error: "Internal server error" });
			}
		}
	});

	//Aggiunge un attributo ad una collezione
	fastify.post<{ Body: AddAttribute }>('/addAttribute', async (request: FastifyRequest<{ Body: AddAttribute }>, reply: FastifyReply) => {
		const userData = request.body as AddAttribute;
		try {
			if (!userData.collectionId || !userData.attribute)
				throw new BadRequest('Dati utente inviati insufficenti');
			await addAttribute(userData);
			logInfo('[201] attributo aggiunto con successo');
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

	//restituisce gli attributi di una collezione
	fastify.get<{ Querystring: { collectionId: string } }>('/getAttribute', async (request: FastifyRequest<{ Querystring: { collectionId: string } }>, reply: FastifyReply) => {
		try {
			const collectionId = request.query.collectionId;
			if (!collectionId)
				throw new BadRequest('collectionId non fornito');
			const attributes = await getAttribute(parseInt(collectionId));
			logInfo('[200] attributi recuperati con successo');
			reply.code(200).send({ message: 'attributi recuperati con successo', attributes });
		} catch (e: unknown) {
			if (e instanceof Error) {
				reply.code((e as any).statusCode).send({ error: e.message });
				return;
			} else {
				reply.code(500).send({ error: "Internal server error" });
			}
		}
	});

	//Aggiunge un item con attributi ad una collezione
	fastify.post<{ Body: AddItem }>('/addItem', async (request: FastifyRequest<{ Body: AddItem }>, reply: FastifyReply) => {
		const userData = request.body as AddItem;
		try {
			if (!userData.collectionId || !userData.attribute)
				throw new BadRequest('Dati utente inviati insufficenti');
			await addItem(userData);
			logInfo('[201] item aggiunto con successo');
			reply.code(201).send({ message: 'item aggiunto con successo' });
		} catch (e: unknown) {
			if (e instanceof Error) {
				reply.code((e as any).statusCode).send({ error: e.message });
				return;
			} else {
				reply.code(500).send({ error: "Internal server error" });
			}
		}
	});

	//restituisce gli item con attributi di una collezzione
	fastify.get<{ Querystring: { collectionId: string } }>('/getItem', async (request: FastifyRequest<{ Querystring: { collectionId: string } }>, reply: FastifyReply) => {
		try {
			const collectionId = request.query.collectionId;
			if (!collectionId)
				throw new BadRequest('collectionId non fornito');
			const items = await getItem(parseInt(collectionId));
			logInfo('[200] item recuperati con successo');
			reply.code(200).send({ message: 'item recuperati con successo', items });
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
