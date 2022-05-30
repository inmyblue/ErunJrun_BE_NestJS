import { CommentRepository } from './repository/comments.repository';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Module } from '@nestjs/common';
import { CommentsController } from './controllers/comments.controller';
import { CommentsService } from './services/comments.service';
import { Comments } from 'src/models/entities/Comments';
import { Users } from 'src/models/entities/Users';
import { UserModule } from 'src/user/user.module';
import { ReCommentsController } from './controllers/recomments.controller';
import { ReCommentsService } from './services/recomments.service';
import { Recomments } from 'src/models/entities/Recomments';

@Module({
    controllers: [CommentsController, ReCommentsController],
    providers: [CommentsService, ReCommentsService, CommentRepository],
    imports: [
        TypeOrmModule.forFeature([Comments, Users, Recomments]),
        UserModule,
    ],
})
export class CommentsModule {}
