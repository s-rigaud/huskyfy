import request from "./../request";

export default {
  getUserProfile() {
    return request.get("me");
  }
};
