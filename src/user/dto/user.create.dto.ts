import { IsNotEmpty } from 'class-validator';

export class UserCreateDto {
    @IsNotEmpty()
    nickname: string;
    @IsNotEmpty()
    profileUrl: string;
    @IsNotEmpty()
    social: string;
    @IsNotEmpty()
    socialId: string;
}
