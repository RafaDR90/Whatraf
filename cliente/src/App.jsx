import React, { useState, useEffect } from 'react';
import { socket } from './socket';
import { useNavigate } from 'react-router-dom';

export default function App() {
  const [nombre, setNombre] = useState('');
  const navigate = useNavigate();
  const fileInput = document.getElementById('fileInput');
  const endpoint = 'http://localhost:3000/upload';

  function asignaNombre() {
    if (nombre.trim() !== '') {
      socket.nombre = nombre;
      navigate('/chat');
    } else {
      console.log('Por favor, ingresa un nombre válido.');
    }
  }

  function insertaImagen() {
    const fileInput = document.getElementById('fileInput');
    const file = fileInput.files[0];
    const formData = new FormData();
    formData.append('sampleFile', file);
    fetch(endpoint, {
      method: 'POST',
      body: formData
    })
    .then(data => {
      console.log(data);
      alert('File uploaded successfully!');
    })
    .catch(error => {
      console.error(error);
      alert('Error uploading file');
    });
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
      <form>
      <input type="file" id="fileInput" name="fileInput"></input>
      <button type="button" onClick={insertaImagen} id="uploadButton">Upload</button>
      </form>
    </div>
  );
}
