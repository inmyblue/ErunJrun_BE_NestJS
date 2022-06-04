import { IsNotEmpty } from 'class-validator';

export class CourseCreateDto {
    @IsNotEmpty()
    title: string;
    @IsNotEmpty()
    distance: number;
    @IsNotEmpty()
    location: string;
    @IsNotEmpty()
    content: string;
    @IsNotEmpty()
    mapLatLng: any;
    @IsNotEmpty()
    thema: string;
    parking: string;
    baggage: string;
    region: number;
    courseImageUrl1: string;
    courseImageUrl2: string;
    courseImageUrl3: string;
    createdAt: string;
    updatedAt: string;
}
