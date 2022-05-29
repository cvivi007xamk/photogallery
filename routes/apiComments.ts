import express from "express";
import { CustomError } from "../errors/errorHandler";
import { PrismaClient } from "@prisma/client";

const prisma: PrismaClient = new PrismaClient();

const apiCommentsRouter: express.Router = express.Router();

apiCommentsRouter.use(express.json());

apiCommentsRouter.post(
	"/",
	async (
		req: express.Request,
		res: express.Response,
		next: express.NextFunction
	) => {
		try {
			const newComment = await prisma.comment.create({
				data: {
					photo: {
						connect: { id: req.body.photoId },
					},
					commenter: {
						connect: { id: req.body.userId },
					},
					commentText: req.body.commentText,
					timestamp: req.body.timestamp,
				},
			});

			res.json(
				await prisma.comment.findMany({
					include: {
						commenter: {
							select: {
								username: true,
							},
						},
					},
				})
			);
		} catch (e: any) {
			console.log(e);
			next(new CustomError());
		}
	}
);

apiCommentsRouter.get(
	"/:userId",
	async (
		req: express.Request,
		res: express.Response,
		next: express.NextFunction
	) => {
		try {
			if (res.locals.kayttaja.id === Number(req.params.userId)) {
				res.json(
					await prisma.comment.findMany({
						where: {
							userId: Number(req.params.userId),
						},
						include: {
							commenter: {
								select: {
									username: true,
								},
							},
						},
					})
				);
			}
		} catch (e: any) {
			next(new CustomError());
		}
	}
);

apiCommentsRouter.delete(
	"/:commentId",
	async (
		req: express.Request,
		res: express.Response,
		next: express.NextFunction
	) => {
		try {
			if (
				// We check if the comment exists and if the user is the owner of the comment
				(await prisma.comment.count({
					where: {
						AND: [
							{
								id: Number(req.params.commentId),
							},
							{
								userId: Number(res.locals.kayttaja.id),
							},
						],
					},
				})) === 1
			) {
				const deletedComment = await prisma.comment.delete({
					where: {
						id: Number(req.params.commentId),
					},
				});

				res.json(
					await prisma.comment.findMany({
						include: {
							commenter: {
								select: {
									username: true,
								},
							},
						},
					})
				);
			}
		} catch (e: any) {
			next(new CustomError());
		}
	}
);

apiCommentsRouter.put(
	"/:commentId",
	async (
		req: express.Request,
		res: express.Response,
		next: express.NextFunction
	) => {
		try {
			if (
				// We check if the comment exists and if the user is the owner of the comment
				(await prisma.comment.count({
					where: {
						AND: [
							{
								id: Number(req.params.commentId),
							},
							{
								userId: Number(res.locals.kayttaja.id),
							},
						],
					},
				})) === 1
			) {
				const updatedComment = await prisma.comment.update({
					where: {
						id: Number(req.params.commentId),
					},
					data: {
						commentText: req.body.commentText,
						timestamp: req.body.timestamp,
					},
				});

				res.json(
					await prisma.comment.findMany({
						include: {
							commenter: {
								select: {
									username: true,
								},
							},
						},
					})
				);
			}
		} catch (e: any) {
			next(new CustomError());
		}
	}
);

apiCommentsRouter.get(
	"/",
	async (
		req: express.Request,
		res: express.Response,
		next: express.NextFunction
	) => {
		try {
			res.json(
				await prisma.comment.findMany({
					include: {
						commenter: {
							select: {
								username: true,
							},
						},
					},
				})
			);
		} catch (e: any) {
			next(new CustomError());
		}
	}
);

export default apiCommentsRouter;
