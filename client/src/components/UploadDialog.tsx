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
import { LoggedInUser } from "../import/types";
import { NavigateFunction, useNavigate } from "react-router-dom";

interface Props {
	login: LoggedInUser;
	setPhotoDialogOpen: Dispatch<SetStateAction<boolean>>;
	photoDialogOpen: boolean;
	apiPhotosFetch: any;
}

const UploadDialog: React.FC<Props> = (props: Props): React.ReactElement => {
	const navigate: NavigateFunction = useNavigate();

	const formRef = useRef<HTMLFormElement>();

	const fileInput = useRef<any>();

	const [error, setError] = useState(false);
	const [errorText, setErrorText] = useState("");
	const [captionError, setCaptionError] = useState(false);
	const [captionErrorText, setCaptionErrorText] = useState("");
	const [attachment, setAttachment] = useState<string>("");

	const handleChange = (event: any) => {
		console.log(event.target.files);
		let file = event.target.files[0].name;
		setAttachment(file);
	};

	const handleClose = () => {
		setError(false);
		setErrorText("");
		setCaptionError(false);
		setCaptionErrorText("");
		props.setPhotoDialogOpen(false);
		setAttachment("");
	};

	const uploadPhoto = async (e: React.FormEvent) => {
		e.preventDefault();
		if (formRef.current?.keywords.value.length < 2) {
			setError(true);
			setErrorText("Keywords are too short!");
		}
		if (formRef.current?.caption.value.length < 2) {
			setCaptionError(true);
			setCaptionErrorText("Caption text is too short!");
		} else {
			setError(false);
			setErrorText("");
			setCaptionError(false);
			setCaptionErrorText("");
			let formData = new FormData(formRef.current);

			formData.append("userId", props.login.userId.toString());
			formData.append("username", props.login.user.toString());

			props.apiPhotosFetch("POST", formData);
			props.setPhotoDialogOpen(false);
			setAttachment("");
		}
	};

	return (
		<Dialog
			fullWidth
			open={props.photoDialogOpen}
			onClose={handleClose}
			disableRestoreFocus
			disableScrollLock
		>
			<DialogTitle>Upload a new photo</DialogTitle>
			{props.login.loggedIn ? (
				<>
					<Box
						component="form"
						onSubmit={uploadPhoto}
						encType="multipart/form-data"
						ref={formRef}
					>
						<DialogContent>
							<TextField
								autoFocus
								name="caption"
								label="Caption text"
								type="text"
								fullWidth
								error={captionError}
								helperText={captionErrorText}
								sx={{ marginBottom: 2 }}
							/>
							<TextField
								autoFocus
								name="keywords"
								label="Keywords - separate with commas (,)"
								type="text"
								fullWidth
								error={error}
								helperText={errorText}
								sx={{ marginBottom: 2 }}
							/>
							<label htmlFor="file-upload-button">
								<Button
									fullWidth
									variant="contained"
									component="span"
									onClick={() => {
										fileInput.current?.click();
									}}
									sx={{ marginBottom: 2 }}
								>
									Choose a file
								</Button>
								<input
									id="file-upload-button"
									type="file"
									name="uploaded_file"
									hidden
									accept="image/*"
									onChange={handleChange}
								/>
							</label>
							<TextField
								InputProps={{ disableUnderline: true }}
								fullWidth
								disabled
								variant="standard"
								label="Attachment"
								value={attachment}
							/>
						</DialogContent>
						<DialogActions>
							<Button onClick={handleClose}>Close</Button>
							<Button type="submit">Upload</Button>
						</DialogActions>
					</Box>
				</>
			) : (
				<>
					<DialogContent>
						<DialogContentText>
							Log in to upload new photos.
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

export default UploadDialog;
