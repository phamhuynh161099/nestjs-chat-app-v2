import { IsString, IsNumber, IsOptional } from 'class-validator';

export class CreateMessageDto {
  @IsString()
  content: string;

  @IsNumber()
  roomId: number;

  @IsOptional()
  @IsString()
  type?: string;

  @IsOptional()
  @IsString()
  fileName?: string;

  @IsOptional()
  @IsString()
  fileUrl?: string;

  @IsOptional()
  @IsNumber()
  fileSize?: number;
}