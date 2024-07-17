import { io } from 'socket.io-client';
const URL = 'https://api.politekniklp3i-tasikmalaya.ac.id';
export const socket = io(URL);