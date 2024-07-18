import { useEffect, useState, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import Lottie from "lottie-react";
import axios from 'axios';
import moment from 'moment-timezone';
import chatAnimation from "../assets/chat-animation.json";
import BackgroundPattern from '../assets/flatten.png'
import Man from '../assets/man.png'
import Custom from '../assets/custom.png'
import Secret from '../assets/secret.png'
import BellSound from '../assets/bell.mp3'
import { socket } from '../socket'

const Dashboard = () => {
  const navigate = useNavigate();
  const chatContainerRef = useRef(null);
  const [rooms, setRooms] = useState([]);
  const [chats, setChats] = useState([]);
  const [connection, setConnection] = useState(false);

  const [activeRoom, setActiveRoom] = useState({
    name: 'Loading...'
  });

  const [enableRoom, setEnableRoom] = useState(false);
  const [logged, setLogged] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [token, setToken] = useState('46150');

  const Authentication = () => {
    const room = localStorage.getItem('HELPDESK:room_dashboard');
    const account = localStorage.getItem('HELPDESK:account_dashboard');
    if (account) {
      if (!room) {
        localStorage.removeItem('HELPDESK:room_dashboard');
        localStorage.removeItem('HELPDESK:account_dashboard');
        setLogged(false);
        navigate('/admin')
      } else {
        const roomStorage = localStorage.getItem('HELPDESK:room_dashboard');
        const roomActive = JSON.parse(roomStorage);
        getChats(roomActive);
        setActiveRoom(roomActive);
        getRooms();
        setLogged(true)
      }
    }
  }

  const getRooms = async () => {
    await axios.get('https://api.politekniklp3i-tasikmalaya.ac.id/helpdesk/rooms')
      .then((response) => {
        setRooms(response.data);
      })
      .catch((error) => {
        console.log(error);
      })
  }

  const getChats = async (roomActive) => {
    await axios.get(`https://api.politekniklp3i-tasikmalaya.ac.id/helpdesk/chats/dashboard/${roomActive.token}`)
      .then((response) => {
        const responseChat = response.data;
        setChats(responseChat);
      })
      .catch((error) => {
        if(error.response.status == 404){
          setChats([]);
        }
      })
  }

  const changeRoom = (name, token, type, secret) => {
    let data = {
      name: name,
      token: token,
      type: type,
      secret: secret,
    }
    localStorage.setItem('HELPDESK:room_dashboard', JSON.stringify(data));
    Authentication();
  }

  const manualRoom = () => {
    const inputManual = prompt('TOKEN:')
    if (inputManual) {
      let data = {
        name: 'Custom',
        token: inputManual,
        type: true,
        secret: false,
      }
      localStorage.setItem('HELPDESK:room_dashboard', JSON.stringify(data));
      Authentication();
    }
  }

  const secretRoom = () => {
    const inputManual = prompt('TOKEN SECRET:')
    if (inputManual) {
      let data = {
        name: 'Secret',
        token: inputManual,
        type: true,
        secret: true,
      }
      localStorage.setItem('HELPDESK:room_dashboard', JSON.stringify(data));
      Authentication();
    }
  }

  const removeToken = () => {
    const logoutPrompt = confirm('Apakah anda yakin akan keluar?');
    if (logoutPrompt) {
      localStorage.removeItem('HELPDESK:room_dashboard');
      localStorage.removeItem('HELPDESK:account_dashboard');
      setLogged(false);
      navigate('/dashboard')
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

  const bellPlay = () => {
    let audio = new Audio(BellSound);
    audio.play();
  }

  const loginFunc = async (e) => {
    e.preventDefault();
    try {
      const responseUser = await axios.post(`https://api.politekniklp3i-tasikmalaya.ac.id/helpdesk/auth/admin/login`, {
        username: username,
        password: password
      });
      const responseRoom = await axios.get(`https://api.politekniklp3i-tasikmalaya.ac.id/helpdesk/rooms/${token}`)
      const dataUser = responseUser.data;
      const dataRoom = responseRoom.data;

      let dataHelpdeskRoom = {
        name: dataRoom.name,
        token: dataRoom.token,
        type: dataRoom.type,
        secret: dataRoom.secret,
      }

      let dataHelpdeskAccount = {
        name: dataUser.name,
        uuid: dataUser.uuid,
        role: dataUser.role
      }

      localStorage.setItem('HELPDESK:room_dashboard', JSON.stringify(dataHelpdeskRoom));
      localStorage.setItem('HELPDESK:account_dashboard', JSON.stringify(dataHelpdeskAccount));
      setLogged(true);
      Authentication();
    } catch (err) {
      console.log(err);
      alert(err.response.data.message);
    }
  }

  useEffect(() => {
    Authentication();

    setTimeout(() => {
      scrollToRef();
    }, 500);

    function onConnect() {
      console.log('Connected!');
      setConnection(true);
    }

    function onDisconnect() {
      console.log('Disconnected!');
      setConnection(false);
    }

    function onMessage(message) {
      const roomStringify = localStorage.getItem('HELPDESK:room_dashboard');
      if (roomStringify) {
        const roomParse = JSON.parse(roomStringify);
        if (message.token == roomParse.token && message.role_sender == 'S') {
          setChats(prevChat => [...prevChat, message]);
          setTimeout(() => {
            scrollToRef();
            if (message.role_sender == 'S') {
              bellPlay();
            }
          }, 100);
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
            {
              rooms.length > 0 && enableRoom && (
                <section className="w-full pb-8 pt-5 px-10 mx-auto bg-white flex justify-center flex-nowrap overflow-x-auto border-slate-200 text-slate-500 gap-5">
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
                        <h4 className="text-xs text-slate-800 font-medium">{roomItem.name}</h4>
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
                      <h4 className="text-xs text-slate-800 font-medium">Manual</h4>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={secretRoom}
                    className="w-auto flex flex-col items-center space-y-1 p-1 md:p-0"
                  >
                    <div className="w-full flex flex-col items-center justify-center gap-1">
                      <div className="w-10 h-10 bg-cover bg-center" style={{ backgroundImage: `url(${Secret})` }}></div>
                      <h4 className="text-xs text-slate-800 font-medium">Secret</h4>
                    </div>
                  </button>
                </section>
              )
            }
            <section ref={chatContainerRef} className={`w-full mx-auto bg-cover bg-slate-900 bg-blend-multiply h-screen overflow-y-auto p-5 md:p-10 pb-16 shadow-inner`} style={{ backgroundImage: `url(${BackgroundPattern})` }}>
              <div className='flex flex-col gap-5'>
                {chats.length > 0 && chats.map((chat, index) => (
                  <div key={index}>
                    <div className="w-full flex justify-start items-center gap-3">
                      <div className="w-full bg-slate-700 rounded-bl-none shadow-sm p-5 rounded-2xl">
                        <div className="space-y-5 md:space-y-10">
                          <div className="space-y-1 md:space-y-3">
                            <h3 className="font-bold text-sm md:text-xl text-slate-300">Ruangan {chat.client}</h3>
                            <p className="text-base md:text-2xl text-slate-100">{chat.message}</p>
                          </div>
                          <div className='flex items-center justify-between'>
                            <a target='_blank' href={`https://google.com/maps?q=${chat.latitude},${chat.longitude}`} className="text-slate-500 hover:text-slate-600 flex items-center gap-1">
                              <span className="block text-xs"><i className="fi fi-rr-marker flex"></i></span>
                              <span className="block text-xs">{moment(chat.date).tz('Asia/Jakarta').format('LLLL')}</span>
                            </a>
                            <p className='flex items-center gap-1 text-xs text-slate-500'>
                              <i className="fi fi-rr-circle-user flex"></i>
                              <span>{chat.name_sender}</span>
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </section>
            <footer className={`flex flex-col md:flex-row items-center justify-between gap-5 md:gap-0 w-full mx-auto ${connection ? 'bg-emerald-500' : 'bg-red-500'} p-5`}>
              <a href='https://politekniklp3i-tasikmalaya.ac.id' target='_blank' className='order-2 md:order-1 block text-center text-xs text-slate-800 hover:text-slate-900'>Copyright © 2024 Politeknik LP3I Kampus Tasikmalaya</a>
              <div className='order-1 md:order-2 flex items-center gap-5'>
                <div className='flex items-center gap-2 text-slate-800'>
                  <i className="fi fi-rr-user-headset text-xl flex"></i>
                  <h1 className='font-bold text-xl'>Dashboard Help Chat {activeRoom.name}</h1>
                </div>
                |
                <button onClick={bellPlay} type='button' className='text-slate-800 hover:text-slate-900'>
                  <i className="fi fi-rr-bell-ring flex"></i>
                </button>
                <button onClick={removeToken} type='button' className='text-slate-800 hover:text-slate-900'>
                  <i className="fi fi-rr-key flex"></i>
                </button>
                {
                  rooms.length > 0 &&
                  <button onClick={() => setEnableRoom(!enableRoom)} type='button' className='text-slate-800 hover:text-slate-900'>
                    <i className="fi fi-rr-dropdown-select flex"></i>
                  </button>
                }
              </div>
            </footer>
          </section>
        ) : (
          <section className='bg-sky-800 flex flex-col items-center justify-center h-screen'>
            <Lottie animationData={chatAnimation} loop={true} className='w-1/3 md:w-1/6' />
            <div className='text-center space-y-5'>
              <div className='space-y-1'>
                <h2 className='font-bold text-2xl text-white'>Dashboard Helpdesk Chat</h2>
                <p className='text-sm text-sky-200'>Make simple chat for quick problem solving.</p>
              </div>
              <p className={`${connection ? 'bg-emerald-500' : 'bg-red-500'} text-white text-xs py-2 rounded-xl`}>
                <i className="fi fi-rr-wifi text-[12px] mr-1"></i>
                <span>{`${connection ? 'Connected' : 'Disconnected'}`}</span>
              </p>
              <form onSubmit={loginFunc} className='flex flex-col items-center gap-2'>
                <input type="text" id='username' value={username} onChange={(e) => setUsername(e.target.value)} placeholder='Username' className='bg-sky-100 text-sky-900 text-sm rounded-xl block w-full px-4 py-2.5 border border-sky-800 focus:ring-sky-500 focus:border-sky-500' required />
                <input type="password" id='password' value={password} onChange={(e) => setPassword(e.target.value)} placeholder='Password' className='bg-sky-100 text-sky-900 text-sm rounded-xl block w-full px-4 py-2.5 border border-sky-800 focus:ring-sky-500 focus:border-sky-500' required />
                <input type="number" id='token' onChange={(e) => setToken(e.target.value)} placeholder='Token' className='bg-sky-100 text-sky-900 text-sm rounded-xl block w-full px-4 py-2.5 border border-sky-800 focus:ring-sky-500 focus:border-sky-500' required />
                <button type="submit" className="w-full flex gap-2 items-center justify-center py-2.5 px-3 text-sm font-medium text-white bg-sky-600 rounded-xl hover:bg-sky-700 focus:ring-4 focus:outline-none focus:ring-blue-300">
                  <span>Sign In</span>
                </button>
              </form>
              <a href="https://politekniklp3i-tasikmalaya.ac.id" target="_blank" className='block text-xs text-sky-400'>Copyright © 2024 Politeknik LP3I Kampus Tasikmalaya</a>
            </div>
          </section>
        )
      }
    </main>
  )
}

export default Dashboard