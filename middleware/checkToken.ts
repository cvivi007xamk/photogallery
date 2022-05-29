import express from "express";
import jwt from "jsonwebtoken";

const checkToken = (
	req: express.Request,
	res: express.Response,
	next: express.NextFunction
) => {
	try {
		let token: string = req.headers.authorization!.split(" ")[1];

		res.locals.kayttaja = jwt.verify(
			token,
			String(process.env.ACCESS_TOKEN_KEY)
		);
		next();
	} catch (e: any) {
		res.status(401).json("Not logged in.");
	}
};

export default checkToken;
