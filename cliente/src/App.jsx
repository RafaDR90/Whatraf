import React, { useState, useEffect } from 'react';
import { socket } from './socket';
import { useNavigate } from 'react-router-dom';

export default function App() {
  const [nombre, setNombre] = useState('');
  const navigate = useNavigate();

  function asignaNombre() {
    if (nombre.trim() !== '') {
      socket.nombre = nombre;
      navigate('/chat');
    } else {
      console.log('Por favor, ingresa un nombre válido.');
    }
  }

  useEffect(() => {
    if (socket.nombre) {
      navigate('/chat');
    }
  }, [socket.nombre, navigate]);

  function onConnect() {
    console.log('Conectado al servidor.');
  }

  function onDisconnect() {
    console.log('Desconectado del servidor.');
  }

  function onFooEvent(value) {
    console.log('Evento foo recibido:', value);
  }

  useEffect(() => {
    socket.on('connection', onConnect);
    socket.on('disconnect', onDisconnect);
    socket.on('foo', onFooEvent);
    socket.on('usuariosConectados', (usuariosConectados) => {
      console.log('Usuarios conectados:', usuariosConectados);
    });

    return () => {
      socket.off('connection', onConnect);
      socket.off('disconnect', onDisconnect);
      socket.off('foo', onFooEvent);
      socket.off('usuariosConectados');
    };
  }, []);

  return (
    <div className="App">
      <h2>Bienvenido, escribe tu nombre para continuar:</h2>
      <input type='text' value={nombre} onChange={(e) => setNombre(e.target.value)} />
      <button onClick={asignaNombre}>Enviar</button>
    </div>
  );
}
