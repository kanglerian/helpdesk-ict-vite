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

const Admin = () => {
  const navigate = useNavigate();
  const chatContainerRef = useRef(null);
  const [rooms, setRooms] = useState([]);
  const [chats, setChats] = useState([]);
  const [connection, setConnection] = useState(false);

  const client = 'Administrator';
  const [activeRoom, setActiveRoom] = useState(null);

  const [enableRoom, setEnableRoom] = useState(false);
  const [logged, setLogged] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [token, setToken] = useState('46150');
  const [replyMessage, setReplyMessage] = useState('');
  const [message, setMessage] = useState('');
  const [canSendMessage, setCanSendMessage] = useState(true);

  const Authentication = () => {
    const room = localStorage.getItem('HELPDESK:room_admin');
    const account = localStorage.getItem('HELPDESK:account_admin');
    if (account) {
      if (!room) {
        localStorage.removeItem('HELPDESK:room_admin');
        localStorage.removeItem('HELPDESK:account_admin');
        setLogged(false);
        navigate('/admin')
      } else {
        const roomStorage = localStorage.getItem('HELPDESK:room_admin');
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

  const clearChats = async () => {
    const confirmed = confirm(`Apakah anda yakin akan menghapus pesan ${activeRoom.name}?`);
    if(confirmed){
      await axios.delete(`https://api.politekniklp3i-tasikmalaya.ac.id/helpdesk/chats/${activeRoom.token}`)
      .then((response) => {
        alert(response.data.message);
        getChats(activeRoom);
      })
      .catch((error) => {
        console.log(error);
      })
    }
  }

  const getChats = async (roomActive) => {
    await axios.get(`https://api.politekniklp3i-tasikmalaya.ac.id/helpdesk/chats/admin/${roomActive.token}`)
      .then((response) => {
        const responseChat = response.data;
        setChats(responseChat);
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
    localStorage.setItem('HELPDESK:room_admin', JSON.stringify(data));
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
      localStorage.setItem('HELPDESK:room_admin', JSON.stringify(data));
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
      localStorage.setItem('HELPDESK:room_admin', JSON.stringify(data));
      Authentication();
    }
  }

  const removeToken = () => {
    const logoutPrompt = confirm('Apakah anda yakin akan keluar?');
    if (logoutPrompt) {
      localStorage.removeItem('HELPDESK:room_admin');
      localStorage.removeItem('HELPDESK:account_admin');
      setLogged(false);
      navigate('/admin')
    }
  }

  const sendMessage = async (e) => {
    e.preventDefault();
    const accountStringify = localStorage.getItem('HELPDESK:account_admin');
    const roomStringify = localStorage.getItem('HELPDESK:room_admin');
    if (accountStringify && roomStringify) {
      const accountParse = JSON.parse(accountStringify);
      const roomParse = JSON.parse(roomStringify);
      const dataChat = {
        client: accountParse.name,
        name_room: roomParse.name,
        token: roomParse.token,
        not_save: roomParse.secret,
        uuid_sender: accountParse.uuid,
        name_sender: accountParse.name,
        role_sender: accountParse.role,
        message: message,
        reply: replyMessage,
        date: new Date(),
        latitude: null,
        longitude: null
      }
      setCanSendMessage(false);
      socket.emit('message', dataChat)
      setMessage('');
      setTimeout(() => {
        setCanSendMessage(true);
      }, 2000);
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

      localStorage.setItem('HELPDESK:room_admin', JSON.stringify(dataHelpdeskRoom));
      localStorage.setItem('HELPDESK:account_admin', JSON.stringify(dataHelpdeskAccount));
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
      const roomStringify = localStorage.getItem('HELPDESK:room_admin');
      if (roomStringify) {
        const roomParse = JSON.parse(roomStringify);
        if (message.token == roomParse.token) {
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
            <nav className='flex items-center justify-between w-full max-w-lg bg-white mx-auto p-5'>
              <div className='flex items-end gap-2'>
                <i className="fi fi-rr-user-headset text-xl"></i>
                <h1 className='font-bold text-xl'>Admin Chat: {activeRoom.name}</h1>
              </div>
              <div className='flex items-center gap-5'>
                <button onClick={clearChats} type='button' className='text-red-700 hover:text-red-800'>
                  <i className="fi fi-rr-trash"></i>
                </button>
                <button onClick={bellPlay} type='button' className='text-sky-700 hover:text-sky-800'>
                  <i className="fi fi-rr-bell-ring"></i>
                </button>
                <a href={`https://api.politekniklp3i-tasikmalaya.ac.id/helpdesk/chats/download/${activeRoom.token}`} target='_blank' className='text-sky-700 hover:text-sky-800'>
                  <i className="fi fi-rr-download"></i>
                </a>
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
                {chats.length > 0 && chats.map((chat, index) => (
                  <div key={index}>
                    {chat.client === client ? (
                      <div className="w-full flex justify-end">
                        <div className="w-5/6 bg-sky-500 rounded-br-none shadow-sm p-5 rounded-2xl">
                          <div className="space-y-5">
                            <div className='space-y-2'>
                              <div className="flex items-center gap-1 text-[11px] text-sky-200">
                                <i className="fi fi-rr-arrow-turn-down-right flex text-sm"></i>
                                <span>Reply for {chat.reply}</span>
                              </div>
                              <p className="text-sm text-white">{chat.message}</p>
                            </div>
                            <p className="text-sky-200 flex items-center gap-1">
                              <span className="block text-xs">{moment(chat.date).tz('Asia/Jakarta').format('LLLL')}</span>
                            </p>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="w-full flex justify-start items-center gap-3">
                        <div className="w-5/6 bg-white rounded-bl-none shadow-sm p-5 rounded-2xl">
                          <div className="space-y-5">
                            <div className="space-y-1">
                              <h3 className="font-bold text-base text-gray-900">Ruangan {chat.client}</h3>
                              <p className="text-sm text-gray-700">{chat.message}</p>
                            </div>
                            <div className='flex items-center justify-between'>
                              <a target='_blank' href={`https://google.com/maps?q=${chat.latitude},${chat.longitude}`} className="text-gray-500 hover:text-gray-600 hover:underline flex items-center gap-1">
                                <span className="block text-xs"><i className="fi fi-rr-marker flex"></i></span>
                                <span className="block text-xs">{moment(chat.date).tz('Asia/Jakarta').format('LLLL')}</span>
                              </a>
                              <p className='flex items-center gap-1 text-xs text-gray-500'>
                                <i className="fi fi-rr-circle-user flex"></i>
                                <span>{chat.name_sender}</span>
                              </p>
                            </div>
                          </div>
                        </div>
                        <div className="w-1/6">
                          <button type='button' onClick={() => setReplyMessage(chat.client)} className='bg-sky-500 hover:bg-sky-600 text-sky-100 h-10 w-10 rounded-full'>
                            <i className="fi fi-rr-undo"></i>
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </section>
            <div className='w-full max-w-lg bg-white mx-auto px-8 pt-8 pb-5'>
              <div className='space-y-3'>
                <form onSubmit={sendMessage} className="flex items-center gap-2 max-w-lg mx-auto">
                  <div className="relative w-1/3">
                    <div className="absolute inset-y-0 start-0 flex items-center ps-3 pointer-events-none">
                      <i className={`fi fi-rr-${canSendMessage ? 'smart-home' : 'stopwatch'} text-gray-500`}></i>
                    </div>
                    <input type="text" value={replyMessage} onChange={(e) => setReplyMessage(e.target.value)} className={`${canSendMessage ? 'bg-gray-50' : 'bg-gray-200'} border border-gray-300 text-gray-900 text-sm rounded-xl focus:ring-blue-500 focus:border-blue-500 block w-full ps-10 p-2.5`} placeholder='Ruangan' required disabled={!canSendMessage} autoFocus={true} />
                  </div>
                  <div className="relative w-2/3">
                    <div className="absolute inset-y-0 start-0 flex items-center ps-3 pointer-events-none">
                      <i className={`fi fi-rr-${canSendMessage ? 'comment' : 'stopwatch'} text-gray-500`}></i>
                    </div>
                    <input type="text" value={message} onChange={(e) => setMessage(e.target.value)} className={`${canSendMessage ? 'bg-gray-50' : 'bg-gray-200'} border border-gray-300 text-gray-900 text-sm rounded-xl focus:ring-blue-500 focus:border-blue-500 block w-full ps-10 p-2.5`} placeholder={`${canSendMessage ? 'Tulis pesan disini...' : 'Tolong ditunggu selama 2 detik!'}`} required disabled={!canSendMessage} autoFocus={true} />
                  </div>
                  {
                    canSendMessage &&
                    <button type="submit" className="flex gap-2 items-center justify-center py-2.5 px-3 text-sm font-medium text-white bg-sky-600 rounded-xl hover:bg-sky-700 focus:ring-4 focus:outline-none focus:ring-blue-300">
                      <i className="flex fi fi-rr-paper-plane"></i>
                      <span>Kirim</span>
                    </button>
                  }
                </form>
                <div className='text-center space-y-1'>
                  <h5 className='font-bold text-xs text-gray-600'>Catatan:</h5>
                  <p className='text-xs text-gray-500 text-center'>Harap berikan deskripsi masalah yang jelas kepada tim ICT kami, sehingga kami dapat memberikan solusi yang tepat.</p>
                </div>
              </div>
            </div>
            <footer className='w-full max-w-lg mx-auto bg-white py-2'>
              <a href='https://politekniklp3i-tasikmalaya.ac.id' target='_blank' className='block text-center text-[11px] font-medium text-gray-600'>Copyright © 2024 Politeknik LP3I Kampus Tasikmalaya</a>
            </footer>
          </section>
        ) : (
          <section className='bg-sky-800 flex flex-col items-center justify-center h-screen'>
            <Lottie animationData={chatAnimation} loop={true} className='w-1/3 md:w-1/6' />
            <div className='text-center space-y-5'>
              <div className='space-y-1'>
                <h2 className='font-bold text-2xl text-white'>Admin Helpdesk Chat</h2>
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
              <a href='https://politekniklp3i-tasikmalaya.ac.id' target='_blank' className='block text-xs text-sky-400'>Copyright © 2024 Politeknik LP3I Kampus Tasikmalaya</a>
            </div>
          </section>
        )
      }
    </main>
  )
}

export default Admin