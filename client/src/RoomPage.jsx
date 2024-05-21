import {useEffect, useRef, useState} from "react";
import {useParams} from "react-router";
import {useNavigate} from "react-router-dom";

export default function RoomPage(){

    const navigate = useNavigate();

    const roomName = useParams().roomName;
    const query = new URLSearchParams(window.location.search);
    const name = query.get('name');

    const [messages, setMessages] = useState([]);
    const [connected, setConnected] = useState(false);
    const socket = useRef();


    useEffect(() => {
        // Создаем соединение WebSocket при монтировании компонента
        socket.current = new WebSocket('ws://localhost:5000');

        socket.current.onopen = () => {
            setConnected(true);
            console.log('Подключение установлено');
            let message = {
                event: 'connection',
                name: name,
                roomName: roomName,
            };
            console.log('Перед отправкой конекта');
            socket.current.send(JSON.stringify(message));
            console.log('После отправки конекта');
        };

        socket.current.onmessage = (event) => {
            let message = JSON.parse(event.data);
            console.log('Получено сообщение ' + message);

            switch (message.event) {
                case 'response':
                    console.log('Вы подключены к комнате');
                    break;
                case 'newPlayer':
                    console.log('Подключен пользователь ', message.name);
                    break;
                case 'message':
                    console.log('Сообщение от ' + message.sender + ' : ', message.text);
                    break;
                case 'disconnect':
                    console.log(`Пользователь ${message.name} был отключен от комнаты`);
                    break;
            }
        };

        socket.current.onclose = () => {
            console.log('Подключение закрыто');
        };

        socket.current.onerror = () => {
            console.log('Ошибка');
        };

        // Закрываем соединение при размонтировании компонента
        return () => {
            if (socket.current) {
                socket.current.close();
            }
        };
    }, []);



    function sendMessage(){
        console.log('Отправляется сообщение')
        let message = {
            event: 'message',
            text: 'text',
            roomName: roomName,
        }
        socket.current.send(JSON.stringify(message));
        console.log('Сообщение отправлено')
    }
    function leaveRoom(){
        let message = {
            event: 'disconnect',
            name: name,
            roomName: roomName,
        };
        socket.current.send(JSON.stringify(message));
        socket.current.close();
        socket.current = null; // Обнуляем ссылку на WebSocket объект
        navigate(`/`);
    }

    return (
        <div>
            <button onClick={sendMessage}>Отправить сообщение</button>
            <button onClick={leaveRoom}>Выйти из комнаты</button>
        </div>
    );
}