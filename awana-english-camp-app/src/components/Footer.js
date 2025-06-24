import React from 'react';
import './Footer.css';

function Footer() {
  return (
    <div className="footer">
      <img src={`${process.env.PUBLIC_URL}/footer-image.png`} alt="Footer" className="footer-image" />
    </div>
  );
}

export default Footer;
