import React, { Dispatch, SetStateAction } from "react";
import AppBar from "@mui/material/AppBar";
import Box from "@mui/material/Box";
import Toolbar from "@mui/material/Toolbar";
import IconButton from "@mui/material/IconButton";
import Typography from "@mui/material/Typography";
import Menu from "@mui/material/Menu";
import Container from "@mui/material/Container";
import Avatar from "@mui/material/Avatar";
import MenuItem from "@mui/material/MenuItem";
import SearchField from "./SearchField";
import { NavigateFunction, useNavigate } from "react-router";
import { ButtonBase, Chip } from "@mui/material";
import { LoggedInUser } from "../import/types";
import AddAPhotoIcon from "@mui/icons-material/AddAPhoto";
import LoginIcon from "@mui/icons-material/Login";
import Brightness4Icon from "@mui/icons-material/Brightness4";
import Brightness7Icon from "@mui/icons-material/Brightness7";

interface Props {
	login: LoggedInUser;
	setLogin: Dispatch<SetStateAction<any>>;
	apiPhotosFetch: any;
	setPhotoDialogOpen: Dispatch<SetStateAction<boolean>>;
	gravatarUrl: string;
	setFilter: Dispatch<SetStateAction<string>>;
	themeIsLight: boolean;
	setThemeIsLight: Dispatch<SetStateAction<boolean>>;
}

const NavigationBar: React.FC<Props> = (props: Props): React.ReactElement => {
	let settings = [
		"All Photos",
		"My Photos",
		"My Comments",
		"My Favorites",
		"Log Out",
	];

	const [anchorElUser, setAnchorElUser] = React.useState<null | HTMLElement>(
		null
	);

	const handleOpenUserMenu = (event: React.MouseEvent<HTMLElement>) => {
		setAnchorElUser(event.currentTarget);
	};

	const navigate: NavigateFunction = useNavigate();

	const handleCloseUserMenu = () => {
		setAnchorElUser(null);
	};
	const logOut = (): any => {
		localStorage.clear();
		props.setLogin({ token: "", user: "", userId: 0, loggedIn: false });
		// eslint-disable-next-line no-restricted-globals
		location.reload();
	};

	const handleClickUserMenu = (event: React.MouseEvent<HTMLElement>) => {
		handleCloseUserMenu();
		if (event.currentTarget.textContent === "Log Out") {
			logOut();
		} else {
			props.setFilter(String(event.currentTarget.textContent));
		}
	};

	return (
		<AppBar position="sticky">
			<Container>
				<Toolbar disableGutters>
					<ButtonBase
						onClick={() => {
							window.scrollTo({ top: 0, behavior: "smooth" });
							navigate("/");
						}}
					>
						<Avatar
							alt="Logo"
							src={
								props.themeIsLight
									? require("../assets/logo.png")
									: require("../assets/logo-white.png")
							}
							sx={{
								width: 180,
								height: "100%",
								display: { xs: "none", md: "flex" },
							}}
							variant="square"
						/>
					</ButtonBase>
					<ButtonBase
						onClick={() => {
							navigate("/");
							window.scrollTo({ top: 0, behavior: "smooth" });
						}}
					>
						<Avatar
							onClick={() => {
								navigate("/");
							}}
							alt="Logo-small"
							src={
								props.themeIsLight
									? require("../assets/logo-small.png")
									: require("../assets/logo-small-white.png")
							}
							sx={{
								height: "80%",
								display: { xs: "flex", md: "none" },
							}}
							variant="square"
						/>
					</ButtonBase>

					<Box
						display="flex"
						justifyContent="center"
						sx={{
							flexGrow: 1,
						}}
					>
						<SearchField
							login={props.login}
							apiPhotosFetch={props.apiPhotosFetch}
						/>
					</Box>

					<Box
						display="flex"
						justifyContent="right"
						sx={{
							alignItems: "center",
						}}
					>
						{props.login.loggedIn ? (
							<>
								<Chip
									clickable
									sx={{ display: { xs: "none", md: "flex" } }}
									icon={<AddAPhotoIcon color="success" />}
									label="Upload"
									onClick={() => {
										props.setPhotoDialogOpen(true);
									}}
									color="primary"
								/>
								<Chip
									clickable
									size="small"
									sx={{ display: { xs: "flex", md: "none" } }}
									icon={<AddAPhotoIcon color="success" />}
									onClick={() => {
										props.setPhotoDialogOpen(true);
									}}
									color="primary"
								/>
							</>
						) : (
							<>
								<Chip
									clickable
									sx={{ display: { xs: "none", md: "flex" } }}
									icon={<LoginIcon color="success" />}
									label="Log In"
									onClick={() => {
										navigate("/login");
									}}
									color="primary"
								/>
								<Chip
									clickable
									size="small"
									sx={{ display: { xs: "flex", md: "none" } }}
									icon={<LoginIcon color="success" />}
									label="Log In"
									onClick={() => {
										navigate("/login");
									}}
									color="primary"
								/>
							</>
						)}
						<IconButton onClick={handleOpenUserMenu}>
							<Avatar
								alt="User"
								src={props.gravatarUrl}
								sx={{
									width: { xs: 24, md: 48 },
									height: { xs: 24, md: 48 },
								}}
							/>
						</IconButton>
						<IconButton
							sx={{
								marginLeft: "auto",
							}}
							onClick={() => {
								props.setThemeIsLight(!props.themeIsLight);
							}}
							color="inherit"
						>
							{props.themeIsLight ? (
								<Brightness7Icon />
							) : (
								<Brightness4Icon />
							)}
						</IconButton>
						<Menu
							sx={{ marginTop: "45px" }}
							id="menu-appbar"
							anchorEl={anchorElUser}
							anchorOrigin={{
								vertical: "top",
								horizontal: "right",
							}}
							keepMounted
							transformOrigin={{
								vertical: "top",
								horizontal: "right",
							}}
							open={Boolean(anchorElUser)}
							onClose={handleCloseUserMenu}
						>
							{props.login.loggedIn ? (
								settings.map((setting) => (
									<MenuItem
										key={setting}
										onClick={handleClickUserMenu}
									>
										<Typography textAlign="center">
											{setting}
										</Typography>
									</MenuItem>
								))
							) : (
								<MenuItem
									onClick={() => {
										navigate("/login");
									}}
								>
									<Typography textAlign="center">
										Log In
									</Typography>
								</MenuItem>
							)}
						</Menu>
					</Box>
				</Toolbar>
			</Container>
		</AppBar>
	);
};
export default NavigationBar;
