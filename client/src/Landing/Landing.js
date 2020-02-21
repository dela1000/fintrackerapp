import React from "react";
import { Link } from "react-router-dom";


export default function Landing() {

  return (
    <div>
      <p>Landing Page</p>
      <Link to="/login">GO TO LOGIN</Link>
    </div>
  );
}
