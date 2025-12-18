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

export interface GetCollection {
	collectionId:	number[];
	name:			string[];
}

export interface AddAttribute {
	attribute:		String;
	collectionId:	number;
}

export interface AddItem {
	collectionId:	String;
	attribute?:		String[];
}