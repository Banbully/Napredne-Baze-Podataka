import { IsNumber, IsOptional, IsString } from "class-validator";

export class GpsDTO
{
    @IsOptional() @IsNumber() latitude?:number;
    @IsOptional() @IsNumber() longitude?:number;
    @IsOptional() @IsString() zone?:string;
    @IsOptional() @IsNumber() accuracy?:number;
}

