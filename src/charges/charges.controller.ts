import { Body, Controller, Get, Param, Post, Query } from '@nestjs/common';
import { ChargesService } from './charges.service';
import { CreateChargeDto } from './dto/create-charge.dto';
import { PayChargeDto } from './dto/pay.dto';
import { IsPublic } from '@/helpers/decorators/is-public.decorator';
import { Paginate, PaginateQuery } from 'nestjs-paginate';

@Controller('charges')
export class ChargesController {
  constructor(private readonly chargesService: ChargesService) {}

  @Get()
  async getCharges(
    @Paginate() paginate: PaginateQuery,
    @Query('relations') relations: string,
  ) {
    return this.chargesService.list(paginate, relations || '');
  }

  @IsPublic()
  @Get(':chargeId')
  async getCharge(@Param('chargeId') chargeId: string) {
    return this.chargesService.findOneOrFail(chargeId);
  }

  @IsPublic()
  @Post()
  async createCharge(@Body() createChargeDto: CreateChargeDto) {
    return this.chargesService.create(createChargeDto);
  }

  @IsPublic()
  @Post(':chargeId/pay')
  async payCharge(
    @Param('chargeId') chargeId: string,
    @Body() paymentMethod: PayChargeDto,
  ) {
    return this.chargesService.pay(chargeId, paymentMethod);
  }
}
