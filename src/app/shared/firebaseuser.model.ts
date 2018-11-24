export interface FirebaseUserModel {
    image?: string;
    name?: string;
    email?: string;
    phone?: string;
    provider: string;
}

export class User implements FirebaseUserModel {

    image?: string;
    name?: string;
    email?: string;
    phone?: string;
    provider: string;

    constructor(name: string, email: string, phone: string, image: string, provider: string) {
        this.name = name;
        this.email = email;
        this.phone = phone;
        this.image = image;
        this.provider = provider;
    }

    get displayName(): string {
        if (this.name) {
            return this.name;
        }
        if (this.email) {
            return this.email;
        }
        if (this.phone) {
            return this.phone;
        }
        return 'Unnamed User';
    }

    get displayImage(): string {
        if (this.image) {
            return this.image;
        }
        return 'https://www.w3schools.com/howto/img_avatar.png';
    }
}
