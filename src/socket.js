import { io } from 'socket.io-client';
const URL = 'https://api.politekniklp3i-tasikmalaya.ac.id/helpdesk';
export const socket = io(URL);