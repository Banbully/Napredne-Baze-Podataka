import { IsDateString, IsOptional, IsString } from "class-validator";

export class alertsDTO
{
        @IsOptional() @IsString() code?:String;
        @IsOptional() @IsString() message?:String;
        @IsOptional() @IsString() severity?:String;
        @IsOptional() @IsString() timestamp?:String;
}
