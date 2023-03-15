import React, { useState } from "react";
import Draggable from "react-draggable";
import MenuBar from "../menu_bar/menu_bar";
import "./InternalBrowser.scss";

const InternalBrowser = (props) => {
  const [url, setUrl] = useState("");

  const handleChange = (event) => {
    setUrl(event.target.value);
  };

  const handleSubmit = (event) => {
    event.preventDefault();
  };

  return (
    <Draggable handle="#handle">
    <div 
        className="InternalBrowser"
        style={{ zIndex: props.zIndex }}
        onMouseDownCapture={() => props.handleClickZIndex()}
    >
      <MenuBar />
      <form onSubmit={handleSubmit} className="internal-browser-form">
        <input
          type="text"
          value={url}
          onChange={handleChange}
          placeholder="Entrez une URL"
          className="internal-browser-input"
        />
        <button type="submit" className="internal-browser-button">
          Aller
        </button>
      </form>
      {url && (
        <iframe
          src={url}
          title="Internal Browser"
          className="internal-browser-iframe"
        />
      )}
    </div>
    </Draggable>
  );
};

export default InternalBrowser;
