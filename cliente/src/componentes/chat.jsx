import React, { useState, useEffect } from 'react';
import { socket } from '../socket';
import './chat.css';







export default function chat() {

    const [usuarios, setUsuarios] = useState([]);
    // voy por aqui, creo mensajes junto con emisor y receptor
    const [mensajes, setMensajes] = useState([]);
    const [chat, setChat] = useState(null);
    const [mensaje, setMensaje] = useState('');
    const [usuarioConectado, setUsuarioConectado] = useState('');
    const [usuarioDesconectado, setUsuarioDesconectado] = useState('');
    const [escribiendo, setEscribiendo] = useState([]);
    const [creandoSala, setCreandoSala] = useState(false);
    const [nombreSala, setNombreSala] = useState('');
    const [salas, setSalas] = useState([]);
    const [mensajesGlobales, setMensajesGlobales] = useState([]);
    let timeOutUsuarioConectado;
    let timeOutMeEscriben;
    let timeOutUsuarioDesconectado;
    
    



    function generaChat(usuario) {
        return () => {
            setChat(usuario)
        };
    }

    function enviarMensaje(id) {
        return () => {
            if(mensaje.trim() === '') return;
            socket.emit('mensajeTo', { mensaje: mensaje, id: id, emisor: socket.id});
            setMensajes([...mensajes, {mensaje: mensaje, emisor: socket.id, receptor: id}]);
            setMensaje('');
        };
    }

    function enviarEscribiendo(id) {
        socket.emit('escribiendo', {receptor: id, emisor: socket.id});
    }

    function creaSala(){
        socket.emit('creaSala', nombreSala);
    }

    function enviarAll() {
        if(mensaje.trim() === '') return;
        socket.emit('mensajeGloval', {mensaje: mensaje, emisor: socket.id, receptor: 'all'});
        setMensaje('');
    }
    
    useEffect(() => {
        socket.on('usuariosConectados', usuarios => {
            setUsuarios(usuarios);
        });

        socket.on('getMensajeGlobal', msg => {
            console.log('mensaje globalcas');
            //busco el nombre del emisor
            console.log(usuarios);
            if(usuarios.length > 0){
                var nombreEmisor = usuarios.find(usuario => usuario.socketId === msg.emisor).nombre;
                console.log(nombreEmisor);

            }
            setMensajesGlobales(prevMensajesGlobales => [...prevMensajesGlobales, {mensaje: msg.mensaje, emisor: msg.emisor}]);
        });
        

        socket.on('rooms', rooms => {
            nombreSalas = Object.keys(rooms);
            setSalas(rooms);
        });

        socket.on('usuarioDesconectado', nombre => {
            setUsuarioDesconectado(`${nombre} se ha ido.`);
            if (timeOutUsuarioDesconectado) {
                clearTimeout(timeOutUsuarioDesconectado);
            }
            timeOutUsuarioDesconectado = setTimeout(() => {
                setUsuarioDesconectado('');
            }, 3000);
        });
        
        socket.on('meEscriben', nombre => {
            //si ya hay un timeOut, lo elimino
            if (timeOutMeEscriben) {
                clearTimeout(timeOutMeEscriben);
            }
            //añado al array escribiendo el nombre del usuario que esta escribiendo
            setEscribiendo(prevEscribiendo => [...prevEscribiendo, nombre]);
            timeOutMeEscriben = setTimeout(() => {
                setEscribiendo(escribiendo.filter(usuario => usuario !== nombre));
            }, 3000);
        });

        socket.on('mensaje', msg => {
            // Verificar si el mensaje recibido es para el cliente actual
            setMensajes(prevMensajes => [...prevMensajes, {mensaje: msg.mensaje, emisor: msg.emisor, receptor: msg.receptor}]);
        });

        socket.on('usuarioConectado', nombre => {
            if (timeOutUsuarioConectado) {
                clearTimeout(timeOutUsuarioConectado);
            }
            setUsuarioConectado(`Usuario conectado: ${nombre}`);
            timeOutUsuarioConectado = setTimeout(() => {
                setUsuarioConectado('');
            }, 3000);
        });
        
        return () => {
            socket.off('usuariosConectados');
            socket.off('mensaje');
            socket.off('usuarioConectado');
            clearTimeout(timeOutUsuarioConectado);
            clearTimeout(timeOutMeEscriben);
            clearTimeout(timeOutUsuarioDesconectado);
            socket.off('rooms');
            socket.off('getMensajeGlobal');
            socket.off('usuarioDesconectado'); //si da problemas la borro
        };
    }, []);

    useEffect(() => {
        
    }, [salas]);

    return (
        <div className='contenedor'>
            <div className='listaUsuarios'>
                <button onClick={() => setCreandoSala(true)}>Crear sala</button>
                <h3>Usuarios conectados:</h3>
                <ul>
                <li onClick={() => setChat(null)}>Chat general</li>

                    {usuarios.filter(usuario => usuario.socketId !== socket.id).map((usuario, index) => (
                        <li onClick={generaChat(usuario)} key={usuario.socketId}>
                            <img src={`./fotos/${usuario.foto}`} alt="foto de perfil" />
                            <p>{usuario.nombre}</p>
                            {escribiendo.includes(usuario.socketId) ? <p className='verdePequeno'>Escribiendo...</p> : <p></p>}
                        </li>
                    ))}
                </ul>
                <h3>Salas:</h3>
                <ul>
                    {Object.keys(salas).map((sala, index) => (
                        <li key={index}>{sala}</li>
                    ))}
                    </ul>
            </div>
            <div className='chat'>
                {chat ? (
                    <div>
                        {usuarioConectado ? <h5>{usuarioConectado}</h5> : <h5>{usuarioDesconectado}</h5>}
                        <h3>Chat con {chat.nombre}</h3>
                        <div className='mensajes'>
                            {mensajes.filter(mensaje => (mensaje.emisor === chat.socketId && mensaje.receptor === socket.id) || (mensaje.emisor === socket.id && mensaje.receptor === chat.socketId)).map((mensaje, index) => (
                                //si el mensaje es del usuario que esta chateando, se pone a la derecha y si no, a la izquierda
                                <div key={index} className={mensaje.emisor === socket.id ? 'mensaje derecha' : 'mensaje izquierda'}>
                                    <p>{mensaje.mensaje}</p>
                                    
                                </div>
                            ))}
                        </div>
                        <div className='inputs'>
                            <input type='text' value={mensaje} onChange={e =>{ 
                                setMensaje(e.target.value); 
                                enviarEscribiendo(chat.socketId);
                                }}
                                onKeyDown={e => {
                                    if (e.key === 'Enter') {
                                        enviarMensaje(chat.socketId)();
                                    }
                                }}  
                            />
                            <button onClick={enviarMensaje(chat.socketId)}>Enviar</button> 
                        </div>
                    </div>
                ) : (
                    <div>
                    {usuarioConectado ? <h5>{usuarioConectado}</h5> : <h5>{usuarioDesconectado}</h5>}
                        
                        <h3>Chat general</h3>
                        <div className='mensajes'>
                        {mensajesGlobales.map((mensaje, index) => {
                            const emisor = usuarios.find(usuario => usuario.socketId === mensaje.emisor);
                            const nombreEmisor = emisor ? emisor.nombre : "Desconocido"; 
                            return (
                                <div key={index} className={mensaje.emisor === socket.id ? 'mensaje derecha' : 'mensaje izquierda'}>
                                {mensaje.emisor !== socket.id && 
                                    <p style={{ fontWeight: 'bold', backgroundColor: 'white', borderRadius: '10px', paddingRight: '5px', paddingLeft:'5px' }}>
                                        {nombreEmisor}
                                    </p>
                                }
                                    <p>{mensaje.mensaje}</p>
                                </div>
                            );
                        })}
                        </div>
                        <div className='inputs'>
                            <input type='text' value={mensaje} onChange={e =>{ 
                                setMensaje(e.target.value); 
                                }}
                                onKeyDown={e => {
                                    if (e.key === 'Enter') {
                                        enviarAll();
                                    }
                                }}  
                            />
                            <button onClick={enviarAll}>Enviar</button>
                        </div>
                    </div>
                    
                )}
            </div>
            {creandoSala && (
    <div className='crearSala'>
        <input type='text' value={nombreSala} onChange={e => setNombreSala(e.target.value)} />
        <button onClick={() => creaSala(socket.id)}>Crear</button>
        <button onClick={() => setCreandoSala(false)}>Cerrar</button>
    </div>
)}

        </div>
    );
}