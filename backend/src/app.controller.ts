import { Controller, Get } from "@nestjs/common";
import { AppService } from "./app.service";
import { ApiStandardResponse } from "@/common/decorators/api-standard-response.decorator";

@ApiStandardResponse()
@Controller()
export class AppController {
  constructor(private readonly appService: AppService) { }

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }
}
