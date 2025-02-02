import { Transform } from 'class-transformer';
import { IsEmail, IsOptional, IsString } from 'class-validator';

export class CreateCustomerDto {
  @IsString()
  correlationID: string;

  @IsString()
  name: string;

  @IsString()
  @Transform(({ value }) => value.replace(/\D/g, ''))
  document: string;

  @IsEmail()
  @IsOptional()
  email: string;
}
