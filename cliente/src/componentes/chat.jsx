import React, { useState, useEffect } from 'react';
import { socket } from '../socket';
import './chat.css';



export default function chat() {

    const [usuarios, setUsuarios] = useState([]);
    // voy por aqui, creo mensajes junto con emisor y receptor
    const [mensajes, setMensajes] = useState([]);
    const [chat, setChat] = useState(null);
    const [mensaje, setMensaje] = useState('');

    function generaChat(usuario) {
        return () => {
            console.log(chat)
            setChat(usuario)
            console.log(chat);
        };
    }

    function enviarMensaje(id) {
        return () => {
            socket.emit('mensajeTo', { mensaje, id });
            setMensaje('');
        };
    }

    useEffect(() => {
        socket.on('usuariosConectados', usuarios => {
            setUsuarios(usuarios);
            console.log(usuarios);
        });

        socket.on('mensaje', mensaje => {
            
        });
        
        return () => {
            socket.off('usuariosConectados');
        };
    }, []);

    return (
        <div className='contenedor'>
            <div className='listaUsuarios'>
                <h3>Usuarios conectados:</h3>
                <ul>
                    {usuarios.map(usuario => (
                        <li onClick={generaChat(usuario)} key={usuario.socketId}>
                            <img src={`http://localhost:3000/fotos/${usuario.foto}`} alt="foto de perfil" />
                            <p>{usuario.nombre}</p>
                        </li>
                    ))}
                </ul>
            </div>
            <div className='chat'>
                {chat ? (
                    <div>
                        <h3>Chat con {chat.nombre}</h3>
                        <div className='mensajes'></div>
                        <div className='inputs'>
                            <input type='text' value={mensaje} onChange={e => setMensaje(e.target.value)} />
                            <button onClick={enviarMensaje(usuario.id)}>Enviar</button>
                        </div>
                    </div>
                ) : (
                    <h3>Selecciona un usuario para chatear</h3>
                )}
            </div>
        </div>
    );
}