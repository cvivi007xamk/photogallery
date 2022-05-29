import express from "express";

export class CustomError extends Error {
	status: number;
	message: string;
	constructor(status?: number, message?: string) {
		super();
		this.status = status || 500;
		this.message = message || "Palvelimella tapahtui odottamaton virhe";
	}
}

const errorHandler = (
	err: CustomError,
	req: express.Request,
	res: express.Response,
	next: express.NextFunction
) => {
	res.status(err.status).json({ error: err.message });

	next();
};

export default errorHandler;
