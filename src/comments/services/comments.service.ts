import { Injectable, HttpException } from '@nestjs/common';
import { CommentRepository } from '../repository/comments.repository';

@Injectable()
export class CommentsService {
    constructor(private readonly commentRepository: CommentRepository) {}
    getComments(category: string, categoryId: string): Promise<object> {
        try {
            return this.commentRepository.getComments(category, categoryId);
        } catch (error) {
            console.log(error);
            throw new HttpException('댓글을 불러오지 못했습니다', 400);
        }
    }

    postComment(input: { [key: string]: string }) {
        try {
            return this.commentRepository.postComment(input);
        } catch (error) {
            console.log(error);
            throw new HttpException(error, 400);
        }
    }

    async updateComment(
        commentId: string,
        userId: string,
        content: string,
    ): Promise<object> {
        try {
            const chkComment = await this.commentRepository.chkCommentExist(
                commentId,
            );
            if (!chkComment)
                throw new HttpException('해당 댓글이 없습니다', 400);

            if (chkComment.userId !== userId)
                throw new HttpException(
                    '본인이 작성한 댓글만 수정할 수 있습니다',
                    400,
                );
            if (!content) throw new HttpException('댓글 내용이 없습니다', 400);

            await this.commentRepository.updateComment(
                commentId,
                userId,
                content,
            );

            const data = this.commentRepository.getComments(
                'group',
                chkComment.groupId,
            );

            return data;
        } catch (error) {
            console.log(error);
            throw new HttpException(error, 400);
        }
    }

    async deleteComment(commentId: string, userId: string): Promise<object> {
        try {
            const chkComment = await this.commentRepository.chkCommentExist(
                commentId,
            );
            if (!chkComment)
                throw new HttpException('해당 댓글이 없습니다', 400);

            if (chkComment.userId !== userId)
                throw new HttpException(
                    '본인이 작성한 댓글만 삭제할 수 있습니다',
                    400,
                );

            return this.commentRepository.deleteComment(commentId, userId);
        } catch (error) {
            console.log(error);
            throw new HttpException(error, 400);
        }
    }
}
