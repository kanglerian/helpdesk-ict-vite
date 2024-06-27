import React, { useEffect, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import Lottie from "lottie-react";
import chatAnimation from "../assets/chat-animation.json";
import BackgroundPattern from '../assets/flatten.png'
import Woman from '../assets/woman.png'
import Man from '../assets/man.png'
import Default from '../assets/default.png'
import Custom from '../assets/custom.png'
import Secret from '../assets/secret.png'

const Admin = () => {
  const navigate = useNavigate();
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

  const checkActive = () => {
    const room = localStorage.getItem('HELPDESK:room_admin');
    const account = localStorage.getItem('HELPDESK:account_admin');
    if (account) {
      if (!room) {
        let data = {
          name: "Utama",
          token: 46150,
          type: 0,
          secret: 0,
        }
        localStorage.setItem('HELPDESK:room_admin', JSON.stringify(data));
        setLogged(true)
      } else {
        const roomStorage = localStorage.getItem('HELPDESK:room_admin');
        const result = JSON.parse(roomStorage);
        setLogged(true)
        setActive(result);
      }
    } else {
      if (username == 'lp3itasik' && password == 'mimin311') {
        let data = {
          name: "Administrator",
        }
        localStorage.setItem('HELPDESK:account_admin', JSON.stringify(data));
        setLogged(true)
      } else {
        setLogged(false)
      }
    }
  }

  const changeRoom = (name, token, type) => {
    let data = {
      name: name,
      token: token,
      type: type
    }
    localStorage.setItem('HELPDESK:room_admin', JSON.stringify(data));
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
      localStorage.setItem('HELPDESK:room_admin', JSON.stringify(data));
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
      localStorage.setItem('HELPDESK:room_admin', JSON.stringify(data));
      checkActive();
    }
  }

  const removeToken = () => {
    const logoutPrompt = confirm('Apakah anda yakin akan keluar?');
    if(logoutPrompt){
      localStorage.removeItem('HELPDESK:room_admin');
      localStorage.removeItem('HELPDESK:account_admin');
      setLogged(false);
      navigate('/')
    }
  }

  const loginFunc = (e) => {
    e.preventDefault();
    if (username == 'lp3itasik' && password == 'mimin311') {
      let data = {
        name: "Administrator",
        code: '1921684041'
      }
      localStorage.setItem('HELPDESK:account_admin', JSON.stringify(data));
      setLogged(true)
      checkActive()
    } else {
      alert('Username atau Password salah!')
      setLogged(false)
    }
  }

  useEffect(() => {
    checkActive();
  }, []);

  return (
    <main className={`bg-slate-50 overflow-hidden`}>
      {
        logged ? (
          <section className='flex flex-col justify-between h-screen'>
            <nav className='flex items-center justify-between w-full max-w-lg bg-white mx-auto p-5'>
              <div className='flex items-end gap-2'>
                <i className="fi fi-rr-user-headset text-xl"></i>
                <h1 className='font-bold text-xl'>Chat {active.name}</h1>
              </div>
              <div className='flex items-center gap-5'>
                <button onClick={removeToken} type='button' className='text-sky-700 hover:text-sky-800'>
                  <i className="fi fi-rr-key"></i>
                </button>
                <button type='button' className='text-emerald-500 hover:text-emerald-600'>
                  <i className="fi fi-rr-wifi"></i>
                </button>
                <button onClick={() => setEnableRoom(!enableRoom)} type='button' className='text-sky-700 hover:text-sky-800'>
                  <i className="fi fi-rr-dropdown-select"></i>
                </button>
              </div>
            </nav>
            {
              enableRoom &&
              <section className="w-full h-1/5 max-w-lg mx-auto bg-white flex flex-nowrap overflow-x-auto border-gray-200 text-gray-500 px-5 gap-5">
                <button type='button' onClick={() => changeRoom('Utama', '46150', '0')} className="w-auto flex flex-col items-center space-y-1 p-1 md:p-0">
                  <div className='w-full flex flex-col items-center justify-center gap-1'>
                    <div className='w-10 h-10 bg-cover bg-center' style={{ backgroundImage: `url(${Default})` }}></div>
                    <h4 className='text-xs text-gray-800 font-medium'>Utama</h4>
                  </div>
                </button>
                <button type='button' onClick={() => changeRoom('ICT', '46151', '0')} className="w-auto flex flex-col items-center space-y-1 p-1 md:p-0">
                  <div className='w-full flex flex-col items-center justify-center gap-1'>
                    <div className='w-10 h-10 bg-cover bg-center' style={{ backgroundImage: `url(${Man})` }}></div>
                    <h4 className='text-xs text-gray-800 font-medium'>ICT</h4>
                  </div>
                </button>
                <button type='button' onClick={() => changeRoom('Pendidikan', '46152', '0')} className="w-auto flex flex-col items-center space-y-1 p-1 md:p-0">
                  <div className='w-full flex flex-col items-center justify-center gap-1'>
                    <div className='w-10 h-10 bg-cover bg-center' style={{ backgroundImage: `url(${Woman})` }}></div>
                    <h4 className='text-xs text-gray-800 font-medium'>Pendidikan</h4>
                  </div>
                </button>
                <button type='button' onClick={manualRoom} className="w-auto flex flex-col items-center space-y-1 p-1 md:p-0">
                  <div className='w-full flex flex-col items-center justify-center gap-1'>
                    <div className='w-10 h-10 bg-cover bg-center' style={{ backgroundImage: `url(${Custom})` }}></div>
                    <h4 className='text-xs text-gray-800 font-medium'>Manual</h4>
                  </div>
                </button>
                <button type='button' onClick={secretRoom} className="w-auto flex flex-col items-center space-y-1 p-1 md:p-0">
                  <div className='w-full flex flex-col items-center justify-center gap-1'>
                    <div className='w-10 h-10 bg-cover bg-center' style={{ backgroundImage: `url(${Secret})` }}></div>
                    <h4 className='text-xs text-gray-800 font-medium'>Secret</h4>
                  </div>
                </button>
              </section>
            }
            <section className={`w-full max-w-lg mx-auto bg-cover bg-slate-300 bg-blend-multiply h-screen overflow-y-auto p-5 shadow-inner`} style={{ backgroundImage: `url(${BackgroundPattern})` }}>
              <div className='flex flex-col gap-4'>
                <div className='w-full flex justify-start items-center gap-3'>
                  <div className='w-5/6 bg-white shadow-sm p-5 rounded-2xl rounded-bl-none'>
                    <div className='mb-4 space-y-1'>
                      <h3 className='font-bold text-base text-gray-900'>Career Center</h3>
                      <p className='text-sm text-gray-700'>Lorem ipsum dolor sit amet consectetur adipisicing elit. Nemo, cupiditate.</p>
                    </div>
                    <button type='button' className='text-gray-500 hover:text-gray-600 flex items-end gap-1'>
                      <span className='block text-xs'><i className="fi fi-rr-marker"></i></span>
                      <span className='block text-xs'>Selasa, 24 Maret 2024. 20:22 WIB</span>
                    </button>
                  </div>
                  <div className="w-1/6">
                    <button type="submit" className="flex gap-2 items-center justify-center py-2.5 px-3 text-sm font-medium text-white bg-sky-600 rounded-xl hover:bg-sky-700 focus:ring-4 focus:outline-none focus:ring-blue-300">
                      <i className="fi fi-rr-comment"></i>
                      <span>Balas</span>
                    </button>
                  </div>
                </div>
                <div className='w-full flex justify-start items-center gap-3'>
                  <div className='w-5/6 bg-white shadow-sm p-5 rounded-2xl rounded-bl-none'>
                    <div className='mb-4 space-y-1'>
                      <h3 className='font-bold text-base text-gray-900'>Career Center</h3>
                      <p className='text-sm text-gray-700'>Lorem ipsum dolor sit amet consectetur adipisicing elit. Nemo, cupiditate.</p>
                    </div>
                    <button type='button' className='text-gray-500 hover:text-gray-600 flex items-end gap-1'>
                      <span className='block text-xs'><i className="fi fi-rr-marker"></i></span>
                      <span className='block text-xs'>Selasa, 24 Maret 2024. 20:22 WIB</span>
                    </button>
                  </div>
                  <div className="w-1/6">
                    <button type="submit" className="flex gap-2 items-center justify-center py-2.5 px-3 text-sm font-medium text-white bg-sky-600 rounded-xl hover:bg-sky-700 focus:ring-4 focus:outline-none focus:ring-blue-300">
                      <i className="fi fi-rr-comment"></i>
                      <span>Balas</span>
                    </button>
                  </div>
                </div>
                <div className='w-full flex justify-start items-center gap-3'>
                  <div className='w-5/6 bg-white shadow-sm p-5 rounded-2xl rounded-bl-none'>
                    <div className='mb-4 space-y-1'>
                      <h3 className='font-bold text-base text-gray-900'>Career Center</h3>
                      <p className='text-sm text-gray-700'>Lorem ipsum dolor sit amet consectetur adipisicing elit. Nemo, cupiditate.</p>
                    </div>
                    <button type='button' className='text-gray-500 hover:text-gray-600 flex items-end gap-1'>
                      <span className='block text-xs'><i className="fi fi-rr-marker"></i></span>
                      <span className='block text-xs'>Selasa, 24 Maret 2024. 20:22 WIB</span>
                    </button>
                  </div>
                  <div className="w-1/6">
                    <button type="submit" className="flex gap-2 items-center justify-center py-2.5 px-3 text-sm font-medium text-white bg-sky-600 rounded-xl hover:bg-sky-700 focus:ring-4 focus:outline-none focus:ring-blue-300">
                      <i className="fi fi-rr-comment"></i>
                      <span>Balas</span>
                    </button>
                  </div>
                </div>
                <div className='w-full flex justify-start items-center gap-3'>
                  <div className='w-5/6 bg-white shadow-sm p-5 rounded-2xl rounded-bl-none'>
                    <div className='mb-4 space-y-1'>
                      <h3 className='font-bold text-base text-gray-900'>Career Center</h3>
                      <p className='text-sm text-gray-700'>Lorem ipsum dolor sit amet consectetur adipisicing elit. Nemo, cupiditate.</p>
                    </div>
                    <button type='button' className='text-gray-500 hover:text-gray-600 flex items-end gap-1'>
                      <span className='block text-xs'><i className="fi fi-rr-marker"></i></span>
                      <span className='block text-xs'>Selasa, 24 Maret 2024. 20:22 WIB</span>
                    </button>
                  </div>
                  <div className="w-1/6">
                    <button type="submit" className="flex gap-2 items-center justify-center py-2.5 px-3 text-sm font-medium text-white bg-sky-600 rounded-xl hover:bg-sky-700 focus:ring-4 focus:outline-none focus:ring-blue-300">
                      <i className="fi fi-rr-comment"></i>
                      <span>Balas</span>
                    </button>
                  </div>
                </div>
                <div className='w-full flex justify-end'>
                  <div className='w-5/6 bg-sky-500 shadow-sm p-5 rounded-2xl rounded-br-none'>
                    <p className='text-sm text-white'>Lorem ipsum dolor sit amet consectetur adipisicing elit. Nemo, cupiditate.</p>
                  </div>
                </div>
              </div>
            </section>
            <div className='w-full max-w-lg bg-white mx-auto px-8 pt-8 pb-5'>
              <div className='space-y-3'>
                <form className="flex items-center gap-2 max-w-lg mx-auto">
                  <div className="relative w-1/3">
                    <div className="absolute inset-y-0 start-0 flex items-center ps-3 pointer-events-none">
                      <i className="fi fi-rr-user text-gray-500"></i>
                    </div>
                    <input type="text" id="voice-search" className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-xl focus:ring-blue-500 focus:border-blue-500 block w-full ps-10 p-2.5" placeholder="Room" required />
                  </div>
                  <div className="relative w-2/3">
                    <div className="absolute inset-y-0 start-0 flex items-center ps-3 pointer-events-none">
                      <i className="fi fi-rr-comment text-gray-500"></i>
                    </div>
                    <input type="text" id="voice-search" className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-xl focus:ring-blue-500 focus:border-blue-500 block w-full ps-10 p-2.5" placeholder="Tulis pesan disini..." required />
                  </div>
                  <button type="submit" className="flex gap-2 items-center justify-center py-2.5 px-3 text-sm font-medium text-white bg-sky-600 rounded-xl hover:bg-sky-700 focus:ring-4 focus:outline-none focus:ring-blue-300">
                    <i className="flex fi fi-rr-paper-plane"></i>
                    <span>Kirim</span>
                  </button>
                </form>
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
                <h2 className='font-bold text-2xl text-white'>Admin Helpdesk Chat</h2>
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

export default Admin