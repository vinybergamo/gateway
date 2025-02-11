import { Transform } from 'class-transformer';
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
  @Transform(({ value }: { value: string }) => value.toUpperCase())
  gateway: string;

  @IsArray()
  @IsString({ each: true })
  methods: string[];

  @IsString()
  @IsOptional()
  dueDate: string;

  @IsPositive()
  @IsOptional()
  expiresIn: number;
}
