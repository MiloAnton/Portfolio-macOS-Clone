import React from 'react';
import Draggable from 'react-draggable';
import MenuBar from '../menu_bar/menu_bar';
import './InternalBrowser.scss';

const InternalBrowser = (props) => {
  const [url, setUrl] = React.useState('');
  const [showHomePage, setShowHomePage] = React.useState(true);

  const handleClick = (newUrl) => {
    setUrl(newUrl);
    handleCloseHomePage();
  };

  const handleCloseHomePage = () => {
    setShowHomePage(false);
  };

  const predefinedLinks = [
    { name: 'NutriCalc', url: 'https://nutricalc.collecty-space.fr' },
    { name: 'Portfolio', url: 'https://miloroche.fr' },
  ];

  return (
    <Draggable handle="#handle">
      <div
        className="InternalBrowser"
        style={{ zIndex: props.zIndex }}
        onMouseDownCapture={() => props.handleClickZIndex()}
      >
        <MenuBar />
        <div className="internal-browser-shortcuts">
          {predefinedLinks.map((link, index) => (
            <button
              key={index}
              className="internal-browser-button"
              onClick={() => handleClick(link.url)}
            >
              {link.name}
            </button>
          ))}
        </div>
        {showHomePage ? (
          <div className="internal-browser-homepage">
            <h2>Bienvenue dans l'InternalBrowser</h2>
            <p>
              Cet InternalBrowser vous permet de naviguer rapidement vers les
              sites prédéfinis en utilisant les raccourcis ci-dessus.
            </p>
          </div>
        ) : (
          url && (
            <iframe
              src={url}
              title="Internal Browser"
              className="internal-browser-iframe"
            />
          )
        )}
      </div>
    </Draggable>
  );
};

export default InternalBrowser;