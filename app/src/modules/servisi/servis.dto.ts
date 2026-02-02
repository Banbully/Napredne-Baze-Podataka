import { IsOptional, IsString, IsDateString } from "class-validator";

export class servisDTO{
    @IsString() deviceId: string
    @IsDateString() datum: string;
    @IsString() imeMajstora: string
    @IsString() tipServisa: string
    @IsString() odometar: string
    @IsString() opis: string
    @IsString() cena: string
    @IsOptional() @IsDateString() sledeciServis: string
}


export class servisUpdateDTO
{
    @IsString() imeMajstora: string
    @IsDateString() datum: string
    @IsString() tipServisa: string
    @IsString() odometar: string
    @IsString() odradjen: string
    @IsString() opis: string
    @IsString() cena: string
    @IsOptional() @IsDateString() sledeciServis: string
}