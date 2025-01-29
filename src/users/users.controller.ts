import { Controller, Get } from '@nestjs/common';
import { UsersService } from './users.service';
import { Me } from '@/helpers/decorators/me.decorator';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get('me')
  async me(@Me() me: UserRequest) {
    return this.usersService.me(me.id);
  }
}
