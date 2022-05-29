import React, { useState, Dispatch, SetStateAction } from "react";
import {
	Alert,
	Backdrop,
	CircularProgress,
	Typography,
	Box,
} from "@mui/material";
import PhotoCard from "./PhotoCard";
import CommentDialog from "./CommentDialog";
import QuickCommentDialog from "./QuickCommentDialog";
import { LoggedInUser, Photos, Photo, Comments } from "../import/types";
import UploadDialog from "./UploadDialog";

interface Props {
	login: LoggedInUser;
	photoData: Photos;
	commentData: Comments;
	apiCommentsFetch: any;
	apiPhotosFetch: any;
	photoDialogOpen: boolean;
	setPhotoDialogOpen: Dispatch<SetStateAction<boolean>>;
	gravatarUrl: string;
	apiFavoritesFetch: any;
	userFavorites: number[];
	filteredPhotoData: Photo[];
}

const MainView: React.FC<Props> = (props: Props): React.ReactElement => {
	const [dialogOpen, setDialogOpen] = useState<boolean>(false);
	const [dialogPhoto, setDialogPhoto] = useState<Photo>();

	const handleDialogOpen = (photo: Photo) => {
		setDialogOpen(true);
		setDialogPhoto(photo);
	};
	const [quickDialogOpen, setQuickDialogOpen] = useState<boolean>(false);

	const handleQuickDialogOpen = (photo: Photo) => {
		setQuickDialogOpen(true);
		setDialogPhoto(photo);
	};
	console.log(props.filteredPhotoData);

	return (
		<Box
			sx={{
				margin: "auto",
				marginTop: 0,
				marginBottom: 5,
				px: 3,
			}}
		>
			<Typography
				variant="h4"
				sx={{ marginBottom: 2, marginTop: 2, textAlign: "center" }}
			>
				{props.login.loggedIn
					? `Welcome ${props.login.user}!`
					: `Welcome visitor!`}
			</Typography>
			{Boolean(props.photoData.error) ? (
				<Alert severity="error">{props.photoData.error}</Alert>
			) : !props.photoData.loaded ? (
				<Backdrop open={true}>
					<CircularProgress color="inherit" />
				</Backdrop>
			) : (
				props.filteredPhotoData
					?.sort(
						(b, a) =>
							new Date(a.timestamp).valueOf() -
							new Date(b.timestamp).valueOf()
					)
					.map((photo: Photo, idx: number) => (
						<PhotoCard
							key={idx}
							login={props.login}
							photo={photo}
							handleDialogOpen={handleDialogOpen}
							handleQuickDialogOpen={handleQuickDialogOpen}
							apiPhotosFetch={props.apiPhotosFetch}
							gravatarUrl={props.gravatarUrl}
							userFavorites={props.userFavorites}
							apiFavoritesFetch={props.apiFavoritesFetch}
						/>
					))
			)}
			<CommentDialog
				dialogOpen={dialogOpen}
				setDialogOpen={setDialogOpen}
				dialogPhoto={dialogPhoto}
				login={props.login}
				commentData={props.commentData}
				apiCommentsFetch={props.apiCommentsFetch}
				apiPhotosFetch={props.apiPhotosFetch}
			/>
			<QuickCommentDialog
				quickDialogOpen={quickDialogOpen}
				setQuickDialogOpen={setQuickDialogOpen}
				dialogPhoto={dialogPhoto}
				login={props.login}
				apiCommentsFetch={props.apiCommentsFetch}
				apiPhotosFetch={props.apiPhotosFetch}
			/>
			<UploadDialog
				login={props.login}
				photoDialogOpen={props.photoDialogOpen}
				setPhotoDialogOpen={props.setPhotoDialogOpen}
				apiPhotosFetch={props.apiPhotosFetch}
			/>
		</Box>
	);
};

export default MainView;
