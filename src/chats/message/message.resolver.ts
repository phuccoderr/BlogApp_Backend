import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';
import { MessageService } from './message.service';
import { Message } from './entities/message.entity';
import { UseGuards } from '@nestjs/common';
import { GqlAuthGuard } from 'src/auth/guards/gql-auth.guards';
import { CreateMessageInput } from './dto/create-message.input';
import { CurrentUser } from 'src/auth/current-user.decorator';
import { TokenPayLoad } from 'src/auth/token-payload.interface';
import { GetMessageArgs } from './dto/get-messages.args';

@Resolver()
export class MessageResolver {
  constructor(private readonly messageService: MessageService) {}

  @Mutation(() => Message)
  @UseGuards(GqlAuthGuard)
  async createMessage(
    @Args('createMessageInput') createMessageInput: CreateMessageInput,
    @CurrentUser() user: TokenPayLoad,
  ) {
    return this.messageService.createMessage(createMessageInput, user._id);
  }

  @Query(() => [Message], { name: 'messages' })
  @UseGuards(GqlAuthGuard)
  async getMessages(
    @Args() getMessageArgs: GetMessageArgs,
    @CurrentUser() user: TokenPayLoad,
  ) {
    return this.messageService.getMessages(getMessageArgs, user._id);
  }
}
