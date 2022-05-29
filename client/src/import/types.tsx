export interface Photo {
	id: number;
	filename: string;
	userId: number;
	comments?: Comment[];
	timestamp: string;
	caption?: string;
	keywords?: any;
	favorites?: any;
	poster?: any;
	_count?: any;
}

export interface Photos {
	photos: Photo[];
	error: string;
	loaded: boolean;
}

export interface Comments {
	comments: Comment[];
	error: string;
	loaded: boolean;
}

export interface Comment {
	id: number;
	photoId: number;
	userId: number;
	commentText: string;
	timestamp: string;
	photo?: Photo;
	commenter?: any;
}
export interface fetchSettings {
	method: string;
	headers?: any;
	body?: any;
}
export interface LoggedInUser {
	token: string;
	user: string;
	userId: number;
	userEmail: string;
	loggedIn: boolean;
}
