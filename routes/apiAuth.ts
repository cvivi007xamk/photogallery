import express from "express";
import { PrismaClient } from "@prisma/client";
import { CustomError } from "../errors/errorHandler";
import jwt from "jsonwebtoken";
import crypto from "crypto";
import dotenv from "dotenv";

dotenv.config();

const apiAuthRouter: express.Router = express.Router();

const prisma: PrismaClient = new PrismaClient();

apiAuthRouter.use(express.json());

apiAuthRouter.post(
	"/login",
	async (
		req: express.Request,
		res: express.Response,
		next: express.NextFunction
	): Promise<void> => {
		try {
			const user = await prisma.user.findFirst({
				where: {
					username: req.body.username,
				},
			});

			if (req.body.username === user?.username) {
				let hash = crypto
					.createHash("SHA512")
					.update(req.body.password)
					.digest("hex");

				if (hash === user?.password) {
					let token = jwt.sign(
						{
							id: user.id,
							username: user.username,
							email: user.email,
						},
						String(process.env.ACCESS_TOKEN_KEY),
						{ expiresIn: "365d" }
					);

					res.json({ token: token });
				} else {
					next(
						new CustomError(
							401,
							"Virheellinen käyttäjätunnus tai salasana"
						)
					);
				}
			} else {
				next(
					new CustomError(
						401,
						"Virheellinen käyttäjätunnus tai salasana"
					)
				);
			}
		} catch (error: any) {
			console.log(error);

			next(new CustomError());
		}
	}
);

apiAuthRouter.post(
	"/signup",
	async (
		req: express.Request,
		res: express.Response,
		next: express.NextFunction
	): Promise<void> => {
		try {
			const user = await prisma.user.findFirst({
				where: {
					username: req.body.username,
				},
			});
			if (user) {
				new CustomError(401, "Käyttäjätunnus on jo käytössä");
			}

			let hashedPassword = crypto
				.createHash("SHA512")
				.update(req.body.password)
				.digest("hex");

			const newUser = await prisma.user.create({
				data: {
					username: req.body.username,
					password: hashedPassword,
					email: req.body.email,
				},
			});

			let token = jwt.sign(
				{
					id: newUser.id,
					username: newUser.username,
				},
				String(process.env.ACCESS_TOKEN_KEY),
				{ expiresIn: "365d" }
			);

			res.json({ token: token });
		} catch (error: any) {
			console.log(error);
			next(new CustomError());
		}
	}
);

export default apiAuthRouter;
