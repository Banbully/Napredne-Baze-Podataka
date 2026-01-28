import { IsNumber, IsOptional, IsString } from "class-validator";

export class VehicleDTO
{
    @IsString() deviceId!: string
    @IsOptional() @IsString() marka?: string
    @IsOptional() @IsString() model?: string
    @IsOptional() @IsString() gorivo?: string
    @IsOptional() @IsNumber() godinaProizvodnje?: string
}

export class VehicleUpdateDTO
{
    @IsOptional() @IsString() marka?: string
    @IsOptional() @IsString() model?: string
    @IsOptional() @IsString() gorivo?: string
    @IsOptional() @IsNumber() godinaProizvodnje?: string
}
