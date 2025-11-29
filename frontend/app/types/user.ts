// app/types/user.ts
export interface User {
    _id: string;
    name: string;
    email: string;
    role: "user" | "admin";
}

export interface Profile {
    _id: string;
    name: string;
    email: string;
    role: "user" | "admin";
}
