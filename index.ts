import express from "express";
import path from "path";
import apiPhotosRouter from "./routes/apiPhotos";
import apiCommentsRouter from "./routes/apiComments";
import apiAuthRouter from "./routes/apiAuth";
import errorHandler from "./errors/errorHandler";
import dotenv from "dotenv";
import checkToken from "./middleware/checkToken";
import apiFavoritesRouter from "./routes/apiFavorites";
var bodyParser = require("body-parser");

dotenv.config();

const app: express.Application = express();

const PORT: number = Number(process.env.PORT);

app.use(bodyParser.json({ limit: "5mb" }));
app.use(
	bodyParser.urlencoded({
		limit: "5mb",
		extended: true,
		parameterLimit: 50000,
	})
);

app.use(express.static(path.resolve(__dirname, "public")));

app.use("/api/auth", apiAuthRouter);

app.use("/api/photos", apiPhotosRouter);

app.use("/api/comments", checkToken, apiCommentsRouter);

app.use("/api/favorites", checkToken, apiFavoritesRouter);

app.use(errorHandler);

app.use(
	(
		req: express.Request,
		res: express.Response,
		next: express.NextFunction
	) => {
		if (!res.headersSent) {
			res.status(404).json({ viesti: "Virheellinen reitti" });
		}

		next();
	}
);
app.use(
	(
		err: any,
		req: express.Request,
		res: express.Response,
		next: express.NextFunction
	) => {
		res.locals.error = err;
		const status = err.status || 500;
		res.status(status);
	}
);

app.listen(PORT, () => {
	console.log(`Server running on port ${PORT}`);
});
