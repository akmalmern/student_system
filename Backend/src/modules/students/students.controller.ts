import {
  Body,
  Controller,
  Get,
  Patch,
  Post,
  Res,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import type { Response } from 'express';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';

import { AccessGuard } from '../../common/guards/access.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { refreshCookieOptions } from '../../common/utils/cookie.util';
import {
  ensureUploadsDir,
  imageFileFilter,
  generateImageFilename,
} from '../../common/upload/upload.util';
import {
  ApiBearerAuth,
  ApiConsumes,
  ApiOperation,
  ApiTags,
  ApiBody,
} from '@nestjs/swagger';

import { StudentsService } from './students.service';
import { UpdateMeDto } from './dto/update-me.dto';
import { ConfirmCodeDto } from './dto/confirm-code.dto';
import { UploadAvatarDto } from './dto/upload-avatar.dto';

@ApiTags('Students')
@ApiBearerAuth('access-token')
@Controller('students')
@UseGuards(AccessGuard)
export class StudentsController {
  constructor(private readonly students: StudentsService) {}

  @ApiOperation({ summary: 'My profile' })
  @Get('me')
  me(@CurrentUser() user: { sub: string }) {
    return this.students.me(user.sub);
  }
  @ApiOperation({ summary: 'Update my profile (PATCH)' })
  @Patch('me')
  updateMe(@CurrentUser() user: { sub: string }, @Body() dto: UpdateMeDto) {
    return this.students.updateMe(user.sub, dto);
  }

  @ApiOperation({ summary: 'Upload avatar image (multer)' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({ type: UploadAvatarDto })
  @Post('me/image')
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        destination: (_req, _file, cb) => cb(null, ensureUploadsDir()),
        filename: (_req, file, cb) =>
          cb(null, generateImageFilename(file.originalname)),
      }),
      fileFilter: imageFileFilter,
      limits: { fileSize: 2 * 1024 * 1024 },
    }),
  )
  async upload(
    @CurrentUser() user: { sub: string },
    @UploadedFile() file?: Express.Multer.File,
  ) {
    if (!file) return { ok: false };

    const base = process.env.APP_BASE_URL ?? 'http://localhost:4000';
    const dir = process.env.UPLOAD_DIR ?? 'uploads';
    const imageUrl = `${base}/${dir}/${file.filename}`;

    return this.students.updateImage(user.sub, imageUrl);
  }

  @Post('me/delete/request')
  requestDelete(@CurrentUser() user: { sub: string }) {
    return this.students.requestDelete(user.sub);
  }

  @Post('me/delete/confirm')
  async confirmDelete(
    @CurrentUser() user: { sub: string },
    @Body() dto: ConfirmCodeDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    const out = await this.students.confirmDelete(user.sub, dto.code);

    // ✅ cookie ham tozalaymiz (logout effect)
    res.clearCookie('refresh_token', refreshCookieOptions());
    return out;
  }
}
