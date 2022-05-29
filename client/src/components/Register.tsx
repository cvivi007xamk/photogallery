import React, { Dispatch, SetStateAction, useRef } from "react";
import {
	Backdrop,
	Box,
	Button,
	Paper,
	Stack,
	TextField,
	Typography,
} from "@mui/material";
import { useNavigate, NavigateFunction } from "react-router-dom";
import { LoggedInUser } from "../import/types";

interface Props {
	apiPhotosFetch: any;

	login: LoggedInUser;
	setLogin: Dispatch<SetStateAction<LoggedInUser>>;
	apiCommentsFetch: any;
	apiFavoritesFetch: any;
}

const Register: React.FC<Props> = (props: Props): React.ReactElement => {
	const navigate: NavigateFunction = useNavigate();

	const formRef = useRef<HTMLFormElement>();

	const signUp = async (e: React.FormEvent): Promise<void> => {
		e.preventDefault();

		if (formRef.current?.username.value) {
			if (formRef.current?.email.value) {
				if (
					formRef.current?.password.value &&
					formRef.current?.password.value ===
						formRef.current?.password2.value
				) {
					const response = await fetch("/api/auth/signup", {
						method: "POST",
						headers: {
							"Content-Type": "application/json",
						},
						body: JSON.stringify({
							username: formRef.current?.username.value,
							password: formRef.current?.password.value,
							email: formRef.current?.email.value,
						}),
					});

					if (response.status === 200) {
						let { token } = await response.json();

						let userObj = JSON.parse(
							window.atob(token.split(".")[1])
						);
						localStorage.setItem("token", token);
						localStorage.setItem("user", userObj.username);
						localStorage.setItem("userId", String(userObj.id));
						localStorage.setItem("loggedIn", "true");

						props.setLogin({
							token: token,
							user: userObj.username,
							userId: userObj.id,
							userEmail: userObj.email,
							loggedIn: true,
						});
						// Get the comments when someone registers succesfully
						props.apiPhotosFetch();
						props.apiCommentsFetch();
						props.apiFavoritesFetch("GET", undefined, userObj.id);

						navigate("/");
					}
				}
			}
		}
	};

	return (
		<Backdrop open={true}>
			<Paper sx={{ padding: 2 }}>
				<Box
					component="form"
					onSubmit={signUp}
					ref={formRef}
					style={{
						width: 300,
						padding: 20,
					}}
				>
					<Stack spacing={2}>
						<Typography variant="h6">
							Register a new account
						</Typography>
						<TextField label="Username" name="username" />
						<TextField label="Email" name="email" />

						<TextField
							label="Password"
							name="password"
							type="password"
						/>
						<TextField
							label="Confirm password"
							name="password2"
							type="password"
						/>
						<Button type="submit" variant="contained" size="large">
							Join
						</Button>
						<Button
							onClick={(e: React.FormEvent) => {
								e.preventDefault();
								navigate("/");
							}}
							variant="outlined"
							size="large"
						>
							Cancel
						</Button>
					</Stack>
				</Box>
			</Paper>
		</Backdrop>
	);
};

export default Register;
