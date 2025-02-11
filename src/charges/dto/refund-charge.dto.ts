import { IsOptional, IsString } from 'class-validator';

export class RefundChargeDto {
  @IsString()
  @IsOptional()
  reason: string;
}
