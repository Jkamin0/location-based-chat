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

  const [availableRooms, setAvailableRooms] = useState([]);
  console.log('Rooms', chatRooms);
  const distance = (lat1, lon1, lat2, lon2) => {
    var p = 0.017453292519943295;
    var c = Math.cos;
    var a = 0.5 - c((lat2 - lat1) * p) / 2 + (c(lat1 * p) * c(lat2 * p) * (1 - c((lon2 - lon1) * p))) / 2;

    return 12742 * Math.asin(Math.sqrt(a));
  };

  const checkRooms = (location) => {
    console.log(chatRooms);
    const nearByRooms = chatRooms.filter((room) => {
      const dist = distance(room.latitude, room.longitude, location.coords.latitude, location.coords.longitude);

      console.log(dist);

      return dist < 1000;
    });
    setAvailableRooms(nearByRooms);
  };

  useEffect(async () => {
    const res = await api.get('/users/me');
    const { chatRooms: rooms } = await api.get('/chat_rooms');
    console.log('mychatrooms:');
    console.log(rooms);
    setChatRooms(rooms);
    setUser(res.user);
    setLoading(false);
  }, []);

  useEffect(() => {
    const watch = navigator.geolocation.watchPosition(
      (location) => {
        updatesRef.current.push(location);
        setUpdates([...updatesRef.current]);
        checkRooms(location);
      },
      (err) => {
        setErrorMessage(err.message);
      },
    );
    return () => {
      navigator.geolocation.clearWatch(watch);
    };
  }, [chatRooms]);

  if (loading) {
    return <div>Loading...</div>;
  }

  const createRoom = async () => {
    const body = {
      name: name,
      longitude: updates[updates.length - 1].coords.longitude,
      latitude: updates[updates.length - 1].coords.latitude,
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
        {updates.length > 0 && updates[updates.length - 1].coords.latitude}{' '}
        {updates.length && updates[updates.length - 1].coords.longitude}
      </div>
      <input type="text" value={name} onChange={(e) => setName(e.target.value)} />
      <Button onClick={createRoom}>Create Room</Button>
      <div>
        {availableRooms.map((chatRoom) => (
          <div key={chatRoom.id}>
            <Link to={`/chat_rooms/${chatRoom.id}`}>{chatRoom.name}</Link>
          </div>
        ))}
      </div>
    </div>
  );
};
