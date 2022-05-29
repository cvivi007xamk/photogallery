import express from "express";
import { CustomError } from "../errors/errorHandler";
import { PrismaClient } from "@prisma/client";

const prisma: PrismaClient = new PrismaClient();

const apiFavoritesRouter: express.Router = express.Router();

apiFavoritesRouter.use(express.json());

apiFavoritesRouter.put(
	"/:userId",

	async (
		req: express.Request,
		res: express.Response,
		next: express.NextFunction
	) => {
		try {
			if (res.locals.kayttaja.id === Number(req.params.userId)) {
				if (req.body.markAsFavorite) {
					const updatedPhoto = await prisma.photo.update({
						where: {
							id: Number(req.body.photoId),
						},
						data: {
							favorites: {
								connect: { id: Number(req.params.userId) },
							},
						},
					});
				} else {
					const updatedPhoto = await prisma.photo.update({
						where: {
							id: Number(req.body.photoId),
						},
						data: {
							favorites: {
								disconnect: { id: Number(req.params.userId) },
							},
						},
					});
				}

				const data = await prisma.photo.findMany({
					where: {
						favorites: {
							some: {
								id: Number(req.params.userId),
							},
						},
					},
					select: {
						id: true,
					},
				});
				let favoriteArray = data.map((photo: any) => {
					return photo.id;
				});
				res.json(favoriteArray);
			}
		} catch (e: any) {
			next(new CustomError());
		}
	}
);

apiFavoritesRouter.get(
	"/:userId",
	async (
		req: express.Request,
		res: express.Response,
		next: express.NextFunction
	) => {
		try {
			if (res.locals.kayttaja.id === Number(req.params.userId)) {
				const data = await prisma.photo.findMany({
					where: {
						favorites: {
							some: {
								id: Number(req.params.userId),
							},
						},
					},
					select: {
						id: true,
					},
				});
				let favoriteArray = data.map((photo: any) => {
					return photo.id;
				});
				res.json(favoriteArray);
				console.log(favoriteArray);
			}
		} catch (e: any) {
			console.log(e);
			next(new CustomError());
		}
	}
);

export default apiFavoritesRouter;
