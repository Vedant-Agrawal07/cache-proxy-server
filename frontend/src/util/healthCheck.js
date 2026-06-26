import axios from "axios";

export const healthChk = async () => {
  try {
    const { data } = await axios.get("http://localhost:3000/api/health");
    if (data.active === "active") {
      console.log("backend running");
      return true;
    }
    return false;
  } catch (error) {
    return false;
  }
};
