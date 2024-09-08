import { initializeApp } from 'firebase/app';
import { getDatabase } from 'firebase/database';

const firebaseConfig = {
    apiKey: 'AIzaSyB0wEeNod9PqkGDf_h3L9ln9i6ZOEwVyz4',
    authDomain: 'chatforweb-4634e.firebaseapp.com',
    databaseURL: 'https://chatforweb-4634e-default-rtdb.asia-southeast1.firebasedatabase.app',
    projectId: 'chatforweb-4634e',
    storageBucket: 'chatforweb-4634e.appspot.com',
    messagingSenderId: '730984644230',
    appId: '1:730984644230:web:7decd12b96c92acb7e1b07',
};

const app = initializeApp(firebaseConfig);
export const database = getDatabase(app);
