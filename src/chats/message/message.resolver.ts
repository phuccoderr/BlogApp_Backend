import { Args, Mutation, Query, Resolver, Subscription } from '@nestjs/graphql';
import { MessageService } from './message.service';
import { Message } from './entities/message.entity';
import { Inject, UseGuards } from '@nestjs/common';
import { GqlAuthGuard } from 'src/auth/guards/gql-auth.guards';
import { CreateMessageInput } from './dto/create-message.input';
import { CurrentUser } from 'src/auth/current-user.decorator';
import { TokenPayLoad } from 'src/auth/token-payload.interface';
import { GetMessageArgs } from './dto/get-messages.args';
import { MessageCreatedArgs } from './dto/message-created.args';
import { MessageDocument } from './entities/message.document';

@Resolver()
export class MessageResolver {
  constructor(private readonly messageService: MessageService) {}

  @Mutation(() => Message)
  @UseGuards(GqlAuthGuard)
  async createMessage(
    @Args('createMessageInput') createMessageInput: CreateMessageInput,
    @CurrentUser() user: TokenPayLoad,
  ): Promise<Message> {
    return this.messageService.createMessage(createMessageInput, user._id);
  }

  @Query(() => [Message], { name: 'messages' })
  @UseGuards(GqlAuthGuard)
  async getMessages(
    @Args() getMessageArgs: GetMessageArgs,
  ): Promise<Message[]> {
    return this.messageService.getMessages(getMessageArgs);
  }

  @Subscription(() => Message, {
    filter: (payload, variables, context) => {
      const userId = context.req.user._id;
      const message: Message = payload.messageCreated;
      return (
        message.chatId === variables.chatId &&
        userId !== message.user._id.toHexString()
      );
    },
  })
  messageCreated(@Args() messageCreatedArgs: MessageCreatedArgs) {
    return this.messageService.messageCreated(messageCreatedArgs);
  }
  // messageCreated(
  //   @Args() messageCreatedArgs: MessageCreatedArgs,
  //   @CurrentUser() user: TokenPayLoad,
  // ) {
  //   return this.messageService.messageCreated(messageCreatedArgs, user._id);
  // }
}
