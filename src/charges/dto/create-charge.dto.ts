import { IsArray, IsOptional, IsPositive, IsString } from 'class-validator';

export class CreateChargeDto {
  @IsString()
  @IsOptional()
  customerId: string;

  @IsString()
  @IsOptional()
  correlationID: string;

  @IsPositive()
  @IsOptional()
  additionalFee: number;

  @IsPositive()
  amount: number;

  @IsOptional()
  @IsString()
  description: string;

  @IsString()
  gateway: string;

  @IsArray()
  @IsString({ each: true })
  methods: string[];

  @IsString()
  @IsOptional()
  dueDate: string;
}
