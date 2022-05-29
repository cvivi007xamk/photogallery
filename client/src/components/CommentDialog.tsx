import React, { Dispatch, SetStateAction, useRef, useState } from "react";
import {
	Box,
	Button,
	Card,
	CardContent,
	CardMedia,
	Dialog,
	DialogActions,
	DialogContent,
	DialogTitle,
	IconButton,
	ListItem,
	ListItemText,
	TextField,
	Typography,
} from "@mui/material";
import DeleteForeverIcon from "@mui/icons-material/DeleteForever";
import EditIcon from "@mui/icons-material/Edit";
import { LoggedInUser, Comment, Photo, Comments } from "../import/types";
import { NavigateFunction, useNavigate } from "react-router-dom";
import EditCommentDialog from "./EditCommentDialog";

interface Props {
	commentData: Comments;
	login: LoggedInUser;
	setDialogOpen: Dispatch<SetStateAction<boolean>>;
	dialogOpen: boolean;
	apiCommentsFetch: (
		method?: string,
		comment?: any,
		id?: number
	) => Promise<void>;
	dialogPhoto: Photo | undefined;
	apiPhotosFetch: (
		method?: string,
		body?: any,
		photoId?: number,
		searchTerm?: string
	) => Promise<void>;
}

const CommentDialog: React.FC<Props> = (props: Props): React.ReactElement => {
	const navigate: NavigateFunction = useNavigate();

	const textfieldRef = useRef<HTMLFormElement>();
	const [editDialogOpen, setEditDialogOpen] = useState(false);

	const [error, setError] = useState(false);
	const [errorText, setErrorText] = useState("");

	const handleClose = () => {
		setError(false);
		setErrorText("");
		props.setDialogOpen(false);
	};

	const addComment = async (e: React.FormEvent) => {
		e.preventDefault();
		if (textfieldRef.current?.newComment.value.length < 2) {
			setError(true);
			setErrorText("Comment is too short!");
		} else {
			setError(false);
			setErrorText("");
			await props.apiCommentsFetch("POST", {
				photoId: Number(props.dialogPhoto?.id),
				userId: Number(props.login.userId),
				commentText: textfieldRef.current?.newComment.value,
				timestamp: new Date().toISOString(),
			});
			textfieldRef.current!.newComment.value = "";
			await props.apiPhotosFetch();
		}
	};

	const [commentTextToEdit, setCommentTextToEdit] = useState<string>("");
	const [commentIdToEdit, setCommentIdToEdit] = useState<number>(0);

	const deleteComment = async (id: number) => {
		await props.apiCommentsFetch("DELETE", undefined, id);
		await props.apiPhotosFetch();
	};

	const openEditComment = (id: number, commentText: string) => {
		setEditDialogOpen(true);
		setCommentTextToEdit(commentText);
		setCommentIdToEdit(id);
	};

	let photoComments: Comment[] = props.commentData.comments.filter(
		(comment: Comment) => comment.photoId === props.dialogPhoto?.id
	);

	return (
		<Dialog
			fullWidth
			maxWidth="xl"
			open={props.dialogOpen}
			onClose={handleClose}
			disableRestoreFocus
			disableScrollLock
		>
			<DialogTitle> {props.dialogPhoto?.caption}</DialogTitle>
			<DialogContent>
				<Card sx={{ display: { xs: "", md: "flex" } }}>
					<CardMedia
						component="img"
						sx={{
							maxWidth: { xs: "100%", md: "70%" },
							height: "100%",
						}}
						image={`https://photogallery-cvivi007xamk.s3.eu-north-1.amazonaws.com/${props.dialogPhoto?.filename}`}
						alt={`${props.dialogPhoto?.caption}`}
					/>
					<Box sx={{ display: "flex", flexDirection: "column" }}>
						<CardContent sx={{ flexGrow: 1 }}>
							{props.login.loggedIn ? (
								photoComments?.map(
									(comment: Comment, idx: number) => {
										return (
											<ListItem
												key={idx}
												alignItems="flex-start"
											>
												<ListItemText
													primary={new Date(
														comment.timestamp
													).toLocaleString()}
													secondary={
														<React.Fragment>
															<Typography
																sx={{
																	display:
																		"inline",
																}}
																component="span"
																variant="body2"
																color="text.primary"
															>
																{
																	comment
																		.commenter
																		.username
																}
															</Typography>
															{` — ${comment.commentText}`}
														</React.Fragment>
													}
												/>
												{props.login.userId ===
												comment.userId ? (
													<>
														<IconButton
															edge="end"
															aria-label="delete"
															onClick={() =>
																openEditComment(
																	comment.id,
																	comment.commentText
																)
															}
														>
															<EditIcon />
														</IconButton>
														<IconButton
															edge="end"
															aria-label="delete"
															onClick={() =>
																deleteComment(
																	comment.id
																)
															}
														>
															<DeleteForeverIcon />
														</IconButton>
													</>
												) : null}
											</ListItem>
										);
									}
								)
							) : (
								<Typography variant="h5" color="initial">
									Log in to read and post comments..
								</Typography>
							)}
						</CardContent>
						{props.login.loggedIn ? (
							<Box
								textAlign="center"
								component="form"
								onSubmit={addComment}
								ref={textfieldRef}
								sx={{
									margin: 2,
								}}
							>
								<TextField
									sx={{ marginBottom: 2, padding: 0 }}
									name="newComment"
									type="text"
									fullWidth
									error={error}
									helperText={errorText}
									multiline
									placeholder="Write a comment..."
								/>
								<Button
									fullWidth
									type="submit"
									variant="contained"
									color="primary"
								>
									Add
								</Button>
							</Box>
						) : (
							<Box
								textAlign="center"
								sx={{
									margin: 2,
								}}
							>
								<Button
									onClick={() => {
										navigate("/login");
									}}
									fullWidth
									variant="contained"
									color="primary"
								>
									Log In
								</Button>
							</Box>
						)}
					</Box>
				</Card>
			</DialogContent>
			<DialogActions>
				<Button onClick={handleClose}>Close</Button>
			</DialogActions>
			<EditCommentDialog
				editDialogOpen={editDialogOpen}
				setEditDialogOpen={setEditDialogOpen}
				dialogPhoto={props.dialogPhoto}
				login={props.login}
				apiCommentsFetch={props.apiCommentsFetch}
				apiPhotosFetch={props.apiPhotosFetch}
				commentTextToEdit={commentTextToEdit}
				commentIdToEdit={commentIdToEdit}
			/>
		</Dialog>
	);
};

export default CommentDialog;
