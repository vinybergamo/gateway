import { Body, Controller, Param, Post } from '@nestjs/common';
import { ChargesService } from './charges.service';
import { CreateChargeDto } from './dto/create-charge.dto';
import { PayChargeDto } from './entities/pay.dto';

@Controller('charges')
export class ChargesController {
  constructor(private readonly chargesService: ChargesService) {}

  @Post()
  async createCharge(@Body() createChargeDto: CreateChargeDto) {
    return this.chargesService.create(createChargeDto);
  }

  @Post(':chargeId/pay')
  async payCharge(
    @Param('chargeId') chargeId: string,
    @Body() paymentMethod: PayChargeDto,
  ) {
    return this.chargesService.pay(chargeId, paymentMethod);
  }
}
