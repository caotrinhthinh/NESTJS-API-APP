import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InsertNoteDTO, UpdateNoteDTO } from './dto';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class NoteService {
  constructor(private prismaService: PrismaService) {}
  async getNotes(userId: number) {
    return this.prismaService.note.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });
  }

  async getNoteById(userId: number, noteId: number) {
    const note = await this.prismaService.note.findUnique({
      where: { id: noteId },
    });

    if (!note) throw new NotFoundException('Note not found');
    if (note.userId !== userId) {
      throw new ForbiddenException('Access denied to this note');
    }

    return note;
  }

  async insertNote(userId: number, insertNoteDTO: InsertNoteDTO) {
    console.log('userId type:', typeof userId, 'value:', userId);
    return this.prismaService.note.create({
      data: {
        title: insertNoteDTO.title,
        description: insertNoteDTO.description ?? '',
        url: insertNoteDTO.url,
        userId,
      },
    });
  }

  async updateNoteById(
    userId: number,
    noteId: string,
    updateNoteDTO: UpdateNoteDTO,
  ) {
    const Id = parseInt(noteId, 10);
    const note = await this.prismaService.note.findUnique({
      where: { id: Id },
    });

    if (!note) throw new NotFoundException('Note not found');
    if (note.userId !== userId) {
      throw new ForbiddenException('Access denied to this note');
    }

    return this.prismaService.note.update({
      where: { id: Id },
      data: {
        title: updateNoteDTO.title ?? note.title,
        description: updateNoteDTO.description ?? note.description,
        url: updateNoteDTO.url ?? note.url,
      },
    });
  }

  async deleteNoteById(userId: number, noteId: string) {
    const Id = parseInt(noteId, 10);

    const note = await this.prismaService.note.findUnique({
      where: { id: Id },
    });

    if (!note) throw new NotFoundException('Note not found');
    if (note.userId !== userId)
      throw new ForbiddenException('Access denied to this note');

    return this.prismaService.note.delete({
      where: { id: Id },
    });
  }
}
