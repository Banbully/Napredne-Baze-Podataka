import { IsBoolean, IsDateString, IsOptional, IsString } from "class-validator";

export class alertsDTO
{
        @IsString() deviceId: string;
        @IsOptional() @IsString() code?:String;
        @IsOptional() @IsString() message?:String;
        @IsOptional() @IsString() severity?:String;
        @IsString() @IsBoolean() reseno: boolean
}

export class alertsUpdateDTO
{
        @IsOptional() @IsString() code?:String;
        @IsOptional() @IsString() message?:String;
        @IsOptional() @IsString() severity?:String;
        @IsOptional() @IsBoolean() reseno: boolean
}


export class alertsInsertDTO
{
        @IsString() upozorenjeId: string
        @IsString() deviceId: string
        @IsOptional() @IsString() code?:string;
        @IsOptional() @IsString() message?:string;
        @IsOptional() @IsString() severity?:string;
        @IsOptional() @IsString() timestamp?:string;
        @IsOptional() @IsBoolean() reseno: boolean
}
