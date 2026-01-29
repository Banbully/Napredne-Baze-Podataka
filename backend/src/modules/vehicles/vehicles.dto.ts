import { IsDate, IsNumber, IsOptional, IsString } from "class-validator";

export class VehicleDTO
{
    @IsOptional() @IsString() marka?: string
    @IsOptional() @IsString() model?: string
    @IsOptional() @IsString() gorivo?: string
    @IsOptional() @IsDate() godinaProizvodnje?: string
    @IsOptional() @IsString() boja?: string
    @IsOptional() @IsString() registracija?: string
    @IsOptional() @IsString() vlasnik?: string
    
}   

export class VehicleUpdateDTO
{
    @IsOptional() @IsString() marka?: string
    @IsOptional() @IsString() model?: string
    @IsOptional() @IsString() gorivo?: string
    @IsOptional() @IsNumber() godinaProizvodnje?: string
    @IsOptional() @IsString() boja?: string
    @IsOptional() @IsString() registracija?: string
}
