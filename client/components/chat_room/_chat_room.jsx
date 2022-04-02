import { useState, useEffect, useContext } from 'react';
import { useParams } from 'react-router-dom';
import { ApiContext } from '../../utils/api_context';

import { Button } from '../common/button';
import { useMessages } from '../../utils/use_messages';

export const ChatRoom = () => {
  const [chatRoom, setChatRoom] = useState(null);
  const [contents, setContents] = useState('');
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const api = useContext(ApiContext);
  const { id } = useParams();
  console.log(id);
  const [messages, sendMessage] = useMessages(chatRoom);

  useEffect(async () => {
    const { user } = await api.get('/users/me');
    setUser(user);
    const { chatRoom } = await api.get(`/chat_rooms/${id}`);
    setChatRoom(chatRoom);
    setLoading(false);
  }, []);

  if (loading) return 'Loading...';

  return (
    <div className="chatBody">
      <div className="title">Chatroom: {chatRoom.name}</div>
      <div className="messages">
        {messages.map((message) => (
          <div className="chatBubble" key={message.id}>
            <h3 className="chatName">{message.userName}</h3>
            <div className="chatContent">{message.contents}</div>
          </div>
        ))}
      </div>
      <div className="chatBar">
        <input className="chatTextBar" type="text" value={contents} onChange={(e) => setContents(e.target.value)} />
        <Button onClick={() => sendMessage(contents, user)}>Send</Button>
      </div>
    </div>
  );
};
