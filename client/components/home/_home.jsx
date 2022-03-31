import { useContext, useEffect, useState, useRef } from 'react';
import { ApiContext } from '../../utils/api_context';
import { Button } from '../common/button';
import { Link } from 'react-router-dom';

export const Home = () => {
  const api = useContext(ApiContext);
  // const navigate = useNavigate();

  const [name, setName] = useState('');
  const [chatRooms, setChatRooms] = useState([]);

  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [errorMessage, setErrorMessage] = useState('');
  const [updates, setUpdates] = useState([]);
  const [longitude, setLongitude] = useState('');
  const [latitude, setLatitude] = useState('');
  const updatesRef = useRef([]);

  useEffect(async () => {
    const res = await api.get('/users/me');
    const { chatRooms } = await api.get('/chat_rooms');
    console.log(chatRooms);
    setChatRooms(chatRooms);
    setUser(res.user);
    setLoading(false);
  }, []);

  useEffect(() => {
    const watch = navigator.geolocation.watchPosition(
      (location) => {
        // updatesRef.current.push(location);
        // setUpdates([...updatesRef.current]);
        setLongitude(location.coords.longitude);
        setLatitude(location.coords.latitude);
      },
      (err) => {
        setErrorMessage(err.message);
      },
    );
    return () => {
      navigator.geolocation.clearWatch(watch);
    };
  }, []);

  if (loading) {
    return <div>Loading...</div>;
  }

  const createRoom = async () => {
    const body = {
      name: name,
      longitude: longitude,
      latitude: latitude,
    };
    const { chatRoom } = await api.post('/chat_rooms', body);
    setChatRooms([...chatRooms, chatRoom]);
    setName('');
  };

  return (
    <div className="p-4">
      <h1>Welcome {user.firstName}</h1>
      <div>
        {errorMessage} {errorMessage && 'You need to enable GPS for this app to work'}
      </div>
      <div>
        Current Location: {latitude} {longitude}
      </div>
      <input type="text" value={name} onChange={(e) => setName(e.target.value)} />
      <Button onClick={createRoom}>Create Room</Button>
      <div>
        {chatRooms.map((chatRoom) => (
          <div key={chatRoom.id}>
            <Link to={`/chat_rooms/${chatRoom.id}`}>{chatRoom.name}</Link>
          </div>
        ))}
      </div>
    </div>
  );
};
