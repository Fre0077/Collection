import sqlite3 from 'sqlite3';
import path from 'path';

import { Register, Login, AddCollection, GetCollection, AddAttribute, AddItem } from './interface';
import { BadRequest, Unauthorized, Forbidden, NotFound, Conflict, InternalServerError } from './exception';
import { logError } from './logger';

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
	const SELECT_USER_BY_EMAIL = 'SELECT id, name, surname, password, email FROM user WHERE email = ?';

	return await new Promise((resolve, reject) => {
		db.get(SELECT_USER_BY_EMAIL, [user.email], function (err, row: any) {
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
	const	db = getDb();
	const	INSERT_COLLECTION = 'INSERT INTO collection (user_id, name) VALUES (?, ?)';
	const	INSERT_ATTRIBUTE = 'INSERT INTO attribute (name, collection_id) VALUES (?, ?)';

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
				const collectionId = this.lastID;
				for (let i: number = 0; i < (collection.attribute ?? []).length; i++) {
					db.run(INSERT_ATTRIBUTE, [(collection.attribute ?? [])[i], collectionId], function (err) {
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
	});
}

export async function getCollection(userId: number): Promise<GetCollection> {
	const	db = getDb();
	const	SELECT_COLLECTION_BY_USERID = "SELECT id, name FROM collection WHERE user_id = ?";
	let		collections: GetCollection = { collectionId: [], name: [] };
	
	await new Promise<void>((resolve, reject) => {
		db.all(SELECT_COLLECTION_BY_USERID, [userId], function(err, rows: any[]) {
			if (err) {
				db.close();
				reject(new InternalServerError('Errore durante la ricerca delle collezioni'));
				return;
			}
			collections.collectionId = rows.map(row => row.id);
			collections.name = rows.map(row => row.name);
			db.close();
			resolve();
		});
	});
	return collections;
}

export async function addAttribute(addAttribute: AddAttribute): Promise<void> {
	const db = getDb();
	const INSERT_ATTRIBUTE = 'INSERT INTO attribute (name, collection_id) VALUES (?, ?)';
	
	await new Promise<void>((resolve, reject) => {
		db.run(INSERT_ATTRIBUTE, [addAttribute.attribute, addAttribute.collectionId], function (err) {
			if (err) {
				db.close();
				reject(new InternalServerError('Errore durante la aggiungzione degli attributi'));
				return;
			}
			resolve();
		});
	});
}

export async function getAttribute(collectionId: number): Promise<string[]> {
	const	db = getDb();
	const	SELECT_ATTRIBUTE_BY_COLLECTIONID = "SELECT name FROM attribute WHERE collection_id = ?";
	let		attributes: string[] = [];
	
	await new Promise<void>((resolve, reject) => {
		db.all(SELECT_ATTRIBUTE_BY_COLLECTIONID, [collectionId], function(err, row: any) {
			if (err) {
				db.run('ROLLBACK', () => {
					db.close();
					reject(new InternalServerError('Errore durante la ricerca degli attributi'));
				});
				return;
			}
			attributes = row;
			resolve();
		});
	});
	return attributes;
}

export async function addItem(addItem: AddItem): Promise<void> {
	const db = getDb();
	const INSERT_ITEM = 'INSERT INTO item (collection_id) VALUES (?)';
	const SELECT_ATTRIBUTE = 'SELECT id FROM attribute WHERE collection_id = ?';
	const INSERT_ITEM_ATTRIBUTE = 'INSERT INTO item_attribute (item_id, attribute_id, value) VALUES (?, ?, ?)';

	await new Promise<void>((resolve, reject) => {
		db.serialize(() => {
			db.run('BEGIN TRANSACTION');

			db.run(INSERT_ITEM, [addItem.collectionId], function (err) {
				if (err) {
					db.run('ROLLBACK', () => {
						db.close();
						reject(new InternalServerError('Errore durante la aggiunta dell\'item'));
					});
					return;
				}
				const itemId = this.lastID as number;

				db.all(SELECT_ATTRIBUTE, [addItem.collectionId], function (err, rows: any[]) {
					if (err) {
						db.run('ROLLBACK', () => {
							db.close();
							reject(new InternalServerError('Errore durante la ricerca degli attributi della collezione'));
						});
						return;
					}
					const attributeIds = rows.map(r => r.id);
					const values = addItem.attribute ?? [];

					for (let i = 0; i < values.length; i++) {
						db.run(INSERT_ITEM_ATTRIBUTE, [itemId, attributeIds[i], values[i]], function (err) {
							if (err) {
								db.run('ROLLBACK', () => {
									db.close();
									reject(new InternalServerError('Errore durante la aggiunta degli item_attribute'));
								});
								return;
							}
						});
					}

					db.run('COMMIT', (commitErr) => {
						db.close();
						if (commitErr) {
							reject(new InternalServerError('Errore durante il commit della transazione'));
						} else {
							resolve();
						}
					});
				});
			});
		});
	});
}

export async function getItem(collection_id: number): Promise<string[][]> {
	const	db = getDb();
	const	SELECT_ITEMS_ATTRIBUTES = "SELECT i.id, ia.value FROM item i JOIN item_attribute ia ON i.id = ia.item_id WHERE i.collection_id = ? ORDER BY i.id, ia.id";
	let		items: string[][] = [];
	
	await new Promise<void>((resolve, reject) => {
		db.all(SELECT_ITEMS_ATTRIBUTES, [collection_id], function(err, rows: any[]) {
			if (err) {
				db.close();
				reject(new InternalServerError('Errore durante la ricerca degli item'));
				return;
			}
			
			let currentItemId: number = -1;
			let currentAttributes: string[] = [];
			
			for (let row of rows) {
				if (row.id !== currentItemId) {
					if (currentItemId !== -1) {
						items.push([...currentAttributes]);
					}
					currentItemId = row.id;
					currentAttributes = [];
				}
				currentAttributes.push(row.value);
			}
			
			if (currentItemId !== -1) {
				items.push(currentAttributes);
			}
			
			db.close();
			resolve();
		});
	});
	return items;
}