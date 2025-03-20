import { IsString } from 'class-validator';

export class PayChargeDto {
  @IsString()
  method: string;
}
