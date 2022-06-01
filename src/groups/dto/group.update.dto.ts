import { IsNotEmpty } from 'class-validator';

export class GroupUpdateDto {
    @IsNotEmpty()
    title: string;
    @IsNotEmpty()
    maxPeople: number;
    @IsNotEmpty()
    date: string;
    @IsNotEmpty()
    standbyTime: string;
    @IsNotEmpty()
    distance: number;
    @IsNotEmpty()
    speed: string;
    @IsNotEmpty()
    location: string;
    parking: string;
    baggage: string;
    @IsNotEmpty()
    content: string;
    @IsNotEmpty()
    thema: string;
    @IsNotEmpty()
    chattingRoom: string;
    timecode: number;
    thumbnailUrl1: string;
    thumbnailUrl2: string;
    thumbnailUrl3: string;
    thumbnailUrl: string | string[];
    files: string | Express.Multer.File[];
}
