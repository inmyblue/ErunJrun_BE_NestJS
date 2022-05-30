import { Injectable, HttpException } from '@nestjs/common';
import { CommentRepository } from '../repository/comments.repository';

@Injectable()
export class ReCommentsService {
    constructor(private readonly commentRepository: CommentRepository) {}
    getRecomment(commentId: string) {
        return this.commentRepository.getRecomment(commentId);
    }

    async postRecomment(commentId: string, content: string, userId: string) {
        const chkComment = await this.commentRepository.chkCommentExist(
            commentId,
        );

        if (!chkComment)
            throw new HttpException('해당되는 댓글이 없습니다', 400);
        await this.commentRepository.postRecomment(commentId, content, userId);
        const data = await this.commentRepository.getRecomment(commentId);

        return data;
    }

    async updateRecomment(
        recommentId: string,
        content: string,
        userId: string,
    ) {
        const chkRecomment = await this.commentRepository.chkRecommentExist(
            recommentId,
        );

        if (!chkRecomment)
            throw new HttpException('해당되는 대댓글이 없습니다', 400);
        const chkComment = await this.commentRepository.chkCommentExist(
            chkRecomment.commentId,
        );
        if (!chkComment)
            throw new HttpException('해당되는 댓글이 없습니다', 400);

        await this.commentRepository.updateRecomment(
            recommentId,
            content,
            userId,
        );
        return this.commentRepository.getRecomment(chkRecomment.commentId);
    }
}
