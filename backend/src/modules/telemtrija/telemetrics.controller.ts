import { isNumber, IsNumber, IsOptional, IsString } from "class-validator";


export class locationDTO
{
    @IsOptional() @IsNumber() latitude?: number;
    @IsOptional() @IsNumber() longitude?: number;
    @IsOptional() @IsString() zone?: string;
    @IsOptional() @IsNumber() accuracy?: number;
}

export class sensorDTO
{
    @IsOptional() @IsNumber() speed?: number;
    @IsOptional() @IsNumber() engineRPM?: number;
    @IsOptional() @IsNumber() fuelLevel?: number;
    @IsOptional() @IsNumber() engineTemp?: number;
    @IsOptional() @IsNumber()  odometar?: number;
    @IsOptional() @IsNumber() dtcCode?: string | null;
}

export class telemtryDTO
{

}