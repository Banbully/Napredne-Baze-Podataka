import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  Query
} from "@nestjs/common";

import { ServisService } from "./servis.service";
import { servisDTO, servisUpdateDTO } from "./servis.dto";

@Controller("servisi")
export class ServisController {

  constructor(private readonly servisService: ServisService) {}

  @Post()
  async create(@Body() dto: servisDTO) {
    return await this.servisService.CreateServis(dto);
  }
/*
  @Put(":id")
  async update(
    @Param("id") id: string,
    @Body() dto: servisUpdateDTO
  ) {
    return await this.servisService.Update(dto, id);
  }
*/
/*
  @Get(":id")
  async getById(@Param("id") id: string) {
    return await this.servisService.getServisPoId(id);
  }
*/
  @Get()
  async getAll() {
    return await this.servisService.getSviServisi();
  }

  @Get(":deviceId")
  async getByVozilo(@Param("deviceId") deviceId: string) {
    return await this.servisService.getServiciPoVozilu(deviceId);
  }
/*
  @Get("od-datuma")
  async getFromDate(@Query("dan") dan: string) {
    return await this.servisService.vratiServiseOdDatuma(dan);
  }
*/
/*
  @Get("majstor/:ime")
  async getByMajstor(@Param("ime") ime: string) {
    return await this.servisService.vratiServisPoMajstoru(ime);
  }
*/
/*
  @Delete(":id")
  async delete(@Param("id") id: string) {
    return await this.servisService.obrisiServisIzKnjige(id);
  }
*/    
}
