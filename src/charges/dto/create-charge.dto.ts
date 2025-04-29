import { Transform } from 'class-transformer';
import {
  IsArray,
  IsEnum,
  IsInt,
  IsOptional,
  IsPositive,
  IsString,
  ValidateIf,
} from 'class-validator';

enum InvoiceTimingEnum {
  BEFORE = 'BEFORE',
  AFTER = 'AFTER',
}

export class CreateChargeDto {
  @IsString()
  @IsOptional()
  customerId: string;

  @IsString()
  @IsOptional()
  correlationID: string;

  @IsInt()
  @IsOptional()
  additionalFee: number;

  @IsPositive()
  amount: number;

  @ValidateIf((o) => o.issueInvoice !== undefined)
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

  @IsOptional()
  @IsEnum(InvoiceTimingEnum)
  issueInvoice: InvoiceTimingEnum;
}
