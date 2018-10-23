import React from 'react'
import ReactDOM from 'react-dom'
// import {Provider} from 'react-redux'
// import store from './store'
import App from './app'

// establishes socket connection
import './socket'

ReactDOM.render(
  // <Provider store={store}>
    <App />
  // </Provider>
  ,
  document.getElementById('app')
)

//uncomment out provider and store imports and the corresponding components
// to configure a redux store
