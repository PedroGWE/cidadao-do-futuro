import { IsEmail, IsOptional, IsString } from 'class-validator'

export class InviteUserDto {
  @IsEmail()
  email: string

  @IsOptional()
  @IsString()
  roleId?: string
}
