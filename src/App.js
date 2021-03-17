import logo from './logo.svg';
import './App.css';
import firebase from "firebase/app";
import "firebase/auth";
import firebaseConfig from './firebase.config';
import { useState } from 'react';


if (!firebase.apps.length) {
  firebase.initializeApp(firebaseConfig);
} else {
  firebase.app(); // if already initialized, use that one
}


function App() {
  const provider = new firebase.auth.GoogleAuthProvider();
  const fbProvider = new firebase.auth.FacebookAuthProvider();
  const [newUser, setNewUser] = useState(false)
  const [user, setUser] = useState({
    isSignIn: false,
    name: '',
    email: '',
    Photo: '',
    password: '',

  })

  const handleGoogleSingIn = () => {
    firebase.auth()
      .signInWithPopup(provider)
      .then((result) => {
        const { displayName, email, photoURL } = result.user;
        const signedInUser = {
          isSignIn: true,
          name: displayName,
          email: email,
          photo: photoURL
        }
        setUser(signedInUser)
        console.log(signedInUser);
      }).catch((error) => {
        console.log(error.message)

      });
  }
  const handleGoogleSingOut = () => {
    firebase.auth().signOut()
      .then(res => {
        const signOutUser = {
          isSignIn: false,
          name: '',
          email: '',
          Photo: '',
          error: '',
          success: false
        }
        setUser(signOutUser)
      })
      .catch((error) => {
        // An error happened.
      });
  }

  const handleBlur = (e) => {
    let isFieldValid = true;
    if (e.target.name === 'email') {
      isFieldValid = /\S+@\S+\.\S+/.test(e.target.value);
    }
    if (e.target.name === 'password') {
      const isPasswordValid = e.target.value.length > 6;
      const passwordHasNumber = /\d{1}/.test(e.target.value);
      isFieldValid = isPasswordValid && passwordHasNumber
    }
    if (isFieldValid) {
      const newUserInfo = { ...user };
      newUserInfo[e.target.name] = e.target.value;
      setUser(newUserInfo);
    }
  }
  const handleSubmit = (e) => {
    if (newUser && user.email && user.password) {
      console.log("submitting")
      firebase.auth().createUserWithEmailAndPassword(user.email, user.password)
        .then(res => {
          const newUserInfo = { ...user };
          newUserInfo.error = '';
          newUserInfo.success = true;
          setUser(newUserInfo)
          updateUserName(user.name)
        })
        .catch(error => {
          const newUserInfo = { ...user };
          newUserInfo.error = error.message
          newUserInfo.success = false;
          setUser(newUserInfo)
        });
    }
    if (!newUser && user.email && user.password) {
      firebase.auth().signInWithEmailAndPassword(user.email, user.password)
        .then(res => {
          const newUserInfo = { ...user };
          newUserInfo.error = '';
          newUserInfo.success = true;
          setUser(newUserInfo)
          console.log('Sign in user Info', res.user)
        })
        .catch(error => {
          const newUserInfo = { ...user };
          newUserInfo.error = error.message
          newUserInfo.success = false;
          setUser(newUserInfo)
        });
    }
    e.preventDefault();
  }
  const updateUserName = name => {
    const user = firebase.auth().currentUser;

    user.updateProfile({
      displayName: name
    })
      .then(function () {
        console.log('User updated successfully')
      }).catch(function (error) {
        console.log(error)
      });
  }
  const handleFbSignIn = () => {
    firebase
      .auth()
      .signInWithPopup(fbProvider)
      .then((result) => {
        /** @type {firebase.auth.OAuthCredential} */
        var credential = result.credential;

        // The signed-in user info.
        var user = result.user;

        // This gives you a Facebook Access Token. You can use it to access the Facebook API.
        var accessToken = credential.accessToken;
        console.log('FB user', result.user)
        // ...
      })
      .catch((error) => {
        // Handle Errors here.
        var errorCode = error.code;
        var errorMessage = error.message;
        // The email of the user's account used.
        var email = error.email;
        // The firebase.auth.AuthCredential type that was used.
        var credential = error.credential;
        console.log(error.message)

        // ...
      });
  }

  return (
    <div className="App">

      <h1>This is firebase recap</h1>
      {
        user.isSignIn ? <button onClick={handleGoogleSingOut}>Sign Out</button> : <button onClick={handleGoogleSingIn}>Sign In</button>
      }
      <br />
      {
        <button onClick={handleFbSignIn}>Sign In FB</button>
      }
      {
        user.isSignIn && <div>
          <h4>Name: {user.name}</h4>
          <h4>Email: {user.email}</h4>
          <img style={{ width: '300px' }} src={user.photo} alt="" />
        </div>
      }
      <h2>Our Authentication</h2>
      <input type="checkbox" onChange={() => setNewUser(!newUser)} name="newUser" id="" />
      <label htmlFor="newUser">New User Sign Up</label>
      <form action="">
        {newUser && <input name='name' type="text" onBlur={handleBlur} placeholder='Your Name' required />}<br />
        <input type="text" name="email" onBlur={handleBlur} placeholder='Your Email' required /><br />
        <input type="password" name="password" onBlur={handleBlur} id="" placeholder='Your Password' required /><br />
        <input type="submit" onClick={handleSubmit} value={newUser ? 'Sign Up' : 'Sign In'} /><br />
        <p style={{ color: 'red' }}>{user.error}</p>
        {user.success && <p style={{ color: 'green' }}>User {newUser ? "Created" : "Logged In"} Successfully</p>}
      </form>
    </div>
  );
}

export default App;
