import request from "./../request";

export default {
  // Return global info about the current logged user
  getUserProfile() {
    return request.get("me");
  }
};
