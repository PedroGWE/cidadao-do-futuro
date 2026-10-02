import { IsArray, IsEmail, IsOptional, IsString, IsUrl, MinLength } from 'class-validator'

export class UpdateProfileDto {
  @IsString() @MinLength(2) name: string
  @IsOptional() @IsString() phone?: string
  @IsOptional() @IsUrl({ require_protocol: true }) avatar_url?: string
}

export class ChangePasswordDto {
  @IsString() @MinLength(8) current_password: string
  @IsString() @MinLength(12) new_password: string
}

export class SetUserRolesDto {
  @IsArray() @IsString({ each: true }) role_ids: string[]
}

export class CreateRoleDto {
  @IsString() @MinLength(2) name: string
  @IsOptional() @IsString() description?: string
  @IsArray() @IsString({ each: true }) permissions: string[]
}

export class UpdateRoleDto {
  @IsOptional() @IsString() @MinLength(2) name?: string
  @IsOptional() @IsString() description?: string
  @IsOptional() @IsArray() @IsString({ each: true }) permissions?: string[]
}
