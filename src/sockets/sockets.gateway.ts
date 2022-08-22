import { WebSocketGateway, WebSocketServer } from '@nestjs/websockets';

import { Post } from '../interfaces/post.interface';

@WebSocketGateway()
export class SocketsGateway {
  @WebSocketServer()
  server;

  handleCreate(post: Post, message: string) {
    this.server.emit('posts', 'New post created', post);
  }

  handleConnection(client: any) {
    console.log('new client connected');
  }
}
