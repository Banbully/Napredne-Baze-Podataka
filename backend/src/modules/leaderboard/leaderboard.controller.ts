import { Body, Controller, Delete, Get, Param, ParseBoolPipe, Post, Query } from "@nestjs/common";
import { LeaderboardService } from "./leaderboard.service";
import { kStringMaxLength } from "buffer";
import { telemetryDTO } from "../telemtrija/telemtrics.dto";

@Controller()
export class LeaderboardController
{
    constructor(private readonly leaderboard: LeaderboardService)
    {

    }
    @Get('ObrtajiGlobalba')
    ObrtajiGlobalna()
    {
        return this.leaderboard.leaderboardObrtaji()
    }

    @Get('GorivoGlobalno')
    GorivoGloabalno()
    {
        return this.leaderboard.leaderboardGorivo()
    }

    @Get('BrzinaGloabalno')
    BrzinaGlobalno()
    {
        return this.leaderboard.leaderboardBrzina()
    }

    @Get('OdometarGloabalno')
    OdometarGloabalno()
    {
        return this.leaderboard.leaderboardOdometar()
    }

    @Get('TemperaturaGloabalno')
    TemperaturaGloabalno()
    {
        return this.leaderboard.leaderboardTemperatura()
    }

    @Get('HealthScoreGloabalno')
    healthScoreGlobalno()
    {
        return this.leaderboard.getHelthScoreLeaderboard()
    }

    @Get('ObrtajiDnevna')
    Obrtaji(@Query("dan") dan?:string)
    {
        return this.leaderboard.leaderboardObrtaji()
    }

    @Get('GorivoDnevna')
    Gorivo(@Query("dan") dan?:string)
    {
        return this.leaderboard.leaderboardGorivo(dan)
    }

    @Get('BrzinaDnevna')
    Brzina(@Query("dan") dan?:string)
    {
        return this.leaderboard.leaderboardBrzina(dan)
    }

    @Get('OdometarDnevna')
    Odometar(@Query("dan") dan?:string)
    {
        return this.leaderboard.leaderboardOdometar(dan)
    }

    @Get('TemperaturaDnevna')
    Temperatura(@Query("dan") dan?:string)
    {
        return this.leaderboard.leaderboardTemperatura(dan)
    }

    @Get('HealthScoreDnevna')
    healthScore(@Query("dan") dan?:string)
    {
        return this.leaderboard.getHelthScoreLeaderboard(dan)
    }



    @Post('updateTabele/:deviceId')
    UpdateTabele(@Param('deviceId') deviceId:string, @Body() podaci:telemetryDTO)
    {
        return this.leaderboard.updateLeaderboard(deviceId, podaci)
    }

    
    @Post('Odometar/:deviceId')
    UpdateOdometarTabelu(@Param('deviceId') deviceId:string, @Query(`odometar`) odometar:number,@Query("daily") isDaily: boolean)
    {
        return this.leaderboard.updateLeaderboardOdometar(deviceId, odometar, isDaily)
    }

    @Post('Gorivo/:deviceId')
    UpdateGorivoTabele(@Param('deviceId') deviceId:string, @Query(`fuel`) fuel:number,@Query("daily") isDaily: boolean)
    {
        return this.leaderboard.updateLeaderboardFuel(deviceId, fuel, isDaily)
    }

    @Post('Temperatura/:deviceId')
    UpdateTempTabele(@Param('deviceId') deviceId:string, @Query(`temp`) temp:number,@Query("daily") isDaily: boolean)
    {
        return this.leaderboard.updateLeaderboardTemp(deviceId, temp, isDaily)
    }

    @Post('engineRPM/:deviceId')
    UpdateEngineRpmTabele(@Param('deviceId') deviceId:string, @Query(`rpm`) engineRpm:number, @Query("daily")isDaily:boolean)
    {
        return this.leaderboard.updateLeaderboardengineRPM(deviceId, engineRpm, isDaily)
    }

    
    
    @Post('healthScore/:deviceId')
    UpdateHealthScore(@Param('deviceId') deviceId:string, @Query(`healthScore`) healthScore:number, isDaily:boolean)
    {
        return this.leaderboard.updateHealthScore(deviceId, healthScore, isDaily)
    }


    @Delete('resetDaily/:parametar')
    resetDailyTabelu(@Param() parametar:string)
    {
        return this.leaderboard.OcistiDnevnuTabelu(parametar);
    }

    @Delete('resetDaily/')
    resetDailyTabele()
    {
        return this.leaderboard.OcistiDnevneTabele();
    }

    @Delete('resetGlobal/:parametar')
    resetGlobalTabelu(@Param() parametar:string)
    {
        return this.leaderboard.OcistiTabelu(parametar);
    }

    @Delete('resetujGlobalne')
    resetGlobalTabele()
    {
        return this.leaderboard.OcistiTabele();
    }

    @Delete('izbaciIzTabeleVozilo/:deviceId/:parametar')
    izbaciIzTabele(@Param() deviceId: string, @Param() parametar:string, @Body() isDaily: boolean)
    {
        return this.leaderboard.izbaciIzTabele(parametar, deviceId, isDaily)
    }
}