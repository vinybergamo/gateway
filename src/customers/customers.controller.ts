import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { CustomersService } from './customers.service';
import { CreateCustomerDto } from './dto/create-customer.dto';
import { IsPublic } from '@/helpers/decorators/is-public.decorator';

@Controller('customers')
export class CustomersController {
  constructor(private readonly customersService: CustomersService) {}

  @Post()
  createCustomer(@Body() createCustomerDto: CreateCustomerDto) {
    return this.customersService.create(createCustomerDto);
  }

  @IsPublic()
  @Get(':customerId/charges')
  listCharges(@Param('customerId') customerId: string) {
    return this.customersService.listCustomerCharges(customerId);
  }
}
