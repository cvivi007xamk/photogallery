import * as React from "react";
import { styled, alpha } from "@mui/material/styles";

import InputBase from "@mui/material/InputBase";
import SearchIcon from "@mui/icons-material/Search";
import { InputAdornment } from "@mui/material";
import { LoggedInUser } from "../import/types";

interface Props {
	login: LoggedInUser;
	apiPhotosFetch: any;
}

const Search = styled("div")(() => ({
	position: "relative",
	borderRadius: 20,
	backgroundColor: alpha("#000", 0.3),
	"&:hover": {
		backgroundColor: alpha("#000", 0.1),
	},
	marginRight: 0,
	color: "black",
	marginLeft: 0,
	width: "100%",
}));

const SearchField: React.FC<Props> = (props: Props): React.ReactElement => {
	return (
		<Search sx={{ width: { xs: "95%", md: "50%" } }}>
			<InputBase
				color="primary"
				placeholder="Search…"
				inputProps={{ "aria-label": "search" }}
				type="text"
				startAdornment={
					<InputAdornment sx={{ mx: 0.5 }} position="start">
						<SearchIcon />
					</InputAdornment>
				}
				onKeyPress={(e) => {
					if (
						e.key === "Enter"
						// If we would want to make sure the search is not empty
						//&& (e.target as HTMLTextAreaElement).value.length > 2
					) {
						props.apiPhotosFetch(
							"GET",
							undefined,
							undefined,
							(e.target as HTMLTextAreaElement).value
						);
					}
				}}
			/>
		</Search>
	);
};

export default SearchField;
