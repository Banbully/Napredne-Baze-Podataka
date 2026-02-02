import { IsNumber, IsOptional, IsString } from "class-validator";

export class GpsDTO
{
     @IsNumber() latitude:number;
     @IsNumber() longitude:number;
     @IsString() zone?:string;
    @IsNumber() accuracy?:number;
}

