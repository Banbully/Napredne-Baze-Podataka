import { Controller, Get } from "@nestjs/common";
import { LeaderboardService } from "./leaderboard.service";

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

  
}