import {
  Controller,
  Delete,
  Get,
  Param,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';

import { AccessGuard } from '../../common/guards/access.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { AdminService } from './admin.service';
import { ListStudentsQueryDto } from './dto/list-students.query.dto';

@ApiTags('Admin')
@ApiBearerAuth('access-token')
@Controller('admin')
@UseGuards(AccessGuard, RolesGuard)
@Roles('ADMIN')
export class AdminController {
  constructor(private readonly admin: AdminService) {}

  @ApiOperation({ summary: 'List students (admin)' })
  @Get('students')
  list(@Query() q: ListStudentsQueryDto) {
    return this.admin.listStudents(q);
  }

  @ApiOperation({ summary: 'Delete student by id (admin)' })
  @Delete('students/:id')
  remove(@Param('id') id: string) {
    return this.admin.deleteStudent(id);
  }
}
