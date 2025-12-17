import { logError } from "./logger";

export class BadRequest extends Error {
	statusCode: number;

	constructor(message = "The server could not understand the request due to invalid syntax", statusCode = 400) {
		super(message);
		this.name = "BadRequest";
		this.statusCode = statusCode;
		this.log();
	}

	private log() {
		logError(`[${this.statusCode}] ${this.message}`);
	}
}

export class Unauthorized extends Error {
	statusCode: number;

	constructor(message = "Authentication is required and has failed or has not been provided", statusCode = 401) {
		super(message);
		this.name = "Unauthorized";
		this.statusCode = statusCode;
		this.log();
	}

	private log() {
		logError(`[${this.statusCode}] ${this.message}`);
	}
}

export class Forbidden extends Error {
	statusCode: number;

	constructor(message = "The server understood the request but refuses to authorize it", statusCode = 403) {
		super(message);
		this.name = "Forbidden";
		this.statusCode = statusCode;
		this.log();
	}

	private log() {
		logError(`[${this.statusCode}] ${this.message}`);
	}
}

export class NotFound extends Error {
	statusCode: number;

	constructor(message = "The server cannot find the requested resource", statusCode = 404) {
		super(message);
		this.name = "NotFound";
		this.statusCode = statusCode;
		this.log();
	}

	private log() {
		logError(`[${this.statusCode}] ${this.message}`);
	}
}

export class Conflict extends Error {
	statusCode: number;

	constructor(message = "The request conflicts with the current state of the server", statusCode = 409) {
		super(message);
		this.name = "Conflict";
		this.statusCode = statusCode;
		this.log();
	}

	private log() {
		logError(`[${this.statusCode}] ${this.message}`);
	}
}

export class InternalServerError extends Error {
	statusCode: number;

	constructor(message = "The server had an unexpected error", statusCode = 500) {
		super(message);
		this.name = "InternalServerError";
		this.statusCode = statusCode;
		this.log();
	}

	private log() {
		logError(`[${this.statusCode}] ${this.message}`);
	}
}