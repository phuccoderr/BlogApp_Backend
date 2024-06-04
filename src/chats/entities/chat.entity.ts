import { ObjectType, Field, Int } from '@nestjs/graphql';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { AbstractEntity } from 'src/common/database/abstract.entity';
import { Message } from '../message/entities/message.entity';
import { MessageDocument } from '../message/entities/message.document';

@ObjectType()
// @Schema()
export class Chat extends AbstractEntity {
  // @Field()
  // @Prop()
  // userId: string;

  // @Field()
  // @Prop()
  // isPrivate: boolean;

  // @Field(() => [String])
  // @Prop([String])
  // userIds?: string[];

  // @Prop()
  @Field()
  name: string;

  // @Prop([Message])
  // messages: Message[];

  @Field(() => MessageDocument, { nullable: true })
  latestMessage?: MessageDocument;
}

// export const ChatSchema = SchemaFactory.createForClass(Chat);
