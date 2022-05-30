import { IsNotEmpty } from 'class-validator';

export class GroupCreateDto {
    @IsNotEmpty()
    title: string;
    @IsNotEmpty()
    maxPeople: number;
    @IsNotEmpty()
    date: string;
    @IsNotEmpty()
    standbyTime: string;
    @IsNotEmpty()
    finishTime: string;
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
    mapLatLng: any;
    @IsNotEmpty()
    thema: string;
    chattingRoom: string;
    region: number;
    timecode: number;
    thumbnailUrl1: string;
    thumbnailUrl2: string;
    thumbnailUrl3: string;
}
