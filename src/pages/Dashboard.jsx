import React, { useState, useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import Lottie from "lottie-react";
import chatAnimation from "../assets/chat-animation.json";
import Woman from '../assets/woman.png'
import Man from '../assets/man.png'
import Default from '../assets/default.png'
import Custom from '../assets/custom.png'
import Secret from '../assets/secret.png'

const Dashboard = () => {
  const navigate = useNavigate();
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
    const room = localStorage.getItem('HELPDESK:room_dashboard');
    const account = localStorage.getItem('HELPDESK:account_dashboard');
    if (account) {
      if (!room) {
        let data = {
          name: "Utama",
          token: 46150,
          type: 0,
          secret: 0,
        }
        localStorage.setItem('HELPDESK:room_dashboard', JSON.stringify(data));
        setLogged(true)
      } else {
        const roomStorage = localStorage.getItem('HELPDESK:room_dashboard');
        const result = JSON.parse(roomStorage);
        setLogged(true)
        setActive(result);
      }
    } else {
      if (username == 'lp3itasik' && password == 'mimin311') {
        let data = {
          name: "Administrator",
        }
        localStorage.setItem('HELPDESK:account_dashboard', JSON.stringify(data));
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
      navigate('/')
    }
  }

  const loginFunc = (e) => {
    e.preventDefault();
    if (username == 'lp3itasik' && password == 'mimin311') {
      let data = {
        name: "Administrator",
        code: '1921684041',
        role: 'S'
      }
      localStorage.setItem('HELPDESK:account_dashboard', JSON.stringify(data));
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
    <main className='bg-slate-900 h-screen'>
      {
        logged ? (
          <section className="w-full bg-slate-900 h-screen overflow-y-auto p-5 pt-8 md:p-14">
            <nav className='fixed top-0 left-0 right-0 grid grid-cols-1 md:grid-cols-3 gap-5 items-center w-full bg-white p-5'>
              <div className='flex items-end justify-center md:justify-start gap-2'>
                <i className="fi fi-rr-user-headset text-xl"></i>
                <h1 className='font-bold text-xl'>Chat {active.name}</h1>
              </div>
              <div className='flex items-center justify-center md:justify-end gap-10'>
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
              </div>
              <div className='flex items-center justify-center md:justify-end gap-5'>
                <button type='button' className='text-emerald-500 hover:text-emerald-600'>
                  <i className="fi fi-rr-wifi"></i>
                </button>
                <button onClick={removeToken} type='button' className='text-sky-700 hover:text-sky-800'>
                  <i className="fi fi-rr-key"></i>
                </button>
              </div>
            </nav>
            <div className='flex flex-col gap-8 pt-52 md:pt-16'>
              <div className='w-full flex flex-col md:flex-row justify-start items-center gap-5'>
                <div className='w-full md:w-5/6 bg-slate-700 shadow-sm p-5 rounded-2xl rounded-bl-none'>
                  <div className='mb-4 space-y-2'>
                    <h3 className='font-bold text-xl md:text-3xl text-slate-50'>Career Center</h3>
                    <p className='text-base md:text-lg text-slate-200'>Lorem ipsum dolor sit amet consectetur adipisicing elit. Nemo, cupiditate.</p>
                  </div>
                  <button type='button' className=' text-slate-500 hover:text-slate-600 flex items-end gap-1'>
                    <span className='block text-xs'><i className="fi fi-rr-marker"></i></span>
                    <span className='block text-xs'>Selasa, 24 Maret 2024. 20:22 WIB</span>
                  </button>
                </div>
                <div className='w-full md:w-1/6 flex flex-wrap gap-2'>
                  <button type="button" className='bg-sky-500 hover:bg-sky-600 text-white text-sm px-4 py-2.5 rounded-xl'>Ayeuna kadinya!</button>
                  <button type="button" className='bg-sky-500 hover:bg-sky-600 text-white text-sm px-4 py-2.5 rounded-xl'>Siapp...</button>
                  <button type="button" className='bg-sky-500 hover:bg-sky-600 text-white text-sm px-4 py-2.5 rounded-xl'>Mohon ditunggu sebentar</button>
                </div>
              </div>
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

export default Dashboard