import sqlite3 from 'sqlite3';
import path from 'path';

import { Register, Login, AddCollection } from './interface';
import { BadRequest, Unauthorized, Forbidden, NotFound, Conflict, InternalServerError } from './exception';

function getDb(): sqlite3.Database {
	sqlite3.verbose();
	const dbPath = path.join(__dirname, '../database/database.sqlite');
	return new sqlite3.Database(dbPath);
}

export async function register(user: Register): Promise<void> {
	const db = getDb();
	const INSERT_USER = 'INSERT INTO user(name, surname, username, email, password) VALUES (?, ?, ?, ?, ?)';
	const params = [user.name, user.surname, user.username, user.email, user.password];

	await new Promise<void>((resolve, reject) => {
		db.run(INSERT_USER, params, function (err) {
			if (err) {
				db.close();
				reject(new InternalServerError('Errore con il database'));
				return;
			}
			db.close();
			resolve();
		});
	});
}

export async function login(user: Login): Promise<{ id: number; name: string; surname: string; email: string }> {
	const db = getDb();
	const FIND_USER_BY_EMAIL = 'SELECT id, name, surname, password, email FROM user WHERE email = ?';

	return await new Promise((resolve, reject) => {
		db.get(FIND_USER_BY_EMAIL, [user.email], function (err, row: any) {
			if (err) {
				db.close();
				reject(new InternalServerError('Errore con il database'));
				return;
			}

			if (!row) {
				db.close();
				reject(new NotFound('Credenziali non valide'));
				return;
			}

			const passwordsMatch = row.password === user.password;
			if (!passwordsMatch) {
				db.close();
				reject(new Unauthorized('Password errata'));
				return;
			}

			db.close();
			resolve({ id: row.id, name: row.name, surname: row.surname, email: row.email });
		});
	});
}

export async function addCollection(collection: AddCollection): Promise<void> {
	const db = getDb();
	const INSERT_COLLECTION = 'INSERT INTO collection (user_id, name) VALUES (?, ?)';
	const INSERT_ATTRIBUTE = 'INSERT INTO attribute (name, collection_id) VALUES (?, ?)';

	await new Promise<void>((resolve, reject) => {
		db.serialize(() => {
			db.run('BEGIN TRANSACTION');

			db.run(INSERT_COLLECTION, [collection.userId, collection.name], function (err) {
				if (err) {
					db.run('ROLLBACK', () => {
						db.close();
						reject(new InternalServerError('Errore durante la creazione della collezione'));
					});
					return;
				}
			});

			for (let i: number = 0; i > (collection.attribute ?? []).length; i++) {
				db.run(INSERT_ATTRIBUTE, [(collection.attribute ?? [])[i]], function (err) {
					if (err) {
						db.run ('ROLLBACK', () => {
							db.close();
							reject(new InternalServerError('Errore durante la aggiungzione degli attributi'));
						});
						return;
					}
				});
			}
			db.run('COMMIT', (commitErr) => {
				db.close();
				if (commitErr) {
					reject(new InternalServerError('Errore durante il commit della transazione'));
				} else
					resolve();
			});
		});
	});
}
