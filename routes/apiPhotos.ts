import express from "express";
import { CustomError } from "../errors/errorHandler";
import { PrismaClient } from "@prisma/client";
import multer from "multer";
import crypto from "crypto";
import checkToken from "../middleware/checkToken";
import s3Uploadv2 from "../middleware/s3Service";
import dotenv from "dotenv";

dotenv.config();

const prisma: PrismaClient = new PrismaClient();

//Upload to localmachine. Heroku deletes public files once a day
/*
const storage = multer.diskStorage({
	destination: function (req, file, cb) {
		cb(null, "./public/photos/");
	},
	filename: function (req, file, cb) {
		const randomName = crypto.randomBytes(16).toString("hex");
		const fileExtension = file.mimetype.split("/").pop();
		const filenameString = `${randomName}.${fileExtension}`;
		cb(null, filenameString);
	},
});

const upload = multer({ storage: storage });

*/

const storage = multer.memoryStorage();

const fileFilter = (req: any, file: any, cb: any) => {
	if (file.mimetype.split("/")[0] === "image") {
		cb(null, true);
	} else {
		cb(new multer.MulterError("LIMIT_UNEXPECTED_FILE"), false);
	}
};

const upload = multer({
	storage,
	fileFilter,
	limits: { fileSize: 1024 * 1024 * 5, files: 2 },
});

const apiPhotosRouter: express.Router = express.Router();

apiPhotosRouter.use(express.json());

const md5 = (data: any) => crypto.createHash("md5").update(data).digest("hex");

apiPhotosRouter.post(
	"/",
	checkToken,
	upload.array("uploaded_file"),
	async (
		req: express.Request,
		res: express.Response,
		next: express.NextFunction
	) => {
		try {
			console.log(req.files);
			const results = await s3Uploadv2(req.files);
			console.log(results);
			console.log(req.body);

			let keywords: string[] = req.body.keywords
				.toLowerCase()
				.split(",")
				.map((keyword: string) => keyword.trim());

			const newPhoto = await prisma.photo.create({
				data: {
					filename: results[0].key,
					userId: Number(req.body.userId),
					timestamp: new Date(),
					caption: req.body.caption,
					keywords: {
						connectOrCreate: keywords.map((keyword) => {
							return {
								where: { keyword: keyword },
								create: { keyword: keyword },
							};
						}),
					},
				},
			});
			const data = await prisma.photo.findMany({
				include: {
					poster: {
						select: {
							username: true,
							email: true,
						},
					},
					keywords: true,

					_count: {
						select: { favorites: true, comments: true },
					},
				},
				orderBy: {
					timestamp: "desc",
				},
			});
			let hashedData = data.map((photo: any) => {
				return {
					...photo,
					poster: {
						...photo.poster,
						email: md5(photo.poster.email),
					},
				};
			});

			res.json(hashedData);
		} catch (err) {
			console.log(err);
		}
	}
);

apiPhotosRouter.get(
	"/",
	async (
		req: express.Request,
		res: express.Response,
		next: express.NextFunction
	) => {
		try {
			const data = await prisma.photo.findMany({
				// If there is a query string, then we want to filter the results
				where: req.query.keyword
					? {
							keywords: {
								some: {
									keyword: {
										contains: String(req.query.keyword),
									},
								},
							},
					  }
					: undefined, // If there is no query string, then we don't want to filter the results (Prisma uses undefined to mean "don't filter")

				include: {
					poster: {
						select: {
							username: true,
							email: true,
						},
					},
					keywords: true,

					_count: {
						select: { favorites: true, comments: true },
					},
				},
				orderBy: {
					timestamp: "desc",
				},
			});
			let hashedData = data.map((photo: any) => {
				return {
					...photo,
					poster: {
						...photo.poster,
						email: md5(photo.poster.email),
					},
				};
			});

			res.json(hashedData);
		} catch (error: any) {
			console.log(error);
			next(new CustomError());
		}
	}
);

apiPhotosRouter.delete(
	"/:photoId",
	checkToken,

	async (
		req: express.Request,
		res: express.Response,
		next: express.NextFunction
	) => {
		try {
			if (
				// We check if the photo exists and if the user is the owner of the photo
				(await prisma.photo.count({
					where: {
						AND: [
							{
								id: Number(req.params.photoId),
							},
							{
								userId: Number(res.locals.kayttaja.id),
							},
						],
					},
				})) === 1
			) {
				const deletedPhoto = await prisma.photo.delete({
					where: {
						id: Number(req.params.photoId),
					},
				});

				const data = await prisma.photo.findMany({
					include: {
						poster: {
							select: {
								username: true,
								email: true,
							},
						},
						keywords: true,

						_count: {
							select: { favorites: true, comments: true },
						},
					},
					orderBy: {
						timestamp: "desc",
					},
				});

				let hashedData = data.map((photo: any) => {
					return {
						...photo,
						poster: {
							...photo.poster,
							email: md5(photo.poster.email),
						},
					};
				});

				res.json(hashedData);
			}
		} catch (e: any) {
			console.log(e);
			next(new CustomError());
		}
	}
);

apiPhotosRouter.get(
	"/:id",
	async (
		req: express.Request,
		res: express.Response,
		next: express.NextFunction
	) => {
		try {
			if (
				(await prisma.photo.count({
					where: {
						id: Number(req.params.id),
					},
				})) === 1
			) {
				const data = await prisma.photo.findUnique({
					where: {
						id: Number(req.params.id),
					},
					include: {
						poster: {
							select: {
								username: true,
								email: true,
							},
						},
						keywords: true,

						_count: {
							select: { favorites: true, comments: true },
						},
					},
				});
				let hashedData = {
					...data,

					poster: {
						...data?.poster,
						email: md5(data?.poster.email),
					},
				};
				res.json(hashedData);
			} else {
				next(new CustomError(400, "Virheellinen id"));
			}
		} catch (e: any) {
			console.log(e);
			next(new CustomError());
		}
	}
);

// Lets leave these here if I want to later filter the photos at the backend (and not in the frontend).

/*
apiPhotosRouter.get(
	"/posted/:id",
	async (
		req: express.Request,
		res: express.Response,
		next: express.NextFunction
	) => {
		try {
			if (res.locals.kayttaja.id === Number(req.params.id)) {
				const data = await prisma.photo.findMany({
					where: {
						poster: {
							id: Number(req.params.id),
						},
					},
					include: {
						poster: {
							select: {
								username: true,
								email: true,
							},
						},
						keywords: true,
						comments: true,
						favorites: {
							select: {
								username: true,
								id: true,
							},
						},
						_count: {
							select: { favorites: true, comments: true },
						},
					},
				});
				let hashedData = data.map((photo: any) => {
					return {
						...photo,
						poster: {
							...photo.poster,
							email: md5(photo.poster.email),
						},
					};
				});

				res.json(hashedData);
			} else {
				throw "Ei oikeuksia";
			}
		} catch (e: any) {
			console.log(e);
			next(new CustomError(401, e));
		}
	}
);

apiPhotosRouter.get(
	"/favorited/:id",
	async (
		req: express.Request,
		res: express.Response,
		next: express.NextFunction
	) => {
		try {
			if (res.locals.kayttaja.id === Number(req.params.id)) {
				const data = await prisma.photo.findMany({
					where: {
						favorites: {
							some: {
								id: Number(req.params.id),
							},
						},
					},
					include: {
						poster: {
							select: {
								username: true,
								email: true,
							},
						},
						keywords: true,
						comments: true,
						favorites: {
							select: {
								username: true,
								id: true,
							},
						},
						_count: {
							select: { favorites: true, comments: true },
						},
					},
				});
				let hashedData = data.map((photo: any) => {
					return {
						...photo,
						poster: {
							...photo.poster,
							email: md5(photo.poster.email),
						},
					};
				});

				res.json(hashedData);
			} else {
				throw "Ei oikeuksia";
			}
		} catch (e: any) {
			console.log(e);
			next(new CustomError(401, e));
		}
	}
);

apiPhotosRouter.get(
	"/commented/:id",
	async (
		req: express.Request,
		res: express.Response,
		next: express.NextFunction
	) => {
		try {
			if (res.locals.kayttaja.id === Number(req.params.id)) {
				const data = await prisma.photo.findMany({
					where: {
						comments: {
							some: {
								userId: Number(req.params.id),
							},
						},
					},
					include: {
						poster: {
							select: {
								username: true,
								email: true,
							},
						},
						keywords: true,
						comments: true,
						favorites: {
							select: {
								username: true,
								id: true,
							},
						},
						_count: {
							select: { favorites: true, comments: true },
						},
					},
				});
				let hashedData = data.map((photo: any) => {
					return {
						...photo,
						poster: {
							...photo.poster,
							email: md5(photo.poster.email),
						},
					};
				});

				res.json(hashedData);
			} else {
				throw "Ei oikeuksia";
			}
		} catch (e: any) {
			console.log(e);
			next(new CustomError(401, e));
		}
	}
);

*/
apiPhotosRouter.put(
	"/:photoId",
	checkToken,
	async (
		req: express.Request,
		res: express.Response,
		next: express.NextFunction
	) => {
		try {
			if (res.locals.kayttaja.id === Number(req.body.userId)) {
				if (req.body.favorite === false) {
					const updatedPhoto = await prisma.photo.update({
						where: {
							id: Number(req.params.photoId),
						},
						data: {
							favorites: {
								connect: { id: Number(req.body.userId) },
							},
						},
					});
				} else if (req.body.favorite === true) {
					const updatedPhoto = await prisma.photo.update({
						where: {
							id: Number(req.params.photoId),
						},
						data: {
							favorites: {
								disconnect: { id: Number(req.body.userId) },
							},
						},
					});
				}

				const data = await prisma.photo.findMany({
					include: {
						poster: {
							select: {
								username: true,
								email: true,
							},
						},
						keywords: true,

						_count: {
							select: { favorites: true, comments: true },
						},
					},
					orderBy: {
						timestamp: "desc",
					},
				});

				let hashedData = data.map((photo: any) => {
					return {
						...photo,
						poster: {
							...photo.poster,
							email: md5(photo.poster.email),
						},
					};
				});
				res.json(hashedData);
			}
		} catch (e: any) {
			next(new CustomError());
		}
	}
);

export default apiPhotosRouter;
