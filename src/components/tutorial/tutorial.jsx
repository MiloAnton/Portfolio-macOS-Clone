import "./tutorial.scss";
import { useState, useEffect } from "react";
import Draggable from 'react-draggable';

export default function Tutorial(props) {
    const [displayed, setDisplayed] = useState(false)

    return (
        <Draggable handle="#handle">
            <section className="tuto_container" style={{ zIndex:props.zIndex }} onMouseDownCapture={() => props.handleClickZIndex()}>
                <div id="handle" style={{ cursor:"grab" }}>
                    <div className="buttons">
                        <div className="quitButton" onClick={() => props.setDisplayed(false)}/>
                        <div className="minimizeButton" />
                        <div className="fullscreenButton" />
                    </div>
                </div>
                <div className="content">
                    <h2>Bienvenue !</h2>
                    <p>Vous pouvez utiliser ce site comme vous le feriez naturellement sur votre ordinateur, et pouvez explorer mon univers.</p>
                    <p><b>Pour fermer cette fenêtre, cliquez sur le bouton rouge en haut à gauche !</b></p>
                </div>
            </section>
        </Draggable>
    )
}