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

    @Get('Obrtaji')
    Obrtaji()
    {
        return this.leaderboard.leaderboardObrtaji()
    }

    @Get('Gorivo')
    Gorivo()
    {
        return this.leaderboard.leaderboardGorivo()
    }

    @Get('Brzina')
    Brzina()
    {
        return this.leaderboard.leaderboardBrzina()
    }

    @Get('Odometar')
    Odometar()
    {
        return this.leaderboard.leaderboardOdometar()
    }

    @Get('Temperatura')
    Temperatura()
    {
        return this.leaderboard.leaderboardTemperatura()
    }

    @Get('HealthScore')
    healthScore()
    {
        return this.leaderboard.getHelthScoreLeaderboard()
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