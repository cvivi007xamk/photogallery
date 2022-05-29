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
	setQuickDialogOpen: Dispatch<SetStateAction<boolean>>;
	apiCommentsFetch: any;
	dialogPhoto: Photo | undefined;
	quickDialogOpen: boolean;
	apiPhotosFetch: any;
}

const QuickCommentDialog: React.FC<Props> = (
	props: Props
): React.ReactElement => {
	const navigate: NavigateFunction = useNavigate();

	const textfieldRef = useRef<HTMLFormElement>();
	const [error, setError] = useState(false);
	const [errorText, setErrorText] = useState("");
	const handleClose = () => {
		setError(false);
		setErrorText("");
		props.setQuickDialogOpen(false);
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
			props.setQuickDialogOpen(false);
			await props.apiPhotosFetch();
		}
	};

	return (
		<Dialog
			fullWidth
			open={props.quickDialogOpen}
			onClose={handleClose}
			disableRestoreFocus
			disableScrollLock
		>
			<DialogTitle>Write a comment</DialogTitle>
			{props.login.loggedIn ? (
				<Box component="form" onSubmit={addComment} ref={textfieldRef}>
					<DialogContent>
						<TextField
							autoFocus
							name="newComment"
							label="Comment"
							type="text"
							fullWidth
							error={error}
							helperText={errorText}
						/>
					</DialogContent>
					<DialogActions>
						<Button onClick={handleClose}>Close</Button>
						<Button type="submit">Add</Button>
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

export default QuickCommentDialog;
