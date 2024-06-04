import { UsersService } from './../../users/users.service';
import { ChatsService } from './../chats.service';
import { ChatsRepository } from './../chats.repository';
import { Inject, Injectable } from '@nestjs/common';
import { CreateMessageInput } from './dto/create-message.input';
import { Message } from './entities/message.entity';
import { Types } from 'mongoose';
import { GetMessageArgs } from './dto/get-messages.args';
import { PUB_SUB } from 'src/common/constants/injection-token';
import { PubSub } from 'graphql-subscriptions';
import { MESSAGE_CREATED } from 'src/common/constants/pubsub-triggers';
import { MessageCreatedArgs } from './dto/message-created.args';
import { MessageDocument } from './entities/message.document';

@Injectable()
export class MessageService {
  constructor(
    private readonly chatsRepository: ChatsRepository,
    private readonly usersService: UsersService,
    @Inject(PUB_SUB) private readonly pubSub: PubSub,
  ) {}

  // async createMessage({ content, chatId }: CreateMessageInput, userId: string) {
  //   const message: Message = {
  //     content,
  //     chatId,
  //     userId,
  //     createdAt: new Date(),
  //     _id: new Types.ObjectId(),
  //   };

  //   await this.chatsRepository.findOneAndUpdate(
  //     {
  //       _id: chatId,
  //       ...this.chatsService.userChatFilter(userId),
  //     },
  //     {
  //       $push: {
  //         messages: message,
  //       },
  //     },
  //   );
  //   await this.pubSub.publish(MESSAGE_CREATED, {
  //     messageCreated: message,
  //   });
  //   return message;
  // }

  async createMessage({ content, chatId }: CreateMessageInput, userId: string) {
    const messageDocument: MessageDocument = {
      content,
      userId: new Types.ObjectId(userId),
      createdAt: new Date(),
      _id: new Types.ObjectId(),
    };

    await this.chatsRepository.findOneAndUpdate(
      {
        _id: chatId,
        // ...this.chatsService.userChatFilter(userId),
      },
      {
        $push: {
          messages: messageDocument,
        },
      },
    );
    const message: Message = {
      ...messageDocument,
      chatId,
      user: await this.usersService.findOne(userId),
    };
    await this.pubSub.publish(MESSAGE_CREATED, {
      messageCreated: message,
    });
    return message;
  }

  async getMessages({ chatId }: GetMessageArgs) {
    return this.chatsRepository.model.aggregate([
      { $match: { _id: new Types.ObjectId(chatId) } },
      { $unwind: '$messages' },
      { $replaceRoot: { newRoot: '$messages' } },
      {
        $lookup: {
          from: 'users',
          localField: 'userId',
          foreignField: '_id',
          as: 'user',
        },
      },
      { $unwind: 'user' },
      { $unset: 'userId' },
      { $set: { chatId } },
    ]);
  }

  // async getMessages({ chatId }: GetMessageArgs) {
  //   return (
  //     await this.chatsRepository.findOne({
  //       _id: chatId,
  //       // ...this.chatsService.userChatFilter(userId),
  //     })
  //   ).messages;
  // }

  // async messageCreated({ chatId }: MessageCreatedArgs, userId: string) {
  //   await this.chatsRepository.findOne({
  //     _id: chatId,
  //     ...this.chatsService.userChatFilter(userId),
  //   });
  //   return this.pubSub.asyncIterator(MESSAGE_CREATED);
  // }

  async messageCreated({ chatId }: MessageCreatedArgs) {
    await this.chatsRepository.findOne({
      _id: chatId,
    });
    return this.pubSub.asyncIterator(MESSAGE_CREATED);
  }
}
