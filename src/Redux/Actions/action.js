const axios = require('axios');

export const getUser = (user) => {
  const userData = user || axios.get(`http://localhost:8080/api/user`)

  return {
    type:'GET_USER',
    payload: userData
  }
} 