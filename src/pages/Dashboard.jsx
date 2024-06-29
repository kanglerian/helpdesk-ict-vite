import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'
import Lottie from "lottie-react";
import chatAnimation from "../assets/chat-animation.json";
import Man from '../assets/man.png'
import Custom from '../assets/custom.png'
import Secret from '../assets/secret.png'
import { io } from 'socket.io-client'

const Dashboard = () => {
  const navigate = useNavigate();
  const [connection, setConnection] = useState(false);
  const [rooms, setRooms] = useState([]);
  const [chats, setChats] = useState([]);
  const client = 'Administrator';
  const [enableRoom, setEnableRoom] = useState(false);
  const [active, setActive] = useState({
    name: 'Utama',
    token: 46150,
    type: 0,
    secret: 0,
  });
  const [logged, setLogged] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [replyMessage, setReplyMessage] = useState('');
  const [message, setMessage] = useState('');
  const [helpdeskRoom, setHelpdeskRoom] = useState({});
  const [helpdeskAccount, setHelpdeskAccount] = useState({});

  const socket = io('http://localhost:3000');

  socket.on("connect", () => {
    console.log('Berhasil terhubung ke server Socket.IO');
    setConnection(true);
  });

  socket.on("connect_error", () => {
    console.log('Koneksi ke server Socket.IO terputus. Pesan tidak terkirim. Coba lagi nanti.');
    setConnection(false);
  });

  const checkActive = () => {
    const room = localStorage.getItem('HELPDESK:room_dashboard');
    const account = localStorage.getItem('HELPDESK:account_dashboard');
    if (account) {
      const accountStorage = localStorage.getItem('HELPDESK:account_dashboard');
      const resultAccount = JSON.parse(accountStorage);
      setHelpdeskAccount(resultAccount);
      if (!room) {
        let data = {
          name: "Utama",
          token: 46150,
          type: 0,
          secret: 0,
        }
        setHelpdeskRoom(data);
        localStorage.setItem('HELPDESK:room_dashboard', JSON.stringify(data));
        getRooms();
        getChats(data);
        setLogged(true)
      } else {
        const roomStorage = localStorage.getItem('HELPDESK:room_dashboard');
        const resultRoom = JSON.parse(roomStorage);
        setHelpdeskRoom(resultRoom);
        setActive(resultRoom);
        getRooms();
        getChats(resultRoom);
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
        console.log(error.error);
      })
  }

  const getChats = async (helpdeskRoom) => {
    await axios.get('http://localhost:3001/chats')
      .then((response) => {
        const responseChat = response.data;
        const resultFilter = responseChat.filter(
          (chat) =>
            chat.token == helpdeskRoom.token &&
            chat.role_sender == 'S'
        );
        setChats(resultFilter);
      })
      .catch((error) => {
        console.log(error.error);
      })
  }

  const changeRoom = (name, token, type, secret) => {
    let data = {
      name: name,
      token: token,
      type: type,
      secret: secret,
    }
    setHelpdeskRoom(data);
    localStorage.setItem('HELPDESK:room_dashboard', JSON.stringify(data));
    checkActive();
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
      setHelpdeskRoom(data);
      localStorage.setItem('HELPDESK:room_dashboard', JSON.stringify(data));
      checkActive();
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
      setHelpdeskRoom(data);
      localStorage.setItem('HELPDESK:room_dashboard', JSON.stringify(data));
      checkActive();
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


  const loginFunc = async (e) => {
    e.preventDefault();
    if(!username){
      return alert('Username tidak boleh kosong!');
    }
    if(!password){
      return alert('Password tidak boleh kosong!');
    }
    try {
      const responseUser = await axios.get(`http://localhost:3001/users?username=${username}&password=${password}&role=A`)
      const dataUser = responseUser.data;
      if (dataUser.length > 0) {
        let data = {
          name: dataUser[0].name,
          uuid: dataUser[0].uuid,
          role: dataUser[0].role
        }
        setHelpdeskAccount(data);
        localStorage.setItem('HELPDESK:account_dashboard', JSON.stringify(data));
        setLogged(true)
        checkActive()
      } else {
        alert('Username atau Password salah!')
        setLogged(false)
      }
    } catch (error) {
      alert(error.message);
    }
  }

  useEffect(() => {
    checkActive();
  }, []);
  return (
    <main className='bg-slate-900 h-screen'>
      {
        logged ? (
          <section className="w-full bg-slate-900 h-screen overflow-y-auto p-5 pt-8 md:p-14">
            <nav className='fixed top-0 left-0 right-0 grid grid-cols-1 md:grid-cols-3 gap-5 items-center w-full bg-white p-5'>
              <div className='flex items-end justify-center md:justify-start gap-2'>
                <i className="fi fi-rr-user-headset text-xl"></i>
                <h1 className='font-bold text-xl'>Chat {active.name}</h1>
              </div>
              {
                rooms.length > 0 && (
                  <section className="flex items-center justify-center md:justify-end gap-10">
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
              <div className='flex items-center justify-center md:justify-end gap-5'>
                <button type='button' className={`${connection ? 'text-emerald-500' : 'text-red-500'}`}>
                  <i className="fi fi-rr-wifi"></i>
                </button>
                <button onClick={removeToken} type='button' className='text-sky-700 hover:text-sky-800'>
                  <i className="fi fi-rr-key"></i>
                </button>
              </div>
            </nav>
            <div className='flex flex-col gap-5 pt-52 md:pt-20'>

              {
                chats.length > 0 && chats.map((chat) =>
                  <div key={chat.id} className='w-full flex flex-col md:flex-row justify-start items-center gap-5'>
                    <div className='w-full bg-slate-700 shadow-sm p-8 rounded-2xl rounded-bl-none'>
                      <div className='mb-5 space-y-1'>
                        <h3 className='font-bold text-xl md:text-3xl text-slate-50'>{chat.client}</h3>
                        <p className='text-base md:text-lg text-slate-200'>{chat.message}</p>
                      </div>
                      <button type='button' className=' text-slate-500 hover:text-slate-600 flex items-end gap-1'>
                        <span className='block text-xs'><i className="fi fi-rr-marker"></i></span>
                        <span className='block text-xs'>{chat.date}</span>
                      </button>
                    </div>
                  </div>
                )
              }
            </div>
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

export default Dashboard