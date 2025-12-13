import { logError } from './logger';

export class Generic extends Error {
	statusCode: number;
	constructor(message = "errore generico", statusCode = 500) {
		super(message);
		this.name = "Generic";
		this.statusCode = statusCode;
		try {
			logError(`[${this.statusCode}] ${message}`);
		} catch (_) {}
	}
}

export class internalServerError extends Generic {
	constructor(message = "Errore interno del server") {
		super(message, 500);
		this.name = "internalServerError";
	}
}