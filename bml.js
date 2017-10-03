(() => {
  // Initialize Firebase
  var config = {
    apiKey: "AIzaSyDtAK2UZTBto-2toH2o-02NdR976nl4CZM",
    authDomain: "chunchun-5bd4a.firebaseapp.com",
    databaseURL: "https://chunchun-5bd4a.firebaseio.com",
    projectId: "chunchun-5bd4a",
    storageBucket: "chunchun-5bd4a.appspot.com",
    messagingSenderId: "1046740590552"
  };
  firebase.initializeApp(config);

  var auth = firebase.auth();
  auth.onAuthStateChanged(user => {
      console.log(user ? user : 'not signed in');
  });

  var sign_in_button = document.createElement('button');
  document.body.insertBefore(sign_in_button, document.body.firstChild);
  sign_in_button.textContent = 'sign in';
  sign_in_button.addEventListener('click', () => {
  var provider = new firebase.auth.GoogleAuthProvider();
  auth.signInWithPopup(provider);
  });
})();
