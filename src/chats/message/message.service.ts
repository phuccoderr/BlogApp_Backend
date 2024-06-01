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

@Injectable()
export class MessageService {
  constructor(
    private readonly chatsRepository: ChatsRepository,
    private readonly chatsService: ChatsService,
    @Inject(PUB_SUB) private readonly pubSub: PubSub,
  ) {}

  async createMessage({ content, chatId }: CreateMessageInput, userId: string) {
    const message: Message = {
      content,
      chatId,
      userId,
      createdAt: new Date(),
      _id: new Types.ObjectId(),
    };

    await this.chatsRepository.findOneAndUpdate(
      {
        _id: chatId,
        ...this.chatsService.userChatFilter(userId),
      },
      {
        $push: {
          messages: message,
        },
      },
    );
    await this.pubSub.publish(MESSAGE_CREATED, {
      messageCreated: message,
    });
    return message;
  }

  async getMessages({ chatId }: GetMessageArgs, userId: string) {
    return (
      await this.chatsRepository.findOne({
        _id: chatId,
        ...this.chatsService.userChatFilter(userId),
      })
    ).messages;
  }

  async messageCreated({ chatId }: MessageCreatedArgs, userId: string) {
    await this.chatsRepository.findOne({
      _id: chatId,
      ...this.chatsService.userChatFilter(userId),
    });
    return this.pubSub.asyncIterator(MESSAGE_CREATED);
  }
}
