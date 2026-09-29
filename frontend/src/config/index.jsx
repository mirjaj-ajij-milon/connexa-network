import { default as axios } from "axios";

export const clientServer = axios.create({
  baseURL: ' http://localhost:8000/api/v1',

})

// export const clientServerFile = axios.create({
//     baseURL: 'http://localhost:4000/api/v1/master',
//     headers: {
//         'Content-Type': 'multipart/form-data'
//     }
// }) 