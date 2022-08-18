import { Post } from '../posts/posts.model';
import { WebSocketGateway, WebSocketServer } from '@nestjs/websockets';

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
