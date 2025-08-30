import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  MessageBody,
  ConnectedSocket,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import type { Server, Socket } from 'socket.io';

@WebSocketGateway({
  cors: { origin: '*' },
  transports: ['websocket'],
})
export class ChatGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer() server!: Server;

  handleConnection(client: Socket) {
    console.log('WS connected:', client.id);
  }

  handleDisconnect(client: Socket) {
    console.log('WS disconnected:', client.id);
  }

  @SubscribeMessage('ping')
  onPing(@ConnectedSocket() client: Socket) {
    client.emit('pong', { now: Date.now() });
  }

  @SubscribeMessage('message')
  onMessage(@ConnectedSocket() client: Socket, @MessageBody() text: string) {
    this.server.emit('message', {
      text,
      from: client.id,
      at: new Date().toISOString(),
    });
  }
}
