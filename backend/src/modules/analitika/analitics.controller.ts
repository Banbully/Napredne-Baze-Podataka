import { Controller } from "@nestjs/common";
import { AnalyticsService } from "./analitics.service";

@Controller()
export class AnalyticsController{

    constructor(private readonly service: AnalyticsService)
    {}

    
}