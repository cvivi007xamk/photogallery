import React, { useEffect, useState } from "react";
import { Routes, Route } from "react-router-dom";
import Login from "./components/Login";
import Register from "./components/Register";
import MainView from "./components/MainView";
import NavigationBar from "./components/NavigationBar";
import { Container, CssBaseline } from "@mui/material";
import {
	ThemeProvider,
	createTheme,
	responsiveFontSizes,
} from "@mui/material/styles";
import {
	Comment,
	Comments,
	fetchSettings,
	LoggedInUser,
	Photo,
	Photos,
} from "./import/types";
import md5 from "crypto-js/md5";

let themeLight = createTheme({
	palette: {
		mode: "light",
		primary: {
			main: "#3fb0b5",
		},
		secondary: {
			main: "#f56000",
		},
		info: {
			main: "#6921f3",
		},
	},
});

themeLight = responsiveFontSizes(themeLight);

let themeDark = createTheme({
	palette: {
		mode: "dark",
		primary: {
			main: "#3fb0b5",
		},
		secondary: {
			main: "#f56000",
		},
		info: {
			main: "#6921f3",
		},
	},
});

themeDark = responsiveFontSizes(themeDark);

const App: React.FC = (): React.ReactElement => {
	const [themeIsLight, setThemeIsLight] = useState(true);

	const [login, setLogin] = useState<LoggedInUser>({
		token: String(localStorage.getItem("token")),
		user: String(localStorage.getItem("user")),
		userId: Number(localStorage.getItem("userId")),
		userEmail: String(
			localStorage.getItem("userEmail")?.toLowerCase().trim()
		),
		loggedIn: Boolean(localStorage.getItem("loggedIn")),
	});

	const [photoData, setPhotoData] = useState<Photos>({
		photos: [],
		error: "",
		loaded: false,
	});
	const [filter, setFilter] = useState<string>("");

	const [filteredPhotoData, setFilteredPhotoData] = useState<Photo[]>([]);

	const [commentData, setCommentData] = useState<Comments>({
		comments: [],
		error: "",
		loaded: false,
	});

	const [userFavorites, setUserFavorites] = useState<number[]>([]);

	// We use Gravatar to get the user's avatar
	let gravatarUrl: string = `https://www.gravatar.com/avatar/${md5(
		login.userEmail
	)}`;

	const [photoDialogOpen, setPhotoDialogOpen] = useState<boolean>(false);

	const apiPhotosFetch = async (
		method: string = "GET",
		body?: any,
		photoId?: number,
		searchTerm?: string
	): Promise<void> => {
		let url: string = photoId
			? `/api/photos/${photoId}`
			: searchTerm
			? `/api/photos?keyword=${searchTerm.toLowerCase().trim()}`
			: `/api/photos`;
		let settings: fetchSettings = {
			method: method || "GET",
			headers: {
				Authorization: `Bearer ${login.token}`,
			},
		};

		if (method === "POST") {
			settings = {
				...settings,
				body: body,
			};
		}

		if (method === "PUT") {
			settings = {
				...settings,
				headers: {
					...settings.headers,
					"Content-Type": "application/json",
				},
				body: JSON.stringify(body),
			};
		}
		try {
			const response = await fetch(url, settings);

			if (response.status === 200) {
				let data = await response.json();
				setPhotoData({
					...photoData,
					photos: data,
					loaded: true,
				});
			} else {
				let errorText: string = "";

				switch (response.status) {
					case 400:
						errorText = "Virhe pyynnön tiedoissa";
						break;
					case 401:
						errorText = "Virhe tunnistautumisessa";
						break;
					default:
						errorText = "Palvelimella tapahtui odottamaton virhe!";
						break;
				}

				setPhotoData({
					...photoData,
					error: errorText,
					loaded: true,
				});
			}
		} catch (error: any) {
			console.log(error);
			setPhotoData({
				...photoData,
				error: "Palvelimeen ei saada yhteyttä",
				loaded: true,
			});
		}
	};

	const apiFavoritesFetch = async (
		method: string = "GET",
		photoId?: number,
		userId?: number,
		markAsFavorite?: boolean
	): Promise<void> => {
		let url = userId ? `/api/favorites/${userId}` : `/api/favorites`;
		let settings: fetchSettings = {
			method: method || "GET",
			headers: {
				Authorization: `Bearer ${login.token}`,
			},
		};

		if (method === "POST" || method === "PUT") {
			settings = {
				...settings,
				headers: {
					...settings.headers,
					"Content-Type": "application/json",
				},

				body: JSON.stringify({
					markAsFavorite: markAsFavorite,
					photoId: photoId,
				}),
			};
		}
		try {
			const response = await fetch(url, settings);

			if (response.status === 200) {
				let favorites = await response.json();
				setUserFavorites(favorites);
			} else {
				let errorText: string = "";

				switch (response.status) {
					case 400:
						errorText = "Virhe pyynnön tiedoissa";
						break;
					case 401:
						errorText = "Virhe tunnistautumisessa";
						break;
					default:
						errorText = "Palvelimella tapahtui odottamaton virhe!";
						break;
				}
				console.log(errorText);
			}
		} catch (error: any) {
			console.log(error);
		}
	};

	const apiCommentsFetch = async (
		method: string = "GET",
		comment?: Comment,
		id?: number
	): Promise<void> => {
		let url = id ? `/api/comments/${id}` : `/api/comments`;

		let settings: fetchSettings = {
			method: method || "GET",
			headers: {
				Authorization: `Bearer ${login.token}`,
			},
		};

		if (method === "POST" || method === "PUT") {
			settings = {
				...settings,
				headers: {
					...settings.headers,
					"Content-Type": "application/json",
				},
				body: JSON.stringify(comment),
			};
		}

		try {
			const response = await fetch(url, settings);

			if (response.status === 200) {
				let data = await response.json();
				setCommentData({
					...commentData,
					comments: data,
					loaded: true,
				});
			} else {
				let errorText: string = "";

				switch (response.status) {
					case 400:
						errorText = "Virhe pyynnön tiedoissa";
						break;
					case 401:
						errorText = "Kirjaudu sisään lukeaksi kommentteja.";
						break;
					default:
						errorText = "Palvelimella tapahtui odottamaton virhe";
						break;
				}

				setCommentData({
					...commentData,
					error: errorText,
					loaded: true,
				});
			}
		} catch (error: any) {
			console.log(error);
			setCommentData({
				...commentData,
				error: "Palvelimeen ei saada yhteyttä",
				loaded: true,
			});
		}
	};

	const filterPhotos = (filterCondition: string): void => {
		let photos: Photo[] = photoData.photos;
		let comments: Comment[] = commentData.comments;
		let filteredPhotos: Photo[] = [];

		if (filterCondition === "My Photos") {
			filteredPhotos = photos.filter((photo: Photo): boolean => {
				return photo.userId === login.userId;
			});
		} else if (filterCondition === "My Favorites") {
			filteredPhotos = photos.filter((photo: Photo) => {
				return userFavorites.includes(photo.id);
			});
		} else if (filterCondition === "My Comments") {
			console.log(photos);
			console.log(comments);
			filteredPhotos = photos.filter((photo: Photo) => {
				return comments
					.filter((comment: any) => {
						return comment.photoId === photo.id;
					})
					.some((comment: any): boolean => {
						return comment.userId === login.userId;
					});
			});
		} else {
			filteredPhotos = photos;
		}
		setFilteredPhotoData(filteredPhotos);
	};

	// We filter the photos every time the filter changes and every time the photoData changes.
	useEffect(
		() => {
			filterPhotos(filter);
		},
		// eslint-disable-next-line
		[filter, photoData.photos]
	);

	// We fetch the comments and photos on load (and favorites if the user is logged in). And update them when user changes (happens at login/register).
	useEffect(() => {
		apiPhotosFetch();
		apiCommentsFetch();
		apiFavoritesFetch("GET", undefined, login.userId);
		// eslint-disable-next-line
	}, [login.userId]);

	return (
		<React.Fragment>
			<ThemeProvider theme={themeIsLight ? themeLight : themeDark}>
				<Container maxWidth={false} disableGutters>
					<CssBaseline />
					<NavigationBar
						login={login}
						setLogin={setLogin}
						apiPhotosFetch={apiPhotosFetch}
						setPhotoDialogOpen={setPhotoDialogOpen}
						gravatarUrl={gravatarUrl}
						setFilter={setFilter}
						themeIsLight={themeIsLight}
						setThemeIsLight={setThemeIsLight}
					/>
					<Routes>
						<Route
							path="/"
							element={
								<MainView
									login={login}
									photoData={photoData}
									commentData={commentData}
									apiCommentsFetch={apiCommentsFetch}
									apiPhotosFetch={apiPhotosFetch}
									photoDialogOpen={photoDialogOpen}
									setPhotoDialogOpen={setPhotoDialogOpen}
									gravatarUrl={gravatarUrl}
									userFavorites={userFavorites}
									apiFavoritesFetch={apiFavoritesFetch}
									filteredPhotoData={filteredPhotoData}
								/>
							}
						/>
						<Route
							path="/login"
							element={
								<Login
									login={login}
									setLogin={setLogin}
									apiCommentsFetch={apiCommentsFetch}
									apiFavoritesFetch={apiFavoritesFetch}
									apiPhotosFetch={apiPhotosFetch}
								/>
							}
						/>
						<Route
							path="/signup"
							element={
								<Register
									login={login}
									setLogin={setLogin}
									apiCommentsFetch={apiCommentsFetch}
									apiFavoritesFetch={apiFavoritesFetch}
									apiPhotosFetch={apiPhotosFetch}
								/>
							}
						/>
					</Routes>
				</Container>
			</ThemeProvider>
		</React.Fragment>
	);
};

export default App;
