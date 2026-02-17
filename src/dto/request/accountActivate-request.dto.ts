export interface AccountActivateRequest{
    token: string,
    old_password: string;
    new_password: string;
    confirm_password: string;
}