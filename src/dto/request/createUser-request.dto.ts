export interface createUserRequest{
    name : string;
    email : string;
    password : string;
    confirm_password : string;
    identity_number : string;
    tokens:{
        [key: string]: string;
    }
}