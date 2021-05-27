import styled from 'styled-components'
import {useAuthState} from 'react-firebase-hooks/auth'
import {db, auth} from '../firebase'
import {useRouter} from 'next/router'
import {useCollection} from 'react-firebase-hooks/firestore'
import { Avatar, IconButton } from '@material-ui/core';
import { AttachFile, InsertEmoticon, MoreVert, Mic} from '@material-ui/icons';
import Message from './Message'
import { useRef, useState } from 'react'
import firebase from 'firebase'
import getRecipientEmail from '../utils/getRecipientEmail'
import TimeAgo from 'timeago-react'




function ChatScreen({chat, messages}) {
    const [input, setInput] = useState("")
    const [user] = useAuthState(auth);
    const endOfMessagesRef = useRef(null);
    const router = useRouter();
    const [messagesSnapshot] = useCollection(db.collection('chats').doc(router.query.id).collection('messages').orderBy("timestamp", "asc"))

    const [recipientSnapshot] = useCollection(
        db.collection('users').where("email", "==", getRecipientEmail(chat.users, user)),
    )

    const scrollToBottom = () => {
        endOfMessagesRef.current.scrollIntoView({
            behavior: "smooth",
            block: "start",
        })
    }

    const showMessages  = () => {
        if(messagesSnapshot) {
            return messagesSnapshot.docs.map(message => (
                
                <Message 
                    key={message.id}
                    user={message.data().user}
                    message={{
                        ...message.data(),
                        timestamp: message.data().timestamp?.toDate().getTime(),
                    }}
                />        
         ));
                
        }else {
            return JSON.parse(messages).map(message => (
                <Message 
                    key={message.id}
                    user={message.user}
                    message={message}
                />       
            ))
        }
    }

    const sendMessage = (e) => {
        e.preventDefault();
        //update the last seen....
        db.collection("users").doc(user.uid).set(
            {
                lastSeen: firebase.firestore.FieldValue.serverTimestamp(),
            },

            {merge: true}
        );
        db.collection('chats').doc(router.query.id).collection('messages').add({
            timestamp: firebase.firestore.FieldValue.serverTimestamp(),
            message: input,
            user: user.email,
            photoURL: user.photoURL,
        });

        setInput("");
        scrollToBottom();
    };
    const recipient = recipientSnapshot?.docs?.[0]?.data();
    const recipientEmail = getRecipientEmail(chat.users, user);
    return (
        <Container>
            <Header>
                {recipient ? (
                    <Avatar src={recipient?.photoURL} />
                ) : (
                    <Avatar>{recipientEmail[0]}</Avatar>
                )}
                <HeaderInformation>
                        <h3>{recipientEmail}</h3>
                        {recipientSnapshot ? (
                            <p>Last active: {''}
                                {recipient?.lastSeen.toDate() ? (
                                    <TimeAgo datetime={recipient?.lastSeen?.toDate()} />
                                ): "unavailable"}
                            </p>
                        ): (
                           <p>Loading last active</p> 
                        )}
                </HeaderInformation>
                <HeaderIcon>
                <IconButton>
                    <AttachFile />
                </IconButton>

                <IconButton>
                     <MoreVert />
                </IconButton>
                    
                </HeaderIcon>
            </Header>

            <MessageContainer>
            {showMessages()}
                <EndOfMessage ref={endOfMessagesRef} />
            </MessageContainer>
            <InputContainer>
                <InsertEmoticon />
                <Input value={input} onChange={e => setInput(e.target.value)} />
                <button hidden disabled={!input} type="submit" onClick={sendMessage}>Send Message</button>
                <Mic />
            </InputContainer>
        </Container>
    )
}

export default ChatScreen


const Container = styled.div`
    
`;

const Header = styled.div`
    position: static;
    background-color: white;
    z-index: 100;
    top: 0;
    display: flex;
    position: 11px;
    height: 80px;
    align-items: center;
    border-bottom: 1px solid whitesmoke;
`;


const HeaderInformation = styled.div`
    margin-left: 15px;
    flex: 1;
    >h3 {
        margin-bottom: 3px;
    }

    >p {
        font-size: 14px;
        color: grey;
    }
`;

const MessageContainer = styled.div`

    padding: 30px;
    background-color: #e5ded8;
    min-height: 90vh;
`;

const EndOfMessage = styled.div`
    margin-bottom: 50px;
`;


const HeaderIcon = styled.div``;

const Input = styled.input`
    flex: 1;
    outline: 0;
    border: none;
    border-radius: 10px;
    padding: 20px;
    background-color: whitesmoke;
    margin-left: 15px;
    margin-right: 15px;

`;

const InputContainer = styled.form`
    display: flex;
    align-items: center;
    padding: 10px;
    position: sticky;
    bottom: 0;
    background-color: #fff;
    z-index: 100;
`;