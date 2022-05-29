import * as React from "react";
import Card from "@mui/material/Card";
import CardHeader from "@mui/material/CardHeader";
import CardMedia from "@mui/material/CardMedia";
import CardContent from "@mui/material/CardContent";
import CardActions from "@mui/material/CardActions";
import Avatar from "@mui/material/Avatar";
import IconButton from "@mui/material/IconButton";
import Typography from "@mui/material/Typography";
import { red } from "@mui/material/colors";
import FavoriteIcon from "@mui/icons-material/Favorite";
import AddCommentIcon from "@mui/icons-material/AddComment";
import DeleteForeverIcon from "@mui/icons-material/DeleteForever";

import { Box, ButtonBase } from "@mui/material";

import { LoggedInUser, Photo } from "../import/types";

interface Props {
	login: LoggedInUser;
	apiPhotosFetch: any;
	photo: Photo;
	handleDialogOpen: any;
	handleQuickDialogOpen: any;
	gravatarUrl: string;
	userFavorites: number[];
	apiFavoritesFetch: any;
}

const PhotoCard: React.FC<Props> = (props: Props): React.ReactElement => {
	const handleFavoriteClick = async () => {
		await props.apiFavoritesFetch(
			"PUT",
			props.photo.id,
			props.login.userId,
			!props.userFavorites.includes(props.photo.id)
		);
		await props.apiPhotosFetch();
	};

	const deletePhoto = async (id: number) => {
		await props.apiPhotosFetch("DELETE", undefined, id);
	};

	return (
		<Box display="flex" justifyContent="center" sx={{ marginBottom: 5 }}>
			<Card
				sx={{
					maxWidth: 768,
				}}
			>
				<CardHeader
					avatar={
						<Avatar
							src={`https://www.gravatar.com/avatar/${props.photo.poster.email}`}
							sx={{ bgcolor: red[500] }}
							aria-label="poster"
						/>
					}
					title={props.photo.poster.username}
					subheader={new Date(props.photo.timestamp).toLocaleString()}
				/>
				<ButtonBase
					onClick={() => {
						props.handleDialogOpen(props.photo);
					}}
					disableRipple
					disableTouchRipple
				>
					<CardMedia
						component="img"
						image={`https://photogallery-cvivi007xamk.s3.eu-north-1.amazonaws.com/${props.photo.filename}`}
						alt={props.photo.caption}
					/>
				</ButtonBase>
				<CardContent>
					<Typography variant="body1">
						{`${props.photo._count.favorites} favorites`}
					</Typography>
					<Typography variant="body1">
						{`${props.photo._count.comments} comments`}
					</Typography>
					<Typography variant="body2" color="text.secondary">
						{props.photo.caption}
					</Typography>
				</CardContent>
				<CardActions disableSpacing>
					<IconButton
						aria-label="add to favorites"
						onClick={handleFavoriteClick}
					>
						<FavoriteIcon
							sx={{
								color: `${
									props.userFavorites.includes(props.photo.id)
										? "#ED4A56"
										: ""
								}`,
							}}
						/>
					</IconButton>
					<IconButton
						aria-label="comment"
						onClick={() => {
							props.handleQuickDialogOpen(props.photo);
						}}
					>
						<AddCommentIcon />
					</IconButton>
					{props.login.userId === props.photo.userId ? (
						<IconButton
							sx={{ marginLeft: "auto" }}
							aria-label="delete-photo"
							onClick={() => deletePhoto(props.photo.id)}
						>
							<DeleteForeverIcon />
						</IconButton>
					) : null}
				</CardActions>
			</Card>
		</Box>
	);
};

export default PhotoCard;
