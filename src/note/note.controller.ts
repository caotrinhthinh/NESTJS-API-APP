import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guard';
import { NoteService } from './note.service';
import { GetUser } from './../auth/decorator/user.decorator';
import { InsertNoteDTO, UpdateNoteDTO } from './dto';

@UseGuards(JwtAuthGuard)
@Controller('notes')
export class NoteController {
  constructor(private noteService: NoteService) {}
  @Get()
  getNotes(@GetUser('id') userId: number) {
    return this.noteService.getNotes(userId);
  }

  @Get(':noteId') // example: notes/123
  getNoteById(@GetUser('id') userId: number, @Param('noteId') noteId: string) {
    return this.noteService.getNoteById(userId, noteId);
  }

  @Post()
  insertNote(
    @GetUser('id') userId: number,
    @Body() insertNoteDTO: InsertNoteDTO,
  ) {
    return this.noteService.insertNote(userId, insertNoteDTO);
  }

  @Patch(':noteId')
  updateNoteById(
    @GetUser('id') userId: number,
    @Param('noteId') noteId: string,
    @Body() updateNoteDTO: UpdateNoteDTO,
  ) {
    return this.noteService.updateNoteById(userId, noteId, updateNoteDTO);
  }

  @HttpCode(HttpStatus.NO_CONTENT)
  @Delete(':id')
  deleteNoteBydId(@GetUser('id') userId: number, @Param('id') noteId: string) {
    return this.noteService.deleteNoteById(userId, noteId);
  }
}
