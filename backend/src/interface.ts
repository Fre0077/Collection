export interface Register {
	name:		String;
	surname:	String;
	username:	String;
	email:	 	String;
	password: 	String;
}

export interface Login {
	email:	 	String;
	password: 	String;
}

export interface AddCollection {
	name:		String;
	userId:		number;
	attribute?:	String[];
}