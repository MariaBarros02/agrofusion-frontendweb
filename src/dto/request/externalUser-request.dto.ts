export interface ExternalUser{
    name: string,
    first_last_name: string,
    second_last_name: string | undefined,
    type_document_id: number,
    document_number: string,
    date_issuance_document: Date,
    birthday: Date | null,
    gender_id: number,
    roles: number[],
    email:string,
    password:string
}