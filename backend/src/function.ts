import sqlite3 from 'sqlite3';
import {newUser} from './interface';
import {internalServerError} from './exception';

function getDb(): sqlite3.Database {
	sqlite3.verbose();
	return new sqlite3.Database('../database/database.sqlite');
}

export async function addUser(user: newUser): Promise<void> {
	const db = getDb();
	const INSERT_USER = 'INSERT INTO user(name, surname, password) VALUES (?, ?, ?)';
	const params = [user.name, user.surname, user.password];

	await new Promise<void>((resolve, reject) => {
		db.run(INSERT_USER, params, function (err) {
			if (err) {
				db.close();
				reject(new internalServerError('Errore con il database'));
				return;
			}
			db.close();
			resolve();
		});
	});
}