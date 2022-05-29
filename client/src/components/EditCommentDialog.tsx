import React, { Dispatch, SetStateAction, useRef, useState } from "react";
import {
	Box,
	Button,
	Dialog,
	DialogActions,
	DialogContent,
	DialogContentText,
	DialogTitle,
	TextField,
} from "@mui/material";
import { LoggedInUser, Photo } from "../import/types";
import { NavigateFunction, useNavigate } from "react-router-dom";

interface Props {
	login: LoggedInUser;
	setEditDialogOpen: Dispatch<SetStateAction<boolean>>;
	apiCommentsFetch: any;
	dialogPhoto: Photo | undefined;
	editDialogOpen: boolean;
	apiPhotosFetch: any;
	commentTextToEdit: string;
	commentIdToEdit: number;
}

const EditCommentDialog: React.FC<Props> = (
	props: Props
): React.ReactElement => {
	const navigate: NavigateFunction = useNavigate();

	const textfieldRef = useRef<HTMLFormElement>();
	const [error, setError] = useState(false);
	const [errorText, setErrorText] = useState("");
	const handleClose = () => {
		setError(false);
		setErrorText("");
		props.setEditDialogOpen(false);
	};

	const editComment = async (e: React.FormEvent) => {
		e.preventDefault();
		if (textfieldRef.current?.editedComment.value.length < 2) {
			setError(true);
			setErrorText("Comment is too short!");
		} else {
			setError(false);
			setErrorText("");

			await props.apiCommentsFetch(
				"PUT",
				{
					commentText: textfieldRef.current?.editedComment.value,
					timestamp: new Date().toISOString(),
				},
				props.commentIdToEdit
			);
			props.setEditDialogOpen(false);
			await props.apiPhotosFetch();
		}
	};

	return (
		<Dialog
			fullWidth
			open={props.editDialogOpen}
			onClose={handleClose}
			disableRestoreFocus
			disableScrollLock
		>
			<DialogTitle>Edit comment</DialogTitle>
			{props.login.loggedIn ? (
				<Box component="form" onSubmit={editComment} ref={textfieldRef}>
					<DialogContent>
						<TextField
							autoFocus
							name="editedComment"
							label="Edited comment"
							type="text"
							defaultValue={props.commentTextToEdit}
							fullWidth
							error={error}
							helperText={errorText}
						/>
					</DialogContent>
					<DialogActions>
						<Button onClick={handleClose}>Cancel</Button>
						<Button type="submit">Update</Button>
					</DialogActions>
				</Box>
			) : (
				<>
					<DialogContent>
						<DialogContentText>
							Log in to read and write comments.
						</DialogContentText>
					</DialogContent>
					<DialogActions>
						<Button onClick={handleClose}>Close</Button>
						<Button
							onClick={() => {
								navigate("/login");
							}}
						>
							Log in
						</Button>
					</DialogActions>
				</>
			)}
		</Dialog>
	);
};

export default EditCommentDialog;
