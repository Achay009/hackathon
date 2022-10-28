import React, { useRef, useState, useEffect} from 'react';
import './App.css';
import axios from 'axios'
import firebase from 'firebase/app';
import 'firebase/firestore';
import 'firebase/auth';
import 'firebase/analytics';



import { useAuthState } from 'react-firebase-hooks/auth';
import { useCollectionData } from 'react-firebase-hooks/firestore';

firebase.initializeApp({
  apiKey: "AIzaSyDcq-WCSuwM-m2Cay6cfqjKDEj7S2O-Py8",
  authDomain: "hackathon-906bf.firebaseapp.com",
  projectId: "hackathon-906bf",
  storageBucket: "hackathon-906bf.appspot.com",
  messagingSenderId: "637654124074",
  appId: "1:637654124074:web:1c385fc0258eca67fca553",
  measurementId: "G-C33WRXMYBB"
})


const auth = firebase.auth();
const firestore = firebase.firestore();
const analytics = firebase.analytics();


function App() {

  const [user] = useAuthState(auth);

  return (
    <div className="App">
      <header>
        {/* <h1>⚛️🔥💬</h1> */}
        <h1>💬 SEP TEAM 1</h1>
        <SignOut />
      </header>

      <section>
        {user ? <ChatRoom /> : <SignIn />}
      </section>

    </div>
  );
}

function SignIn() {

  const signInWithGoogle = () => {
    const provider = new firebase.auth.GoogleAuthProvider();
    auth.signInWithPopup(provider);
  }

  return (
    <>
      <button className="sign-in" onClick={signInWithGoogle}>Sign in with Google</button>
    </>
  )

}

function SignOut() {
  return auth.currentUser && (
    <button className="sign-out" onClick={() => auth.signOut()}>Sign Out</button>
  )
}


function ChatRoom() {
  const dummy = useRef();
  const messagesRef = firestore.collection('messages');
  const query = messagesRef.orderBy('createdAt').limit(25);

  const [messages] = useCollectionData(query, { idField: 'id' });

  const [formValue, setFormValue] = useState('');


  const sendMessage = async (e) => {
    e.preventDefault();

    const { uid, photoURL, displayName} = auth.currentUser;

    const response = await axios.post('https://d1zqqz8u9h.execute-api.us-east-1.amazonaws.com/prod', {inputTranscript : formValue}, {
      headers: {
        'Content-Type': 'application/json'
      }
    })

    const data = JSON.parse(response.data.body)

    await messagesRef.add({
      displayName : displayName,
      text: formValue,
      createdAt: firebase.firestore.FieldValue.serverTimestamp(),
      uid,
      photoURL,
      sentiment : data['sentiment']
    })

    setFormValue('');
    dummy.current.scrollIntoView({ behavior: 'smooth' });
  }

  return (<>
    <main>

      {messages && messages.map(msg => <ChatMessage key={msg.id} message={msg} />)}

      <span ref={dummy}></span>

    </main>

    <form onSubmit={sendMessage}>

      <input value={formValue} onChange={(e) => setFormValue(e.target.value)} placeholder="say something nice" />

      <button type="submit" disabled={!formValue}>🚀</button>

    </form>
  </>)
}


function ChatMessage(props) {
  const { text, uid, photoURL, displayName, sentiment } = props.message;

  const messageClass = uid === auth.currentUser.uid ? 'sent' : 'received';

  let result = <span className={`sentiment ${messageClass === 'sent' ? 'block_sent' : 'block_receive'}`}>{displayName} seems 😐</span>;
  if (sentiment === "NEUTRAL"){ result = <span className={`sentiment ${messageClass === 'sent' ? 'block_sent' : 'block_receive'}`}>{displayName} seems 😐</span>}
  if (sentiment === "POSITIVE"){ result = <span className={`sentiment ${messageClass === 'sent' ? 'block_sent' : 'block_receive'}`}>{displayName} seems 😀</span>}
  if (sentiment === "NEGATIVE"){ result = <span className={`sentiment ${messageClass === 'sent' ? 'block_sent' : 'block_receive'}`}>{displayName} seems 😡</span>}

  return (<>
        <div className='block'>
          <div className={`message ${messageClass}`}>
            <img src={photoURL || 'https://api.adorable.io/avatars/23/abott@adorable.png'} />
            <p>{text}</p>
          </div>
          {result}
        </div>
  </>)
}


export default App;
