import { Module } from "@nestjs/common";
import { telemtryController } from "./telemetrics.controller";
import { telemetryService } from "./telemetrics.service";

@Module(
    {
        controllers: [telemtryController],
        providers: [telemetryService],
        exports: [telemetryService]
    }
)
export class telemetryModule{}
