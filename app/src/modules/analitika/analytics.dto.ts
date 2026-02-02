import { IsEnum, IsNumber, IsOptional,IsString } from "class-validator";

export class AnalyticsDTO
{
    @IsOptional() @IsNumber() deviceid?:number;
    @IsOptional() @IsNumber() sessionId?:number;
    @IsOptional() @IsString() ip?:String;//mozda
    @IsOptional() @IsString() mac?:String;
    @IsOptional() @IsNumber() signal_strenght?:number
}

export class sensorDTO
{
    @IsOptional() @IsNumber() speed: number;
    @IsOptional() @IsNumber() engineRPM: number;
    @IsOptional() @IsNumber() fuelLevel: number;
    @IsOptional() @IsNumber() engineTemp: number;
    @IsOptional() @IsNumber() odometar: number;
    @IsOptional() @IsNumber() dtcCode: string | null;
}

export class GrafikonDTO{
    @IsString() deviceId!:string;
    @IsEnum(sensorDTO) metrika!: sensorDTO;
    @IsString() day!: string;
    @IsEnum(["1min", '30min', '1h', '24h']) period!: string;
}


