import axios from "axios";

const API_KEY = "523532";

const request = axios.create({
    baseURL: `https://www.theaudiodb.com/api/v1/json/${API_KEY}`
});

export default request;
