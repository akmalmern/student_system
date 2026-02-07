import { Transform } from 'class-transformer';
import { IsInt, IsOptional, IsString, Max, Min } from 'class-validator';

// ✅ query paramlarni class-transformer bilan numberga aylantiramiz
export class ListStudentsQueryDto {
  @IsOptional()
  @IsString()
  q?: string;

  @Transform(({ value }) => Number(value))
  @IsInt()
  @Min(1)
  page = 1;

  @Transform(({ value }) => Number(value))
  @IsInt()
  @Min(1)
  @Max(50)
  limit = 10;
}
