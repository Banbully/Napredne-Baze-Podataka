import { IsDate, IsString } from "class-validator";

export class servisDTO{
    @IsString() deviceId: string
    @IsString() imeMajstora: string
    @IsString() tipServisa: string
    @IsString() odometar: string
    @IsString() opis: string
    @IsString() cena: string
    @IsDate() sledeciServis: string
}


export class servisUpdateDTO
{
    @IsString() imeMajstora: string
    @IsString() tipServisa: string
    @IsString() odometar: string
    @IsString() odradjen: string
    @IsString() opis: string
    @IsString() cena: string
    @IsDate() sledeciServis: string
}