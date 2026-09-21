import axios from "axios";
import { Platform } from "react-native";

/*
|--------------------------------------------------------------------------
| KVK SERVER CONFIGURATION
|--------------------------------------------------------------------------
|
| Web development:
|   localhost
|
| Android/iOS production APK:
|   Live KVK API
|
*/

const LOCAL_SERVER_URL = "https://kvkapi.wedpictures.in";
const LIVE_SERVER_URL = "https://kvkapi.wedpictures.in";

let SERVER_URL;

if (Platform.OS === "web") {
  // Expo Web development
  SERVER_URL = LOCAL_SERVER_URL;
} else {
  // Android / iOS standalone app
  SERVER_URL = LIVE_SERVER_URL;
}

export const API_BASE_URL = `${SERVER_URL}/api`;
export const ASSET_BASE_URL = SERVER_URL;

console.log("KVK API BASE URL:", API_BASE_URL);

const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
  timeout: 15000,
});

export default api;
