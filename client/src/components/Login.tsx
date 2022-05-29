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

const Login: React.FC<Props> = (props: Props): React.ReactElement => {
	const navigate: NavigateFunction = useNavigate();

	const formRef = useRef<HTMLFormElement>();

	const logIn = async (e: React.FormEvent): Promise<void> => {
		e.preventDefault();

		if (formRef.current?.username.value) {
			if (formRef.current?.password.value) {
				const response = await fetch("/api/auth/login", {
					method: "POST",
					headers: {
						"Content-Type": "application/json",
					},
					body: JSON.stringify({
						username: formRef.current?.username.value,
						password: formRef.current?.password.value,
					}),
				});

				if (response.status === 200) {
					let { token } = await response.json();

					let userObj = await JSON.parse(
						window.atob(token.split(".")[1])
					);
					localStorage.setItem("token", token);
					localStorage.setItem("user", userObj.username);
					localStorage.setItem("userId", String(userObj.id));
					localStorage.setItem("userEmail", String(userObj.email));
					localStorage.setItem("loggedIn", "true");

					props.setLogin({
						token: token,
						user: userObj.username,
						userId: userObj.id,
						userEmail: userObj.email,
						loggedIn: true,
					});

					navigate("/");
				}
			}
		}
	};

	return (
		<Backdrop open={true}>
			<Paper sx={{ padding: 2 }}>
				<Box
					component="form"
					onSubmit={logIn}
					ref={formRef}
					style={{
						width: 300,
						padding: 20,
					}}
				>
					<Stack spacing={2}>
						<Typography variant="h6">Log in</Typography>
						<TextField label="Username" name="username" />
						<TextField
							label="Password"
							name="password"
							type="password"
						/>
						<Box
							sx={{
								marginBottom: 2,
								marginTop: 2,
								textAlign: "center",
							}}
						>
							<Button
								type="submit"
								variant="contained"
								sx={{ marginRight: 1 }}
							>
								Log in
							</Button>
							<Button
								sx={{ marginLeft: 1 }}
								onClick={(e: React.FormEvent) => {
									e.preventDefault();
									navigate("/");
								}}
								variant="outlined"
							>
								Cancel
							</Button>
						</Box>
						<Typography
							variant="body1"
							color="initial"
							textAlign={"center"}
						>
							Register a new account
						</Typography>
						<Button
							onClick={(e: React.FormEvent) => {
								e.preventDefault();
								navigate("/signup");
							}}
							variant="contained"
							color="secondary"
						>
							Create new account
						</Button>
					</Stack>
				</Box>
			</Paper>
		</Backdrop>
	);
};

export default Login;
