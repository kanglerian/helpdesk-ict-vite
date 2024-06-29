import { useEffect, useState, useRef } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import Lottie from "lottie-react";
import chatAnimation from "../assets/chat-animation.json";
import BackgroundPattern from '../assets/flatten.png'
import Man from '../assets/man.png'
import Custom from '../assets/custom.png'
import Secret from '../assets/secret.png'
import axios from 'axios';
import { socket } from '../socket'

const Students = () => {
  const navigate = useNavigate();
  const chatContainerRef = useRef(null);
  const [rooms, setRooms] = useState([]);
  const [chats, setChats] = useState([]);
  const [connection, setConnection] = useState(false);
  const [searchParams] = useSearchParams();

  const [client, setClient] = useState('');
  const [activeRoom, setActiveRoom] = useState({
    name: 'Utama',
    token: 46150,
    type: 0,
    secret: 0,
  });

  const [enableRoom, setEnableRoom] = useState(false);
  const [logged, setLogged] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');
  const [button, setButton] = useState(true);

  const Authentication = () => {
    const queryParams = searchParams.get("room");
    const roomQueryParam = queryParams || 'anonymous';
    const room = localStorage.getItem('HELPDESK:room');
    const account = localStorage.getItem('HELPDESK:account');
    setClient(roomQueryParam)
    if (account) {
      if (!room) {
        let roomActive = {
          name: "Utama",
          token: 46150,
          type: 0,
          secret: 0,
        }
        localStorage.setItem('HELPDESK:room', JSON.stringify(roomActive));
        setActiveRoom(roomActive);
        getChats(roomActive, roomQueryParam);
        getRooms();
        setLogged(true)
      } else {
        const roomStorage = localStorage.getItem('HELPDESK:room');
        const roomActive = JSON.parse(roomStorage);
        getChats(roomActive, roomQueryParam);
        setActiveRoom(roomActive);
        getRooms();
        setLogged(true)
      }
    }
  }

  const getRooms = async () => {
    await axios.get('http://localhost:3001/rooms')
      .then((response) => {
        setRooms(response.data);
      })
      .catch((error) => {
        console.log(error);
      })
  }

  const getChats = async (roomActive, roomQueryParam) => {
    await axios.get('http://localhost:3001/chats')
      .then((response) => {
        const responseChat = response.data;
        const resultFilter = responseChat.filter(
          (chat) =>
            chat.token == roomActive.token &&
            (chat.reply == roomQueryParam || chat.client == roomQueryParam)
        );
        setChats(resultFilter);
      })
      .catch((error) => {
        console.log(error);
      })
  }

  const changeRoom = (name, token, type, secret) => {
    let data = {
      name: name,
      token: token,
      type: type,
      secret: secret,
    }
    localStorage.setItem('HELPDESK:room', JSON.stringify(data));
    Authentication();
  }

  const manualRoom = () => {
    const inputManual = prompt('TOKEN:')
    if (inputManual) {
      let data = {
        name: 'Custom',
        token: inputManual,
        type: 1,
        secret: 0,
      }
      localStorage.setItem('HELPDESK:room', JSON.stringify(data));
      Authentication();
    }
  }

  const secretRoom = () => {
    const inputManual = prompt('TOKEN SECRET:')
    if (inputManual) {
      let data = {
        name: 'Secret',
        token: inputManual,
        type: 1,
        secret: 1,
      }
      localStorage.setItem('HELPDESK:room', JSON.stringify(data));
      Authentication();
    }
  }

  const removeToken = () => {
    const logoutPrompt = confirm('Apakah anda yakin akan keluar?');
    if (logoutPrompt) {
      localStorage.removeItem('HELPDESK:room');
      localStorage.removeItem('HELPDESK:account');
      setLogged(false);
      navigate('/')
    }
  }

  const sendMessage = async (e) => {
    e.preventDefault();
    const accountStringify = localStorage.getItem('HELPDESK:account');
    const roomStringify = localStorage.getItem('HELPDESK:room');
    if (accountStringify && roomStringify) {
      const accountParse = JSON.parse(accountStringify);
      const roomParse = JSON.parse(roomStringify);
      const dataChat = {
        client: client,
        name_room: roomParse.name,
        token: roomParse.token,
        uuid_sender: accountParse.uuid,
        name_sender: accountParse.name,
        role_sender: accountParse.role,
        message: message,
        reply: null,
        date: new Date()
      }
      setButton(false);
      await axios.post('http://localhost:3001/chats', dataChat)
        .then((response) => {
          socket.emit('message', response.data)
          setMessage('');
          setTimeout(() => {
            scrollToRef();
          }, 100);
          setTimeout(() => {
            setButton(true);
          }, 3000);
        })
        .catch((error) => {
          console.log(error);
        })
    }
  }

  const scrollToRef = () => {
    if (chatContainerRef.current) {
      if (chatContainerRef.current) {
        const currentScroll = chatContainerRef.current.scrollHeight;
        chatContainerRef.current.scrollTo({
          top: currentScroll,
          behavior: 'smooth'
        });
      }
    }
  };

  const loginFunc = async (e) => {
    e.preventDefault();
    try {
      const responseUser = await axios.get(`http://localhost:3001/users?username=${username}&password=${password}&role=S`)
      const dataUser = responseUser.data;
      if (dataUser.length > 0) {
        let data = {
          name: dataUser[0].name,
          uuid: dataUser[0].uuid,
          role: dataUser[0].role
        }
        localStorage.setItem('HELPDESK:account', JSON.stringify(data));
        setLogged(true)
        Authentication()
      } else {
        alert('Username atau Password salah!')
        setLogged(false)
      }
    } catch (err) {
      console.log(err);
    }
  }

  useEffect(() => {
    Authentication();

    function onConnect() {
      console.log('Connected!');
      setConnection(true);
    }

    function onDisconnect() {
      console.log('Disconnected!');
      setConnection(false);
    }

    function onMessage(message) {
      const queryParams = searchParams.get("room");
      const roomQueryParam = queryParams || 'anonymous';
      const roomStringify = localStorage.getItem('HELPDESK:room');
      if(roomStringify){
        const roomParse = JSON.parse(roomStringify);
        if(message.token == roomParse.token && (message.reply == roomQueryParam || message.client == roomQueryParam)){
          setChats(prevChat => [...prevChat, message]);
        }
      }
    }

    socket.on('connect', onConnect);
    socket.on('disconnect', onDisconnect);
    socket.on('message', onMessage);

    return () => {
      socket.off('connect', onConnect);
      socket.off('disconnect', onDisconnect);
      socket.off('message', onMessage);
    };
  }, []);

  return (
    <main className={`bg-slate-50 overflow-hidden`}>
      {
        logged ? (
          <section className='flex flex-col justify-between h-screen'>
            <nav className='flex items-center justify-between w-full max-w-lg bg-white mx-auto p-5'>
              <div className='flex items-end gap-2'>
                <i className="fi fi-rr-user-headset text-xl"></i>
                <h1 className='font-bold text-xl'>Chat {activeRoom.name}: {client}</h1>
              </div>
              <div className='flex items-center gap-5'>
                <button onClick={removeToken} type='button' className='text-sky-700 hover:text-sky-800'>
                  <i className="fi fi-rr-key"></i>
                </button>
                <button type='button' onClick={scrollToRef} className={`${connection ? 'text-emerald-500' : 'text-red-500'}`}>
                  <i className="fi fi-rr-wifi"></i>
                </button>
                {
                  rooms.length > 0 &&
                  <button onClick={() => setEnableRoom(!enableRoom)} type='button' className='text-sky-700 hover:text-sky-800'>
                    <i className="fi fi-rr-dropdown-select"></i>
                  </button>
                }
              </div>
            </nav>
            {
              rooms.length > 0 && enableRoom && (
                <section className="w-full h-1/5 max-w-lg mx-auto bg-white flex flex-nowrap overflow-x-auto border-gray-200 text-gray-500 px-5 gap-5">
                  {rooms.map((roomItem) => (
                    <button
                      key={roomItem.id}
                      type="button"
                      onClick={() => changeRoom(roomItem.name, roomItem.token, roomItem.type, roomItem.secret)}
                      className="w-auto flex flex-col items-center space-y-1 p-1 md:p-0"
                    >
                      <div className="w-full flex flex-col items-center justify-center gap-1">
                        <div
                          className="w-10 h-10 bg-cover bg-center"
                          style={{ backgroundImage: `url(${Man})` }}
                        ></div>
                        <h4 className="text-xs text-gray-800 font-medium">{roomItem.name}</h4>
                      </div>
                    </button>
                  ))}

                  <button
                    type="button"
                    onClick={manualRoom}
                    className="w-auto flex flex-col items-center space-y-1 p-1 md:p-0"
                  >
                    <div className="w-full flex flex-col items-center justify-center gap-1">
                      <div className="w-10 h-10 bg-cover bg-center" style={{ backgroundImage: `url(${Custom})` }}></div>
                      <h4 className="text-xs text-gray-800 font-medium">Manual</h4>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={secretRoom}
                    className="w-auto flex flex-col items-center space-y-1 p-1 md:p-0"
                  >
                    <div className="w-full flex flex-col items-center justify-center gap-1">
                      <div className="w-10 h-10 bg-cover bg-center" style={{ backgroundImage: `url(${Secret})` }}></div>
                      <h4 className="text-xs text-gray-800 font-medium">Secret</h4>
                    </div>
                  </button>
                </section>
              )
            }
            <section ref={chatContainerRef} className={`w-full max-w-lg mx-auto bg-cover bg-slate-300 bg-blend-multiply h-screen overflow-y-auto p-5 shadow-inner`} style={{ backgroundImage: `url(${BackgroundPattern})` }}>
              <div className='flex flex-col gap-3'>
                {chats.length > 0 && chats.map((chat) => (
                  <div key={chat.id}>
                    {chat.client === client ? (
                      <div className="w-full flex justify-end">
                        <div className="w-5/6 bg-sky-500 rounded-br-none shadow-sm p-5 rounded-2xl">
                          <div className="space-y-5">
                            <p className="text-sm text-white">{chat.message}</p>
                            <button type="button" className="text-sky-200 hover:text-sky-300 flex items-end gap-1">
                              <span className="block text-xs"><i className="fi fi-rr-marker"></i></span>
                              <span className="block text-xs">{chat.date}</span>
                            </button>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="w-full flex justify-start">
                        <div className="w-5/6 bg-white rounded-bl-none shadow-sm p-5 rounded-2xl">
                          <div className="space-y-5">
                            <div className="space-y-1">
                              <h3 className="font-bold text-base text-gray-900">{chat.client}</h3>
                              <p className="text-sm text-gray-700">{chat.message}</p>
                            </div>
                            <button type="button" className="text-gray-500 hover:text-gray-600 flex items-end gap-1">
                              <span className="block text-xs"><i className="fi fi-rr-marker"></i></span>
                              <span className="block text-xs">{chat.date}</span>
                            </button>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </section>
            <div className='w-full max-w-lg bg-white mx-auto px-8 pt-8 pb-5'>
              <div className='space-y-3'>
                {
                  button &&
                  <form onSubmit={sendMessage} className="flex items-center gap-2 max-w-lg mx-auto">
                    <div className="relative w-full">
                      <div className="absolute inset-y-0 start-0 flex items-center ps-3 pointer-events-none">
                        <i className="fi fi-rr-comment text-gray-500"></i>
                      </div>
                      <input type="text" value={message} onChange={(e) => setMessage(e.target.value)} className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-xl focus:ring-blue-500 focus:border-blue-500 block w-full ps-10 p-2.5" placeholder="Tulis pesan disini..." required />
                    </div>
                    <button type="submit" className="flex gap-2 items-center justify-center py-2.5 px-3 text-sm font-medium text-white bg-sky-600 rounded-xl hover:bg-sky-700 focus:ring-4 focus:outline-none focus:ring-blue-300">
                      <i className="flex fi fi-rr-paper-plane"></i>
                      <span>Kirim</span>
                    </button>
                  </form>
                }
                <div className='text-center space-y-1'>
                  <h5 className='font-bold text-xs text-gray-600'>Catatan:</h5>
                  <p className='text-xs text-gray-500 text-center'>Harap berikan deskripsi masalah yang jelas kepada tim ICT kami, sehingga kami dapat memberikan solusi yang tepat.</p>
                </div>
              </div>
            </div>
            <footer className='w-full max-w-lg mx-auto bg-white py-2'>
              <p className='text-center text-[10px] text-gray-600'>Copyright © 2024 Lerian Febriana, A.Md.Kom</p>
            </footer>
          </section>
        ) : (
          <section className='bg-sky-800 flex flex-col items-center justify-center h-screen'>
            <Lottie animationData={chatAnimation} loop={true} className='w-1/3 md:w-1/6' />
            <div className='text-center space-y-5'>
              <div className='space-y-1'>
                <h2 className='font-bold text-2xl text-white'>Helpdesk Chat {searchParams.get("room")}</h2>
                <p className='text-sm text-sky-200'>Make simple chat for quick problem solving.</p>
              </div>
              <form onSubmit={loginFunc} className='flex flex-col items-center gap-2'>
                <input type="text" id='username' value={username} onChange={(e) => setUsername(e.target.value)} placeholder='Username' className='bg-sky-100 text-sky-900 text-sm rounded-xl block w-full px-4 py-2.5 border border-sky-800 focus:ring-sky-500 focus:border-sky-500' />
                <input type="password" id='password' value={password} onChange={(e) => setPassword(e.target.value)} placeholder='Password' className='bg-sky-100 text-sky-900 text-sm rounded-xl block w-full px-4 py-2.5 border border-sky-800 focus:ring-sky-500 focus:border-sky-500' />
                <button type="submit" className="w-full flex gap-2 items-center justify-center py-2.5 px-3 text-sm font-medium text-white bg-sky-600 rounded-xl hover:bg-sky-700 focus:ring-4 focus:outline-none focus:ring-blue-300">
                  <span>Sign In</span>
                </button>
              </form>
              <p className='text-xs text-sky-400'>Copyright © 2024 Politeknik LP3I Kampus Tasikmalaya</p>
            </div>
          </section>
        )
      }
    </main>
  )
}

export default Students